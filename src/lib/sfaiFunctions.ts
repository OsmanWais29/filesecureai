// The old Supabase Edge Function names, re-pointed at the SFAI Platform Module on
// AWS. Same `{ data, error }` result as supabase.functions.invoke(name, { body }),
// so call sites didn't change. Results land in the same tables the screens read
// (document_analysis, tasks, notifications, signatures...).
import { from } from "./sfai/db";
import { request, type ApiError } from "./sfai/http";

type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Result = { data: any; error: { message: string; context?: Response } | null }; // eslint-disable-line @typescript-eslint/no-explicit-any

// Run a query and return its rows, or throw its error
async function rows<T = Body>(q: PromiseLike<{ data: T; error: ApiError | null }>) {
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

// Start the AI analysis (it runs in the background) and wait for the result
async function analyze(documentId: string) {
  await request(`/data/documents/${documentId}/analyze`);
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const doc = await rows(from("documents").select("ai_processing_status, metadata").eq("id", documentId).single());
    if (doc.ai_processing_status === "failed") throw new Error(doc.metadata?.analysis_error ?? "Analysis failed");
    if (doc.ai_processing_status === "complete") {
      const a = await rows(from("document_analysis").select("content").eq("document_id", documentId).single());
      return { success: true, ...a.content, analysis: a.content };
    }
  }
  throw new Error("Analysis is taking longer than expected; check back shortly");
}

// Who must sign, by form (same defaults as the old process-document function)
const partiesFor = (formType = "") =>
  formType === "form-47"
    ? ["debtor", "administrator", "witness"]
    : formType === "form-31"
      ? ["creditor", "witness"]
      : ["debtor", "trustee", "witness"];

// A notification row as the old function wrote it
const notice = (b: Body, preset: Body = {}) => ({
  user_id: b.userId,
  title: b.notification?.title,
  message: b.notification?.message,
  type: b.notification?.type ?? "info",
  priority: b.notification?.priority ?? "normal",
  action_url: b.notification?.action_url,
  icon: b.notification?.icon,
  read: false,
  metadata: { ...b.notification?.metadata, category: b.notification?.category ?? "file_activity" },
  ...preset,
});

async function signatures(documentId: string) {
  const doc = await rows(from("documents").select("metadata").eq("id", documentId).single());
  const signed: string[] = (await rows(from("signatures").select("metadata").eq("document_id", documentId)))
    .map((s: Body) => s.metadata?.party_type)
    .filter(Boolean);
  const required: string[] = doc.metadata?.signaturesRequired ?? partiesFor(doc.metadata?.formType);
  const pending = required.filter((p) => !signed.includes(p));
  return { required, signed, pending, complete: required.length > 0 && !pending.length };
}

const ROUTES: Record<string, (b: Body) => Promise<unknown>> = {
  // Six analysis functions -> one pipeline (S3 -> SQS -> Bedrock)
  "process-ai-request": (b) =>
    b.ping
      ? request("/health", undefined, "GET").then(() => ({ status: "ok", message: "pong" }))
      : b.documentId
        ? analyze(b.documentId)
        : request("/ai/chat", { message: b.message }),
  "analyze-document": (b) => analyze(b.documentId),
  "deepseek-document-analysis": (b) => analyze(b.documentId),
  "enhanced-document-analysis": (b) => analyze(b.documentId),
  "enhanced-osb-analysis": (b) => analyze(b.documentId),
  // The analysis makes the tasks; return them
  "ai-task-generator": async (b) => ({
    success: true,
    tasks: await rows(from("tasks").select("*").eq("document_id", b.documentId)),
  }),
  "deepseek-chat": (b) => request("/ai/chat", { message: b.message ?? b.prompt, category: b.category }),

  "handle-notifications": async (b) => {
    const n = b.notification ?? {};
    switch (b.action) {
      case "create":
        return { success: true, notification: (await rows(from("notifications").insert(notice(b)).select()))[0] };
      case "markRead":
        await rows(from("notifications").update({ read: true }).in("id", n.ids ?? []));
        return { success: true };
      case "deleteAll":
        await rows(from("notifications").delete().eq("user_id", b.userId));
        return { success: true };
      case "folderRecommendation":
        return {
          success: true,
          notification: (await rows(from("notifications").insert(notice(b, {
            title: "Folder Recommendation",
            message: n.message ?? "AI has suggested a folder for your document",
            icon: "folder-tree",
            metadata: { category: "file_activity", documentId: n.documentId, suggestedPath: n.suggestedPath },
          })).select()))[0],
        };
      case "supportRequest":
        return {
          success: true,
          notification: (await rows(from("notifications").insert(notice(b, {
            title: "Client Assistance Request",
            message: n.message ?? "A client has requested assistance",
            type: "support",
            priority: "high",
            icon: "help-circle",
          })).select()))[0],
        };
      default:
        throw new Error("Invalid action");
    }
  },

  "process-document": async (b) => {
    const id = b.documentId;
    if (b.action === "sign") {
      // The server records the signed-in user as the signer
      await rows(from("signatures").insert({
        document_id: id,
        signature_data: b.signatureData,
        status: "completed",
        signed_at: new Date().toISOString(),
        metadata: { party_type: b.partyType ?? "signer" },
      }));
      const s = await signatures(id);
      if (s.complete) await rows(from("documents").update({ status: "signed" }).eq("id", id));
      return { success: true, ...s };
    }
    if (b.action === "prepare_signature") {
      const doc = await rows(from("documents").select("metadata").eq("id", id).single());
      const parties = b.metadata?.signaturesRequired ?? partiesFor(b.metadata?.formType);
      await rows(from("documents").update({ metadata: { ...doc.metadata, signaturesRequired: parties } }).eq("id", id));
      return { success: true, required: parties };
    }
    return signatures(id); // check_signatures / analyze / check_deadline
  },

  "process-client-intake": async (b) => ({
    success: true,
    data: (await rows(from("clients").insert({ ...b.formData, transcription: b.transcription }).select()))[0],
  }),

  // Integrations are connected from the CRM's Integrations tab (real OAuth)
  "handle-integration": async () => ({ success: true }),

  // Public: the invite token is the credential
  "create-client-portal-account": (b) => request("/public/portal/activate", b),
};

export const sfaiFunctions = {
  async invoke(name: string, opts: { body?: Body } = {}): Promise<Result> {
    const route = ROUTES[name];
    if (!route) return { data: null, error: { message: `Unknown function: ${name}` } };
    try {
      return { data: await route(opts.body ?? {}), error: null };
    } catch (e) {
      const err = e as ApiError;
      return { data: null, error: { message: err.message ?? String(e), context: err.context } };
    }
  },
};
