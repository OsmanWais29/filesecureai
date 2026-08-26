import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ClientDocument,
  ClientRequest,
  ClientRequestEventType,
  ClientRequestStatus,
  ClientRequestType,
} from "./types";

/**
 * Supabase repository for the authenticated client portal.
 *
 * Every read and write is scoped by an estate id that came from
 * `client_portal_access` (see session.ts). RLS re-checks the same relationship
 * server-side, so a tampered estate id in the browser resolves to zero rows.
 *
 * Tables
 *   client_portal_requests            trustee <-> client request list
 *   client_portal_request_staff_notes internal notes (staff-only RLS; never read here)
 *   client_portal_documents           client uploads + review state + version chain
 *   client_portal_intake_sections     guided "My information" questionnaire
 *   client_portal_messages            secure messaging
 *   client_portal_income_submissions  monthly income & expense submissions
 *   client_portal_events              audit trail
 *
 * Storage
 *   bucket `client-portal-uploads`, object key `<estate_id>/<uuid>-<filename>`
 */

const db = supabase as any;
const nowIso = () => new Date().toISOString();

export const BUCKET = "client-portal-uploads";

/* ------------------------------------------------------------------ events */

export async function logPortalEvent(input: {
  estateId: string;
  eventType: ClientRequestEventType | string;
  actorName?: string;
  actorUserId?: string;
  requestId?: string;
  detail?: string;
}) {
  await db.from("client_portal_events").insert({
    estate_id: input.estateId,
    event_type: input.eventType,
    actor_user_id: input.actorUserId ?? null,
    actor_name: input.actorName ?? null,
    actor_role: "client",
    request_id: input.requestId ?? null,
    detail: input.detail ?? null,
  });
}

/* ---------------------------------------------------------------- requests */

type Row = Record<string, any>;

/** Client-safe projection. Staff notes live in a separate, staff-only table. */
const rowToRequest = (r: Row): ClientRequest => ({
  id: r.id,
  estateId: r.estate_id,
  clientId: r.client_user_id ?? "",
  title: r.title,
  description: r.description ?? "",
  requestType: (r.request_type ?? "other") as ClientRequestType,
  requestedDocumentType: r.requested_document_type ?? undefined,
  sourceDocumentId: r.source_document_id ?? undefined,
  dueDate: r.due_date ?? undefined,
  priority: r.priority ?? "Standard",
  requestedByUserId: r.requested_by ?? "",
  requestedByName: r.requested_by_name ?? "Your trustee's office",
  requestedAt: r.requested_at,
  status: (r.status ?? "Action Required") as ClientRequestStatus,
  clientResponse: r.client_response ?? undefined,
  uploadedDocumentIds: [],
  completedAt: r.completed_at ?? undefined,
  trusteeReviewState: r.trustee_review_state ?? "Not started",
  reopenedCount: r.reopened_count ?? 0,
});

export const usePortalRequests = (estateId?: string) =>
  useQuery({
    queryKey: ["portal-requests", estateId],
    enabled: !!estateId,
    queryFn: async (): Promise<ClientRequest[]> => {
      const { data, error } = await db
        .from("client_portal_requests")
        .select(
          "id, estate_id, client_user_id, title, description, request_type, requested_document_type, source_document_id, due_date, priority, status, client_response, trustee_review_state, review_note, reopened_count, requested_by, requested_by_name, requested_at, completed_at",
        )
        .eq("estate_id", estateId)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToRequest);
    },
  });

export const usePortalRequestActions = (estateId?: string, actor?: { userId: string; name: string }) => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["portal-requests", estateId] });
    qc.invalidateQueries({ queryKey: ["portal-documents", estateId] });
  };

  const markViewed = useMutation({
    mutationFn: async (request: ClientRequest) => {
      if (request.status !== "Action Required") return;
      const { error } = await db
        .from("client_portal_requests")
        .update({ status: "In Progress" })
        .eq("id", request.id);
      if (error) throw error;
      await logPortalEvent({
        estateId: request.estateId,
        eventType: "CLIENT_REQUEST_VIEWED",
        actorUserId: actor?.userId,
        actorName: actor?.name,
        requestId: request.id,
      });
    },
    onSuccess: invalidate,
  });

  /**
   * Client submission. The client can only reach "Submitted" — acceptance is a
   * staff transition, enforced by the RLS WITH CHECK on this table.
   */
  const submit = useMutation({
    mutationFn: async ({ request, response }: { request: ClientRequest; response: string }) => {
      const { error } = await db
        .from("client_portal_requests")
        .update({ status: "Submitted", client_response: response })
        .eq("id", request.id);
      if (error) throw error;
      await logPortalEvent({
        estateId: request.estateId,
        eventType: "CLIENT_REQUEST_SUBMITTED",
        actorUserId: actor?.userId,
        actorName: actor?.name,
        requestId: request.id,
        detail: response.slice(0, 200),
      });
    },
    onSuccess: invalidate,
  });

  return { markViewed, submit };
};

export const openRequestList = (requests: ClientRequest[]) =>
  requests.filter(
    (r) => r.status === "Action Required" || r.status === "More Information Needed" || r.status === "Reopened",
  );

/* --------------------------------------------------------------- documents */

export interface PortalDocument extends ClientDocument {
  storagePath: string;
  fileName: string;
  sizeBytes?: number;
  mimeType?: string;
  version: number;
  reviewState: string;
  reviewNote?: string;
  requestId?: string;
}

const rowToDocument = (r: Row): PortalDocument => ({
  id: r.id,
  estateId: r.estate_id,
  title: r.title,
  category: r.doc_category ?? "Document",
  state:
    r.review_state === "Accepted"
      ? "Accepted"
      : r.review_state === "Returned"
        ? "Needs replacement"
        : "Under review",
  source: r.source === "BANK_PROVIDER" ? "BANK_PROVIDER" : r.uploaded_by_role === "client" ? "CLIENT_UPLOAD" : "TRUSTEE_SHARED",
  uploadedBy: r.uploaded_by_name ?? undefined,
  uploadedAt: r.uploaded_at,
  sharedWithClient: true,
  downloadable: true,
  linkedRequestId: r.request_id ?? undefined,
  note: r.review_note ?? undefined,
  storagePath: r.storage_path,
  fileName: r.file_name,
  sizeBytes: r.size_bytes ?? undefined,
  mimeType: r.mime_type ?? undefined,
  version: r.version ?? 1,
  reviewState: r.review_state ?? "Received",
  reviewNote: r.review_note ?? undefined,
  requestId: r.request_id ?? undefined,
});

export const usePortalDocuments = (estateId?: string) =>
  useQuery({
    queryKey: ["portal-documents", estateId],
    enabled: !!estateId,
    queryFn: async (): Promise<PortalDocument[]> => {
      const { data, error } = await db
        .from("client_portal_documents")
        .select("*")
        .eq("estate_id", estateId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToDocument);
    },
  });

async function sha256Of(file: File) {
  try {
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return undefined;
  }
}

export interface UploadInput {
  estateId: string;
  file: File;
  actor: { userId: string; name: string };
  requestId?: string;
  category?: string;
  supersedesId?: string;
}

/**
 * Real upload: the bytes go to private storage under the estate prefix, then a
 * row records the file for the trustee. Both hops are RLS-checked against
 * `client_portal_access`, so a client can only write into their own estate.
 */
export async function uploadPortalDocument(input: UploadInput): Promise<PortalDocument> {
  const { estateId, file, actor } = input;
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
  const path = `${estateId}/${crypto.randomUUID()}-${safeName}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (upErr) throw upErr;

  const hash = await sha256Of(file);

  let version = 1;
  if (input.supersedesId) {
    const { data: prev } = await db
      .from("client_portal_documents")
      .select("version")
      .eq("id", input.supersedesId)
      .maybeSingle();
    version = (prev?.version ?? 1) + 1;
  }

  const { data, error } = await db
    .from("client_portal_documents")
    .insert({
      estate_id: estateId,
      request_id: input.requestId ?? null,
      title: file.name,
      doc_category: input.category ?? "Client upload",
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      content_hash: hash ?? null,
      source: "CLIENT_UPLOAD",
      uploaded_by: actor.userId,
      uploaded_by_name: actor.name,
      uploaded_by_role: "client",
      supersedes_id: input.supersedesId ?? null,
      version,
      review_state: "Received",
    })
    .select("*")
    .single();
  if (error) throw error;

  await logPortalEvent({
    estateId,
    eventType: input.supersedesId ? "CLIENT_DOCUMENT_REPLACED" : "CLIENT_DOCUMENT_UPLOADED",
    actorUserId: actor.userId,
    actorName: actor.name,
    requestId: input.requestId,
    detail: file.name,
  });

  return rowToDocument(data);
}

export async function portalDocumentUrl(storagePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 300);
  if (error) throw error;
  return data.signedUrl;
}

/* ------------------------------------------------------------------ intake */

export type IntakeStatus = "not_started" | "draft" | "submitted" | "changes_requested" | "accepted";

export interface IntakeSectionRecord {
  id?: string;
  estateId: string;
  sectionKey: string;
  status: IntakeStatus;
  data: Record<string, any>;
  lastSavedAt?: string;
  submittedAt?: string;
  reviewState: string;
  reviewNote?: string;
}

const rowToIntake = (r: Row): IntakeSectionRecord => ({
  id: r.id,
  estateId: r.estate_id,
  sectionKey: r.section_key,
  status: r.status,
  data: r.data ?? {},
  lastSavedAt: r.last_saved_at ?? undefined,
  submittedAt: r.submitted_at ?? undefined,
  reviewState: r.review_state ?? "Not started",
  reviewNote: r.review_note ?? undefined,
});

export const usePortalIntake = (estateId?: string) =>
  useQuery({
    queryKey: ["portal-intake", estateId],
    enabled: !!estateId,
    queryFn: async (): Promise<IntakeSectionRecord[]> => {
      const { data, error } = await db.from("client_portal_intake_sections").select("*").eq("estate_id", estateId);
      if (error) throw error;
      return (data ?? []).map(rowToIntake);
    },
  });

export const usePortalIntakeActions = (estateId?: string, actor?: { userId: string; name: string }) => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["portal-intake", estateId] });

  const save = useMutation({
    mutationFn: async ({
      sectionKey,
      data,
      submit,
    }: {
      sectionKey: string;
      data: Record<string, any>;
      submit?: boolean;
    }) => {
      if (!estateId) throw new Error("No estate in session");
      const payload = {
        estate_id: estateId,
        section_key: sectionKey,
        data,
        status: submit ? "submitted" : "draft",
        last_saved_at: nowIso(),
        submitted_at: submit ? nowIso() : null,
        submitted_by: submit ? (actor?.userId ?? null) : null,
      };
      const { error } = await db
        .from("client_portal_intake_sections")
        .upsert(payload, { onConflict: "estate_id,section_key" });
      if (error) throw error;
      if (submit) {
        await logPortalEvent({
          estateId,
          eventType: "CLIENT_INTAKE_SECTION_SUBMITTED",
          actorUserId: actor?.userId,
          actorName: actor?.name,
          detail: sectionKey,
        });
      }
    },
    onSuccess: invalidate,
  });

  return { save };
};

/* ---------------------------------------------------------------- messages */

export interface PortalMessage {
  id: string;
  estateId: string;
  body: string;
  senderName: string;
  senderRole: "client" | "staff" | "system";
  sentAt: string;
  relatedRequestId?: string;
}

export const usePortalMessages = (estateId?: string) =>
  useQuery({
    queryKey: ["portal-messages", estateId],
    enabled: !!estateId,
    queryFn: async (): Promise<PortalMessage[]> => {
      const { data, error } = await db
        .from("client_portal_messages")
        .select("id, estate_id, body, sender_name, sender_role, sent_at, related_request_id")
        .eq("estate_id", estateId)
        .order("sent_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r: Row) => ({
        id: r.id,
        estateId: r.estate_id,
        body: r.body,
        senderName: r.sender_name ?? "Trustee's office",
        senderRole: r.sender_role,
        sentAt: r.sent_at,
        relatedRequestId: r.related_request_id ?? undefined,
      }));
    },
  });

export const useSendPortalMessage = (estateId?: string, actor?: { userId: string; name: string }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, relatedRequestId }: { body: string; relatedRequestId?: string }) => {
      if (!estateId) throw new Error("No estate in session");
      const { error } = await db.from("client_portal_messages").insert({
        estate_id: estateId,
        body,
        sender_user_id: actor?.userId ?? null,
        sender_name: actor?.name ?? null,
        sender_role: "client",
        related_request_id: relatedRequestId ?? null,
      });
      if (error) throw error;
      await logPortalEvent({
        estateId,
        eventType: "CLIENT_MESSAGE_SENT",
        actorUserId: actor?.userId,
        actorName: actor?.name,
        detail: body.slice(0, 120),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-messages", estateId] }),
  });
};

/* ------------------------------------------------------- income & expenses */

export interface IncomeSubmission {
  id?: string;
  estateId: string;
  periodMonth: string;
  periodLabel?: string;
  status: "draft" | "submitted" | "changes_requested" | "accepted";
  household: Record<string, any>;
  income: Record<string, any>;
  expenses: Record<string, any>;
  totals: Record<string, any>;
  notes?: string;
  submittedAt?: string;
  reviewState: string;
  reviewNote?: string;
}

const rowToIncome = (r: Row): IncomeSubmission => ({
  id: r.id,
  estateId: r.estate_id,
  periodMonth: r.period_month,
  periodLabel: r.period_label ?? undefined,
  status: r.status,
  household: r.household ?? {},
  income: r.income ?? {},
  expenses: r.expenses ?? {},
  totals: r.totals ?? {},
  notes: r.notes ?? undefined,
  submittedAt: r.submitted_at ?? undefined,
  reviewState: r.review_state ?? "Not started",
  reviewNote: r.review_note ?? undefined,
});

export const usePortalIncome = (estateId?: string) =>
  useQuery({
    queryKey: ["portal-income", estateId],
    enabled: !!estateId,
    queryFn: async (): Promise<IncomeSubmission[]> => {
      const { data, error } = await db
        .from("client_portal_income_submissions")
        .select("*")
        .eq("estate_id", estateId)
        .order("period_month", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToIncome);
    },
  });

export const usePortalIncomeActions = (estateId?: string, actor?: { userId: string; name: string }) => {
  const qc = useQueryClient();
  return {
    save: useMutation({
      mutationFn: async ({ submission, submit }: { submission: IncomeSubmission; submit?: boolean }) => {
        if (!estateId) throw new Error("No estate in session");
        const { error } = await db.from("client_portal_income_submissions").upsert(
          {
            estate_id: estateId,
            period_month: submission.periodMonth,
            period_label: submission.periodLabel ?? null,
            status: submit ? "submitted" : "draft",
            household: submission.household,
            income: submission.income,
            expenses: submission.expenses,
            totals: submission.totals,
            notes: submission.notes ?? null,
            submitted_at: submit ? nowIso() : null,
            submitted_by: submit ? (actor?.userId ?? null) : null,
          },
          { onConflict: "estate_id,period_month" },
        );
        if (error) throw error;
        if (submit) {
          await logPortalEvent({
            estateId,
            eventType: "CLIENT_INCOME_SUBMITTED",
            actorUserId: actor?.userId,
            actorName: actor?.name,
            detail: submission.periodLabel ?? submission.periodMonth,
          });
        }
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-income", estateId] }),
    }),
  };
};

/* ------------------------------------------------------------------ events */

export const usePortalActivity = (estateId?: string) =>
  useQuery({
    queryKey: ["portal-activity", estateId],
    enabled: !!estateId,
    queryFn: async () => {
      const { data, error } = await db
        .from("client_portal_events")
        .select("id, event_type, actor_name, actor_role, detail, occurred_at")
        .eq("estate_id", estateId)
        .order("occurred_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
