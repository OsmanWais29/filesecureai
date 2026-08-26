import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientPriority, ClientRequestStatus, ClientRequestType } from "./types";

/**
 * Trustee-side repository for the client portal.
 *
 * Staff read and review exactly the same rows the client works on — there is no
 * second copy of the truth. Review transitions (accept / return for more
 * information) are staff-only: the client's RLS policy cannot set them.
 */

const db = supabase as any;
const nowIso = () => new Date().toISOString();

type Row = Record<string, any>;

/* ---------------------------------------------------------------- requests */

export interface StaffRequest {
  id: string;
  estateId: string;
  title: string;
  description: string;
  requestType: ClientRequestType;
  dueDate?: string;
  priority: ClientPriority;
  status: ClientRequestStatus;
  clientResponse?: string;
  trusteeReviewState: string;
  reviewNote?: string;
  requestedByName?: string;
  requestedAt: string;
  completedAt?: string;
  sourceSignalId?: string;
  sourceDocumentId?: string;
}

const toStaffRequest = (r: Row): StaffRequest => ({
  id: r.id,
  estateId: r.estate_id,
  title: r.title,
  description: r.description ?? "",
  requestType: r.request_type,
  dueDate: r.due_date ?? undefined,
  priority: r.priority,
  status: r.status,
  clientResponse: r.client_response ?? undefined,
  trusteeReviewState: r.trustee_review_state,
  reviewNote: r.review_note ?? undefined,
  requestedByName: r.requested_by_name ?? undefined,
  requestedAt: r.requested_at,
  completedAt: r.completed_at ?? undefined,
  sourceSignalId: r.source_signal_id ?? undefined,
  sourceDocumentId: r.source_document_id ?? undefined,
});

export const useStaffRequests = (estateId?: string) =>
  useQuery({
    queryKey: ["staff-portal-requests", estateId],
    enabled: !!estateId,
    queryFn: async (): Promise<StaffRequest[]> => {
      const { data, error } = await db
        .from("client_portal_requests")
        .select("*")
        .eq("estate_id", estateId)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toStaffRequest);
    },
  });

export interface NewRequestInput {
  estateId: string;
  title: string;
  description: string;
  requestType: ClientRequestType;
  requestedDocumentType?: string;
  dueDate?: string;
  priority: ClientPriority;
  staffName: string;
  staffNote?: string;
  sourceSignalId?: string;
  sourceDocumentId?: string;
}

export const useCreateStaffRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewRequestInput) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await db
        .from("client_portal_requests")
        .insert({
          estate_id: input.estateId,
          title: input.title,
          description: input.description,
          request_type: input.requestType,
          requested_document_type: input.requestedDocumentType ?? null,
          source_signal_id: input.sourceSignalId ?? null,
          source_document_id: input.sourceDocumentId ?? null,
          due_date: input.dueDate ?? null,
          priority: input.priority,
          status: "Action Required",
          requested_by: auth?.user?.id ?? null,
          requested_by_name: input.staffName,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (input.staffNote?.trim()) {
        await db.from("client_portal_request_staff_notes").insert({
          request_id: data.id,
          estate_id: input.estateId,
          note: input.staffNote.trim(),
          author_id: auth?.user?.id ?? null,
          author_name: input.staffName,
        });
      }

      await db.from("client_portal_events").insert({
        estate_id: input.estateId,
        event_type: "CLIENT_REQUEST_SENT",
        actor_user_id: auth?.user?.id ?? null,
        actor_name: input.staffName,
        actor_role: "staff",
        request_id: data.id,
        detail: input.title,
      });

      return data.id as string;
    },
    onSuccess: (_id, vars) => {
      qc.invalidateQueries({ queryKey: ["staff-portal-requests", vars.estateId] });
      qc.invalidateQueries({ queryKey: ["portal-events", vars.estateId] });
    },
  });
};

export const useReviewStaffRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      request,
      outcome,
      note,
      staffName,
    }: {
      request: StaffRequest;
      outcome: "Under Review" | "Completed" | "More Information Needed";
      note?: string;
      staffName: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await db
        .from("client_portal_requests")
        .update({
          status: outcome,
          trustee_review_state:
            outcome === "Completed" ? "Accepted" : outcome === "More Information Needed" ? "Returned" : "In review",
          review_note: note ?? null,
          reviewed_by: auth?.user?.id ?? null,
          reviewed_at: nowIso(),
          completed_at: outcome === "Completed" ? nowIso() : null,
        })
        .eq("id", request.id);
      if (error) throw error;

      await db.from("client_portal_events").insert({
        estate_id: request.estateId,
        event_type: "CLIENT_REQUEST_REVIEWED",
        actor_user_id: auth?.user?.id ?? null,
        actor_name: staffName,
        actor_role: "staff",
        request_id: request.id,
        previous_state: request.status,
        new_state: outcome,
        detail: note ?? null,
      });
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["staff-portal-requests", vars.request.estateId] }),
  });
};

export const useStaffMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      estateId,
      body,
      staffName,
      relatedRequestId,
    }: {
      estateId: string;
      body: string;
      staffName: string;
      relatedRequestId?: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await db.from("client_portal_messages").insert({
        estate_id: estateId,
        body,
        sender_user_id: auth?.user?.id ?? null,
        sender_name: staffName,
        sender_role: "staff",
        related_request_id: relatedRequestId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["staff-portal-messages", vars.estateId] }),
  });
};

/* --------------------------------------------------- submissions to review */

export const useStaffSubmissions = (estateId?: string) =>
  useQuery({
    queryKey: ["staff-portal-submissions", estateId],
    enabled: !!estateId,
    queryFn: async () => {
      const [docs, intake, income] = await Promise.all([
        db.from("client_portal_documents").select("*").eq("estate_id", estateId).order("uploaded_at", { ascending: false }),
        db.from("client_portal_intake_sections").select("*").eq("estate_id", estateId),
        db.from("client_portal_income_submissions").select("*").eq("estate_id", estateId).order("period_month", { ascending: false }),
      ]);
      if (docs.error) throw docs.error;
      if (intake.error) throw intake.error;
      if (income.error) throw income.error;
      return {
        documents: (docs.data ?? []) as Row[],
        intake: (intake.data ?? []) as Row[],
        income: (income.data ?? []) as Row[],
      };
    },
  });

type ReviewTarget = "documents" | "intake" | "income";

const TABLES: Record<ReviewTarget, string> = {
  documents: "client_portal_documents",
  intake: "client_portal_intake_sections",
  income: "client_portal_income_submissions",
};

/** Single staff review transition for any client submission surface. */
export const useReviewSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      id,
      estateId,
      accept,
      note,
      staffName,
    }: {
      target: ReviewTarget;
      id: string;
      estateId: string;
      accept: boolean;
      note?: string;
      staffName: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const patch: Row = {
        review_state: accept ? "Accepted" : "Returned",
        review_note: note ?? null,
        reviewed_by: auth?.user?.id ?? null,
        reviewed_at: nowIso(),
      };
      if (target !== "documents") patch.status = accept ? "accepted" : "changes_requested";

      const { error } = await db.from(TABLES[target]).update(patch).eq("id", id);
      if (error) throw error;

      await db.from("client_portal_events").insert({
        estate_id: estateId,
        event_type: accept ? "CLIENT_SUBMISSION_ACCEPTED" : "CLIENT_SUBMISSION_RETURNED",
        actor_user_id: auth?.user?.id ?? null,
        actor_name: staffName,
        actor_role: "staff",
        detail: `${target}: ${note ?? (accept ? "accepted" : "returned")}`,
      });
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["staff-portal-submissions", vars.estateId] }),
  });
};

export async function staffDocumentUrl(storagePath: string) {
  const { data, error } = await supabase.storage.from("client-portal-uploads").createSignedUrl(storagePath, 300);
  if (error) throw error;
  return data.signedUrl;
}
