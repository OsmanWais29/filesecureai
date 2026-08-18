// Phase 5 — creditor, proof-of-claim and creditor-meeting persistence.
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
const bool = (v: RecordValues[string]) => Boolean(v);

export interface EstateCreditorRow {
  id: string;
  master_creditor: string | null;
  legal_name: string;
  account_number: string | null;
  head_office: boolean;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  creditor_type: string | null;
  soa_amount: number;
  contingent_amount: number;
  deferred_amount: number;
  other_amount: number;
  poc_filed: boolean;
  received_date: string | null;
  claim_status: string | null;
  filed_amount: number;
  admitted_voting: number;
  admitted_dividend: number;
  claim_class: string | null;
  rank: number | null;
  reasons: string | null;
  completed: boolean;
  meeting_requested: boolean;
  report_170_requested: boolean;
  material_change_requested: boolean;
  amended_payments_requested: boolean;
}

export interface EstateMeetingRow {
  id: string;
  voting_round: number | null;
  notice_sent_date: string | null;
  meeting_date: string | null;
  meeting_time: string | null;
  location: string | null;
  chairperson: string | null;
  amendment_made_by: string | null;
  deemed_approval: boolean;
  deemed_approval_date: string | null;
  notes: string | null;
}

const list = <T,>(table: string, estateId?: string) =>
  useQuery({
    queryKey: [table, estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await db
        .from(table)
        .select("*")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });

export const useEstateCreditors = (estateId?: string) =>
  list<EstateCreditorRow>("estate_creditors", estateId);

export const creditorToValues = (c: EstateCreditorRow): RecordValues => ({
  masterCreditor: c.master_creditor ?? "",
  legalName: c.legal_name,
  accountNumber: c.account_number ?? "",
  headOffice: c.head_office,
  address1: c.address1 ?? "",
  address2: c.address2 ?? "",
  city: c.city ?? "",
  province: c.province ?? "",
  postalCode: c.postal_code ?? "",
  country: c.country ?? "",
  phone: c.phone ?? "",
  email: c.email ?? "",
  creditorType: c.creditor_type ?? "",
  soaAmount: c.soa_amount,
  contingentAmount: c.contingent_amount,
  deferredAmount: c.deferred_amount,
  otherAmount: c.other_amount,
  pocFiled: c.poc_filed,
  receivedDate: c.received_date ?? "",
  claimStatus: c.claim_status ?? "",
  filedAmount: c.filed_amount,
  admittedVoting: c.admitted_voting,
  admittedDividend: c.admitted_dividend,
  claimClass: c.claim_class ?? "",
  rank: c.rank ?? 0,
  reasons: c.reasons ?? "",
  completed: c.completed,
  meetingRequested: c.meeting_requested,
  report170Requested: c.report_170_requested,
  materialChangeRequested: c.material_change_requested,
  amendedPaymentsRequested: c.amended_payments_requested,
});

const creditorRow = (values: RecordValues) => ({
  master_creditor: str(values.masterCreditor),
  legal_name: str(values.legalName) ?? str(values.masterCreditor) ?? "Unnamed creditor",
  account_number: str(values.accountNumber),
  head_office: bool(values.headOffice),
  address1: str(values.address1),
  address2: str(values.address2),
  city: str(values.city),
  province: str(values.province),
  postal_code: str(values.postalCode),
  country: str(values.country),
  phone: str(values.phone),
  email: str(values.email),
  creditor_type: str(values.creditorType),
  soa_amount: num(values.soaAmount),
  contingent_amount: num(values.contingentAmount),
  deferred_amount: num(values.deferredAmount),
  other_amount: num(values.otherAmount),
  poc_filed: bool(values.pocFiled),
  received_date: str(values.receivedDate),
  claim_status: str(values.claimStatus),
  filed_amount: num(values.filedAmount),
  admitted_voting: num(values.admittedVoting),
  admitted_dividend: num(values.admittedDividend),
  claim_class: str(values.claimClass),
  rank: values.rank == null || values.rank === "" ? null : Number(values.rank),
  reasons: str(values.reasons),
  completed: bool(values.completed),
  meeting_requested: bool(values.meetingRequested),
  report_170_requested: bool(values.report170Requested),
  material_change_requested: bool(values.materialChangeRequested),
  amended_payments_requested: bool(values.amendedPaymentsRequested),
});

export const useSaveCreditor = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, id }: { values: RecordValues; id?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const row = creditorRow(values);
      // A claim cannot be admitted for more than it was filed for.
      if (row.admitted_voting > row.filed_amount || row.admitted_dividend > row.filed_amount) {
        throw new Error("Admitted amounts cannot exceed the filed amount.");
      }
      const query = id
        ? db.from("estate_creditors").update(row).eq("id", id)
        : db.from("estate_creditors").insert({ ...row, estate_id: estateId, user_id: user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: id ? "estate.creditor.updated" : "estate.creditor.created",
        after: data,
      });
      return data as EstateCreditorRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_creditors", estateId] });
      toast({ title: "Creditor saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save creditor", description: e.message, variant: "destructive" }),
  });
};

export const useEstateMeetings = (estateId?: string) =>
  list<EstateMeetingRow>("estate_creditor_meetings", estateId);

export const useSaveMeeting = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: RecordValues) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { data, error } = await db
        .from("estate_creditor_meetings")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          voting_round: values.votingRound ? Number(values.votingRound) : null,
          notice_sent_date: str(values.noticeSentDate),
          meeting_date: str(values.meetingDate),
          meeting_time: str(values.meetingTime),
          location: str(values.location),
          chairperson: str(values.chairperson),
          amendment_made_by: str(values.amendmentMadeBy),
          deemed_approval: bool(values.deemedApproval),
          deemed_approval_date: str(values.deemedApprovalDate),
          notes: str(values.notes),
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.creditor_meeting.created", after: data });
      return data as EstateMeetingRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_creditor_meetings", estateId] });
      toast({ title: "Meeting saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save meeting", description: e.message, variant: "destructive" }),
  });
};
