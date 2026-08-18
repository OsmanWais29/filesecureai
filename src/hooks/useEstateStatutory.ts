// Phase 6 — counselling sessions, tax returns and required tax documents.
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

const useRows = <T,>(table: string, estateId?: string) =>
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

const useSaveRow = <T,>(table: string, estateId?: string, toRow?: (v: RecordValues) => Record<string, unknown>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, id }: { values: RecordValues; id?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const row = toRow ? toRow(values) : {};
      const query = id
        ? db.from(table).update(row).eq("id", id)
        : db.from(table).insert({ ...row, estate_id: estateId, user_id: user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      await logEstateEvent(estateId, `${table}.${id ? "updated" : "created"}`, row);
      return data as T;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table, estateId] });
      toast({ title: "Saved" });
    },
    onError: (e: Error) => toast({ title: "Could not save", description: e.message, variant: "destructive" }),
  });
};

// ---------------------------------------------------------------- counselling
export interface CounsellingSessionRow {
  id: string;
  session_number: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  location: string | null;
  counsellor: string | null;
  third_party_firm: string | null;
  address: string | null;
  completed: boolean;
  date_invoiced: string | null;
  refused: boolean;
  neglected: boolean;
  details: string | null;
  comments: string | null;
  source_document: string | null;
  certificate_generated: boolean;
}

export const useCounsellingSessions = (estateId?: string) =>
  useRows<CounsellingSessionRow>("estate_counselling_sessions", estateId);

export const counsellingToValues = (s: CounsellingSessionRow): RecordValues => ({
  sessionNumber: s.session_number ?? "",
  appointmentDate: s.appointment_date ?? "",
  appointmentTime: s.appointment_time ?? "",
  location: s.location ?? "",
  counsellor: s.counsellor ?? "",
  thirdPartyFirm: s.third_party_firm ?? "",
  address: s.address ?? "",
  completed: s.completed,
  dateInvoiced: s.date_invoiced ?? "",
  refused: s.refused,
  neglected: s.neglected,
  details: s.details ?? "",
  comments: s.comments ?? "",
  sourceDocument: s.source_document ?? "",
  generateCertificate: s.certificate_generated,
});

export const useSaveCounsellingSession = (estateId?: string) =>
  useSaveRow<CounsellingSessionRow>("estate_counselling_sessions", estateId, (v) => ({
    session_number: str(v.sessionNumber),
    appointment_date: str(v.appointmentDate),
    appointment_time: str(v.appointmentTime),
    location: str(v.location),
    counsellor: str(v.counsellor),
    third_party_firm: str(v.thirdPartyFirm),
    address: str(v.address),
    completed: Boolean(v.completed),
    date_invoiced: str(v.dateInvoiced),
    refused: Boolean(v.refused),
    neglected: Boolean(v.neglected),
    details: str(v.details),
    comments: str(v.comments),
    source_document: str(v.sourceDocument),
    certificate_generated: Boolean(v.generateCertificate),
  }));

// ----------------------------------------------------------------------- tax
export interface TaxReturnRow {
  id: string;
  return_type: string | null;
  year: number | null;
  jurisdiction: string | null;
  source: string | null;
  status: string | null;
  date_filed: string | null;
  assessment_date: string | null;
  follow_up_months: number | null;
  reminder_date: string | null;
  completed: boolean;
  estimated_amount: number;
  amount_deposited: number;
  disposition: string | null;
  disposition_date: string | null;
  preparer_name: string | null;
  date_forwarded: string | null;
  date_prepared: string | null;
  date_paid: string | null;
  preparation_charge: number;
}

export const useTaxReturns = (estateId?: string) => useRows<TaxReturnRow>("estate_tax_returns", estateId);

export const taxReturnToValues = (r: TaxReturnRow): RecordValues => ({
  returnType: r.return_type ?? "",
  year: r.year ?? new Date().getFullYear(),
  jurisdiction: r.jurisdiction ?? "",
  source: r.source ?? "",
  status: r.status ?? "",
  dateFiled: r.date_filed ?? "",
  assessmentDate: r.assessment_date ?? "",
  followUpMonths: r.follow_up_months ?? 0,
  reminderDate: r.reminder_date ?? "",
  completed: r.completed,
  estimatedAmount: r.estimated_amount,
  amountDeposited: r.amount_deposited,
  disposition: r.disposition ?? "",
  dispositionDate: r.disposition_date ?? "",
  preparerName: r.preparer_name ?? "",
  dateForwarded: r.date_forwarded ?? "",
  datePrepared: r.date_prepared ?? "",
  datePaid: r.date_paid ?? "",
  preparationCharge: r.preparation_charge,
});

export const useSaveTaxReturn = (estateId?: string) =>
  useSaveRow<TaxReturnRow>("estate_tax_returns", estateId, (v) => ({
    return_type: str(v.returnType),
    year: int(v.year),
    jurisdiction: str(v.jurisdiction),
    source: str(v.source),
    status: str(v.status),
    date_filed: str(v.dateFiled),
    assessment_date: str(v.assessmentDate),
    follow_up_months: int(v.followUpMonths),
    reminder_date: str(v.reminderDate),
    completed: Boolean(v.completed),
    estimated_amount: num(v.estimatedAmount),
    amount_deposited: num(v.amountDeposited),
    disposition: str(v.disposition),
    disposition_date: str(v.dispositionDate),
    preparer_name: str(v.preparerName),
    date_forwarded: str(v.dateForwarded),
    date_prepared: str(v.datePrepared),
    date_paid: str(v.datePaid),
    preparation_charge: num(v.preparationCharge),
  }));

export interface TaxDocumentRow {
  id: string;
  doc_type: string | null;
  tax_year: number | null;
  required: boolean;
  received: boolean;
  verified: boolean;
  linked_document: string | null;
  requested_date: string | null;
  received_date: string | null;
  reminder_date: string | null;
}

export const useTaxDocuments = (estateId?: string) => useRows<TaxDocumentRow>("estate_tax_documents", estateId);

export const taxDocumentToValues = (d: TaxDocumentRow): RecordValues => ({
  docType: d.doc_type ?? "",
  taxYear: d.tax_year ?? new Date().getFullYear(),
  required: d.required,
  received: d.received,
  verified: d.verified,
  linkedDocument: d.linked_document ?? "",
  requestedDate: d.requested_date ?? "",
  receivedDate: d.received_date ?? "",
  reminderDate: d.reminder_date ?? "",
});

export const useSaveTaxDocument = (estateId?: string) =>
  useSaveRow<TaxDocumentRow>("estate_tax_documents", estateId, (v) => ({
    doc_type: str(v.docType),
    tax_year: int(v.taxYear),
    required: Boolean(v.required),
    received: Boolean(v.received),
    verified: Boolean(v.verified),
    linked_document: str(v.linkedDocument),
    requested_date: str(v.requestedDate),
    received_date: str(v.receivedDate),
    reminder_date: str(v.reminderDate),
  }));
