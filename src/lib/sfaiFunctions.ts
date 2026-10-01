// Drop-in replacement for `supabase.functions.invoke(name, { body })`.
// The old Supabase Edge Functions now live in the SFAI Platform Module on AWS
// (sfai-platform-module/). This maps each old function name to its new API route
// and keeps the same `{ data, error }` result, so call sites change by one line.
//
//   VITE_SFAI_API_URL  the module's base URL (default: local dev server)
//   setSfaiToken(fn)   once logins move to Cognito, pass the ID-token getter here.
//                      Until then (local dev) requests use the dev firm header.

type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Result = { data: any; error: { message: string; context?: Response } | null }; // eslint-disable-line @typescript-eslint/no-explicit-any

const BASE = import.meta.env.VITE_SFAI_API_URL ?? "http://localhost:3000/api";
let getToken: (() => Promise<string | null>) | null = null;
export const setSfaiToken = (fn: typeof getToken) => (getToken = fn);

// One request; throws with the API's error message (and the raw response)
async function call(path: string, method = "GET", json?: unknown) {
  const token = getToken && (await getToken());
  const headers: Record<string, string> = token
    ? { authorization: `Bearer ${token}` }
    : { "x-dev-firm": import.meta.env.VITE_DEV_FIRM ?? "demo-firm" };
  if (json !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  if (!res.ok) {
    const err = new Error(`Request failed (${res.status})`) as Error & { context: Response };
    err.context = res; // same place the Supabase client puts it
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

// Start an analysis and wait for it (it runs in the background on AWS)
async function analyze(documentId: string) {
  await call(`/documents/${documentId}/analyze`, "POST");
  for (let i = 0; i < 40; i++) {
    const doc = await call(`/documents/${documentId}`);
    if (doc.analysisStatus === "done") return { success: true, ...doc.analysis, analysis: doc.analysis };
    if (doc.analysisStatus === "failed") throw new Error(doc.analysisError ?? "Analysis failed");
    await new Promise((r) => setTimeout(r, 3000));
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

// Old notification body -> new API body
const note = (b: Body, preset: Body = {}) => ({
  userId: b.userId,
  title: b.notification?.title,
  message: b.notification?.message,
  type: b.notification?.type,
  priority: b.notification?.priority === "high" ? "high" : undefined,
  actionUrl: b.notification?.action_url,
  metadata: { ...b.notification?.metadata, category: b.notification?.category },
  ...preset,
});

// Each old function, re-pointed at its new route
const ROUTES: Record<string, (b: Body) => Promise<unknown>> = {
  // Six analysis functions -> one pipeline
  "process-ai-request": (b) =>
    b.ping
      ? call("/health").then(() => ({ status: "ok", message: "pong" }))
      : b.documentId
        ? analyze(b.documentId)
        : call("/ai/chat", "POST", { message: b.message }),
  "analyze-document": (b) => analyze(b.documentId),
  "deepseek-document-analysis": (b) => analyze(b.documentId),
  "enhanced-document-analysis": (b) => analyze(b.documentId),
  "enhanced-osb-analysis": (b) => analyze(b.documentId),
  // Tasks are made during analysis; return them
  "ai-task-generator": async (b) => ({
    success: true,
    tasks: await call(`/tasks?documentId=${b.documentId}`),
  }),
  "deepseek-chat": (b) =>
    call("/ai/chat", "POST", { message: b.message ?? b.prompt, category: b.category }),

  "handle-notifications": (b) => {
    const n = b.notification ?? {};
    switch (b.action) {
      case "create":
        return call("/notifications", "POST", note(b));
      case "markRead":
        return call("/notifications/read", "POST", { ids: n.ids });
      case "deleteAll":
        return call("/notifications", "DELETE");
      case "folderRecommendation":
        return call("/notifications", "POST", note(b, {
          title: "Folder Recommendation",
          message: n.message ?? "AI has suggested a folder for your document",
          metadata: { documentId: n.documentId, suggestedPath: n.suggestedPath },
        }));
      case "supportRequest":
        return call("/notifications", "POST", note(b, {
          title: "Client Assistance Request",
          message: n.message ?? "A client has requested assistance",
          type: "support",
          priority: "high",
        }));
      default:
        throw new Error("Invalid action");
    }
  },

  "process-document": async (b) => {
    const id = b.documentId;
    if (b.action === "sign") {
      return call(`/documents/${id}/signatures`, "POST", {
        partyType: b.partyType ?? "signer",
        signatureData: b.signatureData,
      });
    }
    if (b.action === "prepare_signature") {
      const parties = b.metadata?.signaturesRequired ?? partiesFor(b.metadata?.formType);
      return call(`/documents/${id}`, "PATCH", { requiredParties: parties });
    }
    // check_signatures / analyze / check_deadline: the document's current state
    const doc = await call(`/documents/${id}`);
    const signed = [...new Set(doc.signatures.map((s: Body) => s.partyType))];
    const required: string[] = doc.requiredParties;
    return {
      ...doc,
      required,
      signed,
      pending: required.filter((p) => !signed.includes(p)),
      complete: required.length > 0 && required.every((p) => signed.includes(p)),
    };
  },

  // Intake: create the client in the CRM
  "process-client-intake": async (b) => {
    const f = b.formData ?? {};
    const data = await call("/clients", "POST", {
      name: f.fullName ?? f.name,
      email: f.email || undefined,
      phone: f.phone || undefined,
      intake: Object.fromEntries(
        Object.entries(f).filter(([, v]) => typeof v === "string" && v),
      ),
    });
    return { success: true, data };
  },

  // Integrations are connected from the CRM's Integrations tab (real OAuth now)
  "handle-integration": () => call("/integrations").then(() => ({ success: true })),

  // Public: no login (the invite token is the credential)
  "create-client-portal-account": (b) => call("/public/portal/activate", "POST", b),
};

export const sfaiFunctions = {
  async invoke(name: string, opts: { body?: Body } = {}): Promise<Result> {
    const route = ROUTES[name];
    if (!route) return { data: null, error: { message: `Unknown function: ${name}` } };
    try {
      return { data: await route(opts.body ?? {}), error: null };
    } catch (e) {
      const err = e as Error & { context?: Response };
      return { data: null, error: { message: err.message, context: err.context } };
    }
  },
};
