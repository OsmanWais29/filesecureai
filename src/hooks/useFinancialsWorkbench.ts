import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { computeSurplus } from "@/hooks/useEstateIncome";
import { logEstateEvent } from "@/hooks/useEstateRecords";
import { MONTHS, type ClientReportLite } from "@/lib/financials/financialsEngine";

const db = supabase as unknown as { from: (table: string) => any };

export const useClientIncomeReports = (estateId?: string) =>
  useQuery({
    queryKey: ["fin-client-reports", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<(ClientReportLite & { household: any; income: any; expenses: any })[]> => {
      const { data, error } = await db.from("client_portal_income_submissions").select("*").eq("estate_id", estateId).order("period_month");
      if (error) throw error;
      return data ?? [];
    },
  });

export const useClientDocsToReview = (estateId?: string) =>
  useQuery({
    queryKey: ["fin-client-docs", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<number> => {
      const { count, error } = await db.from("client_portal_documents").select("id", { count: "exact", head: true }).eq("estate_id", estateId).in("review_state", ["Received", "Not started", "Pending", "pending"]);
      if (error) throw error;
      return count ?? 0;
    },
  });

const n = (v: unknown) => Number(v) || 0;
const sum = (o: Record<string, unknown> | null | undefined) => Object.values(o ?? {}).reduce<number>((t, v) => t + n(v), 0);

/** Brings a client's monthly report in as the estate's income record for that month. */
export const useImportClientReport = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: ClientReportLite & { household: any; income: any; expenses: any }) => {
      if (!estateId) throw new Error("No estate selected.");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in.");
      const [y, m] = report.period_month.slice(0, 7).split("-").map(Number);
      const income = n(report.totals?.totalIncome) || sum(report.income);
      const expenses = n(report.totals?.totalExpenses) || sum(report.expenses);
      const household = Math.max(1, n(report.household?.size) || 1);
      const standardVersion = String(y);
      const values = { monthlyIncome: income, nonDiscretionaryExpenses: expenses, householdMembers: household, standardVersion };
      const calc = computeSurplus(values);
      const row = {
        estate_id: estateId, user_id: auth.user.id, year: y, month: MONTHS[m - 1], period_label: `${MONTHS[m - 1]} ${y}`,
        household_members: household, income_basis: "Client monthly report", monthly_income: income, bankrupt_income: income,
        non_discretionary_expenses: expenses, permitted_non_discretionary: expenses, standard_version: standardVersion,
        threshold_amount: calc.threshold, available_family_income: calc.availableFamilyIncome, bankrupt_portion: calc.bankruptPortion,
        surplus_amount: calc.surplus, required_percentage: calc.requiredPercentage, amount_required: calc.amountRequired,
        amount_agreed: calc.amountRequired, outstanding: calc.outstanding, status: "Received",
        comments: "Brought in from the client's portal report; review before relying on it.",
      };
      const { data, error } = await db.from("estate_income_periods").insert(row).select("id").single();
      if (error) throw error;
      const { error: linkErr } = await db.from("client_portal_income_submissions").update({ linked_income_period_id: data.id, review_state: "Accepted", reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", report.id);
      if (linkErr) throw new Error(`Income record saved, but the client report could not be marked as used: ${linkErr.message}`);
      await logEstateEvent({ estateId, eventType: "INCOME_PERIOD_IMPORTED", after: { period: row.period_label, income, expenses }, source: "client_portal" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_income_periods", estateId] });
      qc.invalidateQueries({ queryKey: ["fin-client-reports", estateId] });
    },
  });
};

export interface IncomeExtraction {
  document_type: string; payer?: string | null; period_start?: string | null; period_end?: string | null; pay_date?: string | null;
  pay_frequency?: string | null; gross_pay?: number | null; net_pay?: number | null; deductions?: number | null; confidence: number; notes: string;
}
export interface ReviewDoc { id: string; title: string; file_name: string; mime_type: string | null; created_at: string }

export const useClientDocsList = (estateId?: string) =>
  useQuery({
    queryKey: ["fin-client-docs-list", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<ReviewDoc[]> => {
      const { data, error } = await db.from("client_portal_documents").select("id,title,file_name,mime_type,created_at").eq("estate_id", estateId).in("review_state", ["Received", "Not started", "Pending", "pending"]).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

/** AI reads a client document and returns draft figures. Nothing is saved. */
export const useReadIncomeDocument = () =>
  useMutation({
    mutationFn: async (documentId: string): Promise<IncomeExtraction> => {
      const { data, error } = await supabase.functions.invoke("read-income-document", { body: { documentId } });
      if (error) {
        let msg = error.message;
        try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* keep */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return data.extraction;
    },
  });

/** Monthly equivalent of a single pay amount (CRA-style frequencies). */
export const monthlyFromPay = (amount: number, freq?: string | null): number | null => {
  const f = { weekly: 52 / 12, biweekly: 26 / 12, semimonthly: 2, monthly: 1 }[String(freq ?? "")];
  return f ? Math.round(amount * f * 100) / 100 : null;
};

/** Trustee-confirmed: saves AI-read income as a draft month the trustee finishes in Income. */
export const useSaveReadIncome = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { documentId: string; month: string; monthlyIncome: number; payer?: string | null }) => {
      if (!estateId) throw new Error("No estate selected.");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in.");
      const [y, m] = v.month.split("-").map(Number);
      const { error } = await db.from("estate_income_periods").insert({
        estate_id: estateId, user_id: auth.user.id, year: y, month: MONTHS[m - 1], period_label: `${MONTHS[m - 1]} ${y}`,
        income_basis: "AI-read document (trustee confirmed)", monthly_income: v.monthlyIncome, bankrupt_income: v.monthlyIncome,
        standard_version: String(y), status: "Draft",
        comments: `Read from client document${v.payer ? ` (${v.payer})` : ""}. Add household size and expenses before relying on surplus.`,
      });
      if (error) throw error;
      await db.from("client_portal_documents").update({ review_state: "Accepted", reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", v.documentId);
      await logEstateEvent({ estateId, eventType: "INCOME_READ_FROM_DOCUMENT", after: { month: v.month, monthlyIncome: v.monthlyIncome, documentId: v.documentId }, source: "ai_extraction_confirmed" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_income_periods", estateId] });
      qc.invalidateQueries({ queryKey: ["fin-client-docs", estateId] });
      qc.invalidateQueries({ queryKey: ["fin-client-docs-list", estateId] });
    },
  });
};
