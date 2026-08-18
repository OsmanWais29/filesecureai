// Phase 6 — Form 65 income & expense periods with the deterministic surplus engine.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import { logEstateEvent } from "@/hooks/useEstateRecords";

const db = supabase as unknown as { from: (table: string) => any };

const requireUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to work on estates.");
  return data.user;
};

const num = (v: RecordValues[string]) => Number(v ?? 0) || 0;
const str = (v: RecordValues[string]) => (v == null || v === "" ? null : String(v));
const int = (v: RecordValues[string]) => (v == null || v === "" ? null : Math.trunc(Number(v)) || 0);

/**
 * Superintendent's standards (Directive 11R2) — monthly available income
 * thresholds by household size. Index 0 is unused.
 */
const STANDARDS: Record<string, number[]> = {
  "2024": [0, 2515, 3131, 3849, 4674, 5300, 5978, 6656],
  "2025": [0, 2578, 3209, 3945, 4791, 5433, 6127, 6822],
  "2026": [0, 2645, 3293, 4048, 4916, 5574, 6286, 6999],
};

export const REQUIRED_PERCENTAGE = 50;

export const standardThreshold = (version: string | null | undefined, household: number) => {
  const table = STANDARDS[String(version ?? "2026")] ?? STANDARDS["2026"];
  const size = Math.max(1, Math.trunc(household || 1));
  if (size < table.length) return table[size];
  // Each additional member beyond the published table adds the last increment.
  const last = table[table.length - 1];
  const step = last - table[table.length - 2];
  return last + step * (size - (table.length - 1));
};

export interface SurplusResult {
  threshold: number;
  availableFamilyIncome: number;
  bankruptPortion: number;
  surplus: number;
  requiredPercentage: number;
  amountRequired: number;
  outstanding: number;
}

/** Deterministic rule engine — never fed by AI output. */
export const computeSurplus = (values: RecordValues, paymentsMade = 0): SurplusResult => {
  const bankrupt = num(values.bankruptIncome) || num(values.monthlyIncome);
  const spouse = num(values.spouseIncome);
  const other = num(values.otherFamilyIncome);
  const permitted = num(values.permittedNonDiscretionary) || num(values.nonDiscretionaryExpenses);
  const household = Number(values.householdMembers ?? 1) || 1;

  const familyIncome = bankrupt + spouse + other;
  const available = Math.max(0, familyIncome - permitted);
  const threshold = standardThreshold(str(values.standardVersion), household);
  const surplus = Math.max(0, available - threshold);
  const share = familyIncome > 0 ? bankrupt / familyIncome : 1;
  const bankruptPortion = Number((surplus * share).toFixed(2));
  const amountRequired = Number(((bankruptPortion * REQUIRED_PERCENTAGE) / 100).toFixed(2));
  const agreed = num(values.amountAgreed) || amountRequired;

  return {
    threshold,
    availableFamilyIncome: Number(available.toFixed(2)),
    bankruptPortion,
    surplus: Number(surplus.toFixed(2)),
    requiredPercentage: REQUIRED_PERCENTAGE,
    amountRequired,
    outstanding: Number((agreed - paymentsMade).toFixed(2)),
  };
};

export interface EstateIncomePeriodRow {
  id: string;
  statement_number: number | null;
  year: number | null;
  month: string | null;
  period_label: string | null;
  household_members: number;
  income_basis: string | null;
  monthly_income: number;
  discretionary_expenses: number;
  non_discretionary_expenses: number;
  payment: number;
  bankrupt_income: number;
  spouse_income: number;
  other_family_income: number;
  permitted_non_discretionary: number;
  standard_version: string | null;
  threshold_amount: number;
  available_family_income: number;
  bankrupt_portion: number;
  surplus_amount: number;
  required_percentage: number;
  amount_required: number;
  amount_agreed: number;
  payments_made: number;
  outstanding: number;
  disagreement: boolean;
  status: string;
  comments: string | null;
}

export const useEstateIncomePeriods = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_income_periods", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<EstateIncomePeriodRow[]> => {
      const { data, error } = await db
        .from("estate_income_periods")
        .select("*")
        .eq("estate_id", estateId)
        .order("year", { ascending: true })
        .order("statement_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EstateIncomePeriodRow[];
    },
  });

export const incomePeriodToValues = (p: EstateIncomePeriodRow): RecordValues => ({
  statementNumber: p.statement_number ?? 0,
  year: p.year ?? new Date().getFullYear(),
  month: p.month ?? "",
  householdMembers: p.household_members,
  incomeBasis: p.income_basis ?? "",
  monthlyIncome: p.monthly_income,
  discretionaryExpenses: p.discretionary_expenses,
  nonDiscretionaryExpenses: p.non_discretionary_expenses,
  payment: p.payment,
  bankruptIncome: p.bankrupt_income,
  spouseIncome: p.spouse_income,
  otherFamilyIncome: p.other_family_income,
  permittedNonDiscretionary: p.permitted_non_discretionary,
  standardVersion: p.standard_version ?? "2026",
  availableFamilyIncome: p.available_family_income,
  bankruptPortion: p.bankrupt_portion,
  surplusOrDeficit: p.surplus_amount,
  requiredPercentage: p.required_percentage,
  amountRequired: p.amount_required,
  amountAgreed: p.amount_agreed,
  paymentsMade: p.payments_made,
  outstanding: p.outstanding,
  disagreement: p.disagreement,
  comments: p.comments ?? "",
});

export const useSaveIncomePeriod = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, id }: { values: RecordValues; id?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const paymentsMade = num(values.paymentsMade);
      const calc = computeSurplus(values, paymentsMade);
      const month = str(values.month);
      const year = int(values.year);

      const row = {
        statement_number: int(values.statementNumber),
        year,
        month,
        period_label: [month, year].filter(Boolean).join(" ") || null,
        household_members: Math.max(1, Number(values.householdMembers ?? 1) || 1),
        income_basis: str(values.incomeBasis),
        monthly_income: num(values.monthlyIncome),
        discretionary_expenses: num(values.discretionaryExpenses),
        non_discretionary_expenses: num(values.nonDiscretionaryExpenses),
        payment: num(values.payment),
        bankrupt_income: num(values.bankruptIncome) || num(values.monthlyIncome),
        spouse_income: num(values.spouseIncome),
        other_family_income: num(values.otherFamilyIncome),
        permitted_non_discretionary:
          num(values.permittedNonDiscretionary) || num(values.nonDiscretionaryExpenses),
        standard_version: str(values.standardVersion) ?? "2026",
        threshold_amount: calc.threshold,
        available_family_income: calc.availableFamilyIncome,
        bankrupt_portion: calc.bankruptPortion,
        surplus_amount: calc.surplus,
        required_percentage: calc.requiredPercentage,
        amount_required: calc.amountRequired,
        amount_agreed: num(values.amountAgreed) || calc.amountRequired,
        payments_made: paymentsMade,
        outstanding: calc.outstanding,
        disagreement: Boolean(values.disagreement),
        status: num(values.monthlyIncome) > 0 ? "Received" : "Missing",
        comments: str(values.comments),
      };

      const query = id
        ? db.from("estate_income_periods").update(row).eq("id", id)
        : db
            .from("estate_income_periods")
            .insert({ ...row, estate_id: estateId, user_id: user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;

      await logEstateEvent({
        estateId,
        eventType: id ? "income_period.updated" : "income_period.created",
        after: {
          period: row.period_label,
          surplus: calc.surplus,
          amount_required: calc.amountRequired,
        },
      });
      return data as EstateIncomePeriodRow;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["estate_income_periods", estateId] });
      toast({
        title: "Statement saved",
        description: `Surplus ${row.surplus_amount.toLocaleString()} · required payment ${row.amount_required.toLocaleString()}.`,
      });
    },
    onError: (e: Error) => toast({ title: "Could not save statement", description: e.message, variant: "destructive" }),
  });
};
