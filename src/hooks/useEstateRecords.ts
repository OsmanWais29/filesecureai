// Database-backed estate hooks. The `estates`, `estate_dates`,
// `estate_assignments` and `estate_events` tables are the source of truth —
// react-query only caches them.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import {
  EstateRow,
  derivedDebtorName,
  rowToSummary,
  valuesToRow,
} from "@/data/estateRecordMapping";
import type { EstateSummary } from "@/data/estateWorkspace";

const db = supabase as unknown as {
  from: (table: string) => any;
  auth: typeof supabase.auth;
};

const requireUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to work on estates.");
  return data.user;
};

export interface EstateDateRow {
  id: string;
  estate_id: string;
  date_group: string;
  date_type: string;
  date_value: string | null;
  time_value: string | null;
  source_type: string;
  source_document: string | null;
  source_page: string | null;
  entered_by: string | null;
  extracted_by: string | null;
  confidence: number | null;
  confirmed_by: string | null;
  confirmed_date: string | null;
  previous_value: string | null;
  change_reason: string | null;
}

/** Append-only audit event. Never blocks the caller's primary action. */
export const logEstateEvent = async (input: {
  estateId: string;
  eventType: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  source?: string;
}) => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await db.from("estate_events").insert({
      estate_id: input.estateId,
      user_id: data.user.id,
      event_type: input.eventType,
      actor: data.user.email ?? data.user.id,
      actor_type: "user",
      before_state: input.before ?? null,
      after_state: input.after ?? null,
      reason: input.reason ?? null,
      source: input.source ?? "estate_workspace",
    });
  } catch {
    // Audit logging must never break the user's action; surfaced via activity tab gaps.
  }
};

// ---------------------------------------------------------------------------
// Estates
// ---------------------------------------------------------------------------
export const useEstateRows = () =>
  useQuery({
    queryKey: ["estate-rows"],
    queryFn: async (): Promise<EstateRow[]> => {
      await requireUser();
      const { data, error } = await db
        .from("estates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EstateRow[];
    },
  });

export const useEstateRow = (estateId?: string) =>
  useQuery({
    queryKey: ["estate-row", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<EstateRow | null> => {
      const { data, error } = await db.from("estates").select("*").eq("id", estateId).maybeSingle();
      if (error) throw error;
      return (data ?? null) as EstateRow | null;
    },
  });

export const useEstateSummaries = (): { estates: EstateSummary[]; isLoading: boolean; error: unknown } => {
  const { data, isLoading, error } = useEstateRows();
  return { estates: (data ?? []).map(rowToSummary), isLoading, error };
};

export const useCreateEstateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, clientId }: { values: RecordValues; clientId?: string }) => {
      const user = await requireUser();
      const row = valuesToRow(values);
      const debtorName = derivedDebtorName(values);
      const { data, error } = await db
        .from("estates")
        .insert({
          ...row,
          debtor_name: debtorName,
          file_number: row.osb_estate_number ?? null,
          estate_type:
            String(values.proceedingType ?? "").toLowerCase().includes("proposal")
              ? "consumer_proposal"
              : "bankruptcy",
          status: row.status ?? "open",
          client_id: clientId ?? null,
          user_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId: data.id, eventType: "estate.created", after: data });
      return data as EstateRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estate-rows"] }),
    onError: (e: Error) =>
      toast({ title: "Could not create estate", description: e.message, variant: "destructive" }),
  });
};

export const useUpdateEstateRecord = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, eventType }: { values: RecordValues; eventType?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      await requireUser();
      const { data: before } = await db.from("estates").select("*").eq("id", estateId).maybeSingle();
      const row = valuesToRow(values);
      const patch: EstateRow = { ...row };
      if ("debtor_kind" in row || "first_name" in row || "corporate_name" in row) {
        patch.debtor_name = derivedDebtorName(values);
      }
      if (row.osb_estate_number) patch.file_number = row.osb_estate_number;
      const { data, error } = await db
        .from("estates")
        .update(patch)
        .eq("id", estateId)
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: eventType ?? "estate.updated",
        before,
        after: data,
      });
      return data as EstateRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate-rows"] });
      qc.invalidateQueries({ queryKey: ["estate-row", estateId] });
      toast({ title: "Estate saved", description: "Changes persisted and recorded in the audit ledger." });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save estate", description: e.message, variant: "destructive" }),
  });
};

// ---------------------------------------------------------------------------
// Significant dates (canonical register)
// ---------------------------------------------------------------------------
export const useEstateDates = (estateId?: string) =>
  useQuery({
    queryKey: ["estate-dates", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<EstateDateRow[]> => {
      const { data, error } = await db
        .from("estate_dates")
        .select("*")
        .eq("estate_id", estateId)
        .order("date_group", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EstateDateRow[];
    },
  });

export const useSaveEstateDate = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      dateGroup: string;
      dateType: string;
      dateValue?: string | null;
      timeValue?: string | null;
      sourceType: string;
      sourceDocument?: string | null;
      sourcePage?: string | null;
      confirmedBy?: string | null;
      changeReason?: string | null;
      previousValue?: string | null;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { data, error } = await db
        .from("estate_dates")
        .upsert(
          {
            estate_id: estateId,
            user_id: user.id,
            date_group: input.dateGroup,
            date_type: input.dateType,
            date_value: input.dateValue || null,
            time_value: input.timeValue || null,
            source_type: input.sourceType,
            source_document: input.sourceDocument || null,
            source_page: input.sourcePage || null,
            entered_by: user.email ?? user.id,
            confirmed_by: input.confirmedBy || null,
            confirmed_date: input.confirmedBy ? new Date().toISOString() : null,
            previous_value: input.previousValue || null,
            change_reason: input.changeReason || null,
          },
          { onConflict: "estate_id,date_type" }
        )
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: input.previousValue ? "estate.date.changed" : "estate.date.created",
        before: input.previousValue ? { date_value: input.previousValue } : null,
        after: data,
        reason: input.changeReason ?? undefined,
      });
      return data as EstateDateRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate-dates", estateId] });
      toast({ title: "Date saved", description: "Recorded in the canonical date register." });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save date", description: e.message, variant: "destructive" }),
  });
};

// ---------------------------------------------------------------------------
// Assignments + audit ledger
// ---------------------------------------------------------------------------
export const useEstateAssignments = (estateId?: string) =>
  useQuery({
    queryKey: ["estate-assignments", estateId],
    enabled: Boolean(estateId),
    queryFn: async () => {
      const { data, error } = await db
        .from("estate_assignments")
        .select("*")
        .eq("estate_id", estateId)
        .order("effective_from", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useRecordAssignment = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { role: string; assigneeName: string; effectiveFrom?: string; reason?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      // Close the current holder of this role rather than destroying history.
      await db
        .from("estate_assignments")
        .update({ effective_to: input.effectiveFrom ?? new Date().toISOString().slice(0, 10) })
        .eq("estate_id", estateId)
        .eq("role", input.role)
        .is("effective_to", null);

      const { data, error } = await db
        .from("estate_assignments")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          role: input.role,
          assignee_name: input.assigneeName,
          effective_from: input.effectiveFrom ?? new Date().toISOString().slice(0, 10),
          assigned_by: user.email ?? user.id,
          reason: input.reason ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.assignment.changed", after: data });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estate-assignments", estateId] }),
  });
};

export const useEstateEvents = (estateId?: string) =>
  useQuery({
    queryKey: ["estate-events", estateId],
    enabled: Boolean(estateId),
    queryFn: async () => {
      const { data, error } = await db
        .from("estate_events")
        .select("*")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });