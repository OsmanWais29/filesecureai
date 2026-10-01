// Talks to the SFAI CRM backend (sfai-crm-module). Every network call lives here.
//   VITE_API_URL  backend base URL (default: local dev server)
//   Login: the host app calls setTokenProvider() with its Cognito token getter.
//   Without one (local dev), requests use the dev server's demo-firm header.
import { format } from "date-fns";
import {
  ACTION_LABEL, TRIGGER_LABEL,
  type Activity, type Appointment, type Automation, type Client, type Deadline, type Template,
} from "./data";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/crm";

let getToken: (() => Promise<string | null>) | null = null;
// Host app: setTokenProvider(() => cognitoIdToken())
export const setTokenProvider = (fn: typeof getToken) => (getToken = fn);

// Login header: real token if the host gave us one, else the local dev header
async function authHeaders(): Promise<Record<string, string>> {
  const token = getToken && (await getToken());
  if (token) return { authorization: `Bearer ${token}` };
  return { "x-dev-firm": import.meta.env.VITE_DEV_FIRM ?? "demo-firm" };
}

// One request: JSON in, JSON out, readable error messages
async function call<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeaders()) };
  if (init.json !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(BASE + path, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  const type = res.headers.get("content-type") ?? "";
  return (type.includes("json") ? res.json() : res.text()) as Promise<T>;
}

// ---------- Backend row -> UI type ----------

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- raw JSON

const toClient = (r: Row): Client => ({
  ...(r as Client),
  email: r.email ?? "",
  phone: r.phone ?? "",
  city: r.city ?? "",
  province: r.province ?? "",
  estateNumber: r.estateNumber ?? undefined,
  assignedTo: r.assignedTo ?? "Unassigned",
  lastActivity: r.lastContactAt,
  intake: Object.keys(r.intake ?? {}).length ? r.intake : undefined,
});

const toActivity = (r: Row): Activity => ({
  id: r.id, clientId: r.clientId, type: r.type, text: r.text,
  at: r.createdAt, source: r.source ?? undefined,
});

const toDeadline = (r: Row): Deadline => ({
  id: r.id, clientId: r.clientId, title: r.title, due: r.dueAt,
  statutory: r.statutory, done: !!r.doneAt,
});

const toAppointment = (r: Row, nameOf: (id?: string) => string): Appointment => ({
  id: r.id,
  clientId: r.clientId ?? undefined,
  client: nameOf(r.clientId) || "Calendar event",
  title: r.title,
  date: r.startsAt,
  time: format(new Date(r.startsAt), "h:mm a"),
  kind: r.kind,
  source: r.source,
  url: r.meetingUrl ?? undefined,
});

const toAutomation = (r: Row): Automation => ({
  id: r.id,
  trigger: TRIGGER_LABEL[r.trigger] ?? r.trigger,
  action: ACTION_LABEL[r.action] ?? r.action,
  templateKey: r.templateKey,
  enabled: r.enabled,
  runs: r.runs,
});

// ---------- Endpoints ----------

export interface Integrations {
  connected: { provider: string; account: string | null; lastSyncAt: string | null }[];
  available: Record<string, boolean>;
  website: { embed: string; bookingApi: string };
}
export interface Draft { id: string; clientIds: string[]; subject: string; body: string; source: string }
export interface DocRow { id: string; name: string; size: number; status: string; createdAt: string }
export interface EmailRow {
  id: string; direction: "in" | "out"; fromAddr: string; toAddr: string;
  subject: string; snippet: string; sentAt: string;
}

const day = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();

export const api = {
  // Everything the screens need, in parallel
  async loadAll() {
    const [clients, deadlines, appts, activities, automations, templates, integrations, drafts] =
      await Promise.all([
        call<Row[]>("/clients"),
        call<Row[]>("/deadlines?days=365"),
        call<Row[]>(`/appointments?from=${iso(Date.now() - 60 * day)}&to=${iso(Date.now() + 120 * day)}`),
        call<Row[]>("/activities?limit=100"),
        call<Row[]>("/settings/automations"),
        call<Template[]>("/settings/templates"),
        call<Integrations>("/integrations"),
        call<Draft[]>("/drafts"),
      ]);
    const list = clients.map(toClient);
    const nameOf = (id?: string) => list.find((c) => c.id === id)?.name ?? "";
    return {
      clients: list,
      deadlines: deadlines.map(toDeadline),
      appointments: appts.map((a) => toAppointment(a, nameOf)),
      activities: activities.map(toActivity),
      automations: automations.map(toAutomation),
      templates,
      integrations,
      drafts,
    };
  },

  createClient: (body: Row) => call<Row>("/clients", { method: "POST", json: body }),
  updateClient: (id: string, patch: Row) => call(`/clients/${id}`, { method: "PATCH", json: patch }),
  setDoc: (id: string, doc: string, received: boolean) =>
    call(`/clients/${id}/docs`, { method: "POST", json: { doc, received } }),
  completeDeadline: (id: string) => call(`/deadlines/${id}/done`, { method: "POST" }),
  createAppointment: (body: { clientId: string; title: string; startsAt: string; kind: string }) =>
    call("/appointments", { method: "POST", json: body }),

  // Email: send (optionally as a reply), a client's thread, pull new mail now
  sendEmail: (clientIds: string[], subject: string, text: string, replyToId?: string) =>
    call<{ sent: number }>("/messages/email", { method: "POST", json: { clientIds, subject, text, replyToId } }),
  emailThread: (clientId: string) => call<EmailRow[]>(`/messages/email/${clientId}`),
  syncEmail: () => call("/messages/email/sync", { method: "POST" }),

  // AI drafts awaiting approval
  sendDraft: (id: string) => call<{ sent: number }>(`/drafts/${id}/send`, { method: "POST" }),
  discardDraft: (id: string) => call(`/drafts/${id}`, { method: "DELETE" }),
  ask: (messages: { role: "user" | "assistant"; text: string }[]) =>
    call<{ text: string; draftIds: string[] }>("/assistant", { method: "POST", json: { messages } }),

  toggleAutomation: (id: string, enabled: boolean) =>
    call(`/settings/automations/${id}`, { method: "PATCH", json: { enabled } }),
  connectUrl: (provider: string) => call<{ url: string }>(`/integrations/${provider}/connect`),
  disconnect: (provider: string) => call(`/integrations/${provider}`, { method: "DELETE" }),
  connectTwilio: (body: { accountSid: string; authToken: string; from: string }) =>
    call("/integrations/twilio", { method: "POST", json: body }),
  syncCalendar: () => call("/integrations/calendar/sync", { method: "POST" }),
  osbCsv: () => call<string>("/integrations/osb/export"),
  reports: () => call<Row>("/reports/summary"),

  documents: (clientId: string) => call<DocRow[]>(`/documents?clientId=${clientId}`),
  downloadUrl: (id: string) => call<{ url: string }>(`/documents/${id}/download-url`),

  // Documents: get a presigned link, PUT the file to S3, then confirm
  async uploadDocument(clientId: string, file: File) {
    const { id, url } = await call<{ id: string; url: string }>("/documents/upload-url", {
      method: "POST",
      json: { clientId, name: file.name, contentType: file.type || "application/octet-stream", size: file.size },
    });
    const type = file.type || "application/octet-stream"; // must match the signed link
    const put = await fetch(url, { method: "PUT", body: file, headers: { "content-type": type } });
    if (!put.ok) throw new Error(`Upload of ${file.name} failed`);
    await call(`/documents/${id}/complete`, { method: "POST" });
  },
};
