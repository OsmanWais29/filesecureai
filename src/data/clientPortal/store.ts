import { useSyncExternalStore } from "react";
import { buildDemoState } from "./seed";
import {
  BankConsent,
  ClientBankTransaction,
  ClientDocument,
  ClientIncomePeriod,
  ClientMessage,
  ClientNotification,
  ClientPortalState,
  ClientRequest,
  ClientRequestEvent,
  ClientRequestEventType,
  ClientRequestStatus,
} from "./types";

/**
 * In-session client portal repository.
 *
 * Backed by localStorage so a preview session survives reloads. Every mutation
 * goes through this module, which is the single seam to replace with Supabase
 * calls (one table per collection — see types.ts for the mapping).
 */

const STORAGE_KEY = "securefiles.clientPortal.v1";

let state: ClientPortalState = load();
const listeners = new Set<() => void>();

function load(): ClientPortalState {
  if (typeof window === "undefined") return buildDemoState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ClientPortalState;
  } catch {
    /* fall through to demo state */
  }
  return buildDemoState();
}

function commit(next: ClientPortalState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable — session state still updates */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const getSnapshot = () => state;

export const useClientPortal = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const resetClientPortalDemo = () => commit(buildDemoState());

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

/* -------------------------------------------------------------- audit log */

export function recordEvent(
  eventType: ClientRequestEventType,
  opts: { actor: string; actorRole: "client" | "staff" | "system"; requestId?: string; detail?: string } ,
) {
  const event: ClientRequestEvent = {
    id: uid("ev"),
    estateId: state.profile.estateId,
    requestId: opts.requestId,
    eventType,
    actor: opts.actor,
    actorRole: opts.actorRole,
    occurredAt: now(),
    detail: opts.detail,
  };
  commit({ ...state, events: [event, ...state.events] });
}

function notify(n: Omit<ClientNotification, "id" | "estateId" | "createdAt" | "read">) {
  commit({
    ...state,
    notifications: [
      { ...n, id: uid("note"), estateId: state.profile.estateId, createdAt: now(), read: false },
      ...state.notifications,
    ],
  });
}

export const markNotificationsRead = () =>
  commit({ ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) });

/* --------------------------------------------------------------- requests */

/** Staff action. Converts an internal signal into a client-facing request. */
export function createClientRequest(
  input: Omit<
    ClientRequest,
    "id" | "estateId" | "clientId" | "requestedAt" | "status" | "uploadedDocumentIds" | "trusteeReviewState" | "reopenedCount"
  >,
) {
  const request: ClientRequest = {
    ...input,
    id: uid("req"),
    estateId: state.profile.estateId,
    clientId: state.profile.id,
    requestedAt: now(),
    status: "Action Required",
    uploadedDocumentIds: [],
    trusteeReviewState: "Not started",
    reopenedCount: 0,
  };
  commit({ ...state, requests: [request, ...state.requests] });
  recordEvent("CLIENT_REQUEST_SENT", {
    actor: input.requestedByName,
    actorRole: "staff",
    requestId: request.id,
    detail: input.title,
  });
  notify({
    kind: "new_request",
    title: "New request from your trustee",
    body: input.title,
    to: "/client-portal/tasks",
  });
  return request;
}

function patchRequest(id: string, patch: Partial<ClientRequest>) {
  commit({
    ...state,
    requests: state.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  });
}

export function markRequestViewed(id: string) {
  const r = state.requests.find((x) => x.id === id);
  if (!r || r.status !== "Action Required") return;
  patchRequest(id, { status: "In Progress" });
  recordEvent("CLIENT_REQUEST_VIEWED", { actor: state.profile.name, actorRole: "client", requestId: id });
}

/**
 * Client submission. Deliberately cannot set Completed — only staff verification
 * of the authoritative condition resolves a request.
 */
export function submitClientRequest(id: string, response: string, documentIds: string[] = []) {
  const existing = state.requests.find((r) => r.id === id);
  patchRequest(id, {
    status: "Submitted",
    clientResponse: response,
    uploadedDocumentIds: [...(existing?.uploadedDocumentIds ?? []), ...documentIds],
    trusteeReviewState: "In review",
  });
  recordEvent("CLIENT_REQUEST_SUBMITTED", {
    actor: state.profile.name,
    actorRole: "client",
    requestId: id,
    detail: response.slice(0, 200),
  });
}

/** Staff-only review transitions. */
export function setRequestReview(id: string, status: ClientRequestStatus, reviewNote?: string) {
  patchRequest(id, {
    status,
    trusteeReviewState:
      status === "Completed" ? "Accepted" : status === "More Information Needed" ? "Returned" : "In review",
    completedAt: status === "Completed" ? now() : undefined,
    staffNotes: reviewNote,
  });
}

/* -------------------------------------------------------------- documents */

export function addClientDocument(doc: Omit<ClientDocument, "id" | "estateId">) {
  const document: ClientDocument = { ...doc, id: uid("doc"), estateId: state.profile.estateId };
  commit({ ...state, documents: [document, ...state.documents] });
  recordEvent(doc.linkedRequestId ? "CLIENT_DOCUMENT_UPLOADED" : "CLIENT_DOCUMENT_UPLOADED", {
    actor: state.profile.name,
    actorRole: "client",
    requestId: doc.linkedRequestId,
    detail: doc.title,
  });
  return document;
}

export function replaceClientDocument(originalId: string, doc: Omit<ClientDocument, "id" | "estateId">) {
  const replacement: ClientDocument = { ...doc, id: uid("doc"), estateId: state.profile.estateId };
  commit({
    ...state,
    documents: [
      replacement,
      ...state.documents.map((d) =>
        d.id === originalId ? { ...d, state: "Under review" as const, note: "Replaced by a newer upload." } : d,
      ),
    ],
  });
  recordEvent("CLIENT_DOCUMENT_REPLACED", {
    actor: state.profile.name,
    actorRole: "client",
    requestId: doc.linkedRequestId,
    detail: doc.title,
  });
  return replacement;
}

/* ------------------------------------------------------------ bank/consent */

export function grantBankConsent(consent: Omit<BankConsent, "id" | "estateId" | "clientId" | "grantedAt">) {
  const record: BankConsent = {
    ...consent,
    id: uid("consent"),
    estateId: state.profile.estateId,
    clientId: state.profile.id,
    grantedAt: now(),
  };
  commit({ ...state, consents: [record, ...state.consents] });
  recordEvent("CLIENT_BANK_CONSENT_GRANTED", {
    actor: state.profile.name,
    actorRole: "client",
    detail: consent.scopes.join(", "),
  });
  return record;
}

export function revokeBankConsent(consentId: string) {
  commit({
    ...state,
    consents: state.consents.map((c) => (c.id === consentId ? { ...c, revokedAt: now() } : c)),
  });
}

export function upsertBankConnection(connection: ClientPortalState["connections"][number]) {
  const exists = state.connections.some((c) => c.id === connection.id);
  commit({
    ...state,
    connections: exists
      ? state.connections.map((c) => (c.id === connection.id ? connection : c))
      : [connection, ...state.connections],
  });
}

export function addBankImport(imp: ClientPortalState["imports"][number], txns: ClientBankTransaction[]) {
  commit({ ...state, imports: [imp, ...state.imports], transactions: [...txns, ...state.transactions] });
}

export function addBankStatementRecord(record: ClientPortalState["statements"][number], doc: ClientDocument) {
  commit({
    ...state,
    statements: [record, ...state.statements],
    documents: [doc, ...state.documents],
  });
}

export function disconnectBank(connectionId: string) {
  const conn = state.connections.find((c) => c.id === connectionId);
  commit({
    ...state,
    connections: state.connections.map((c) =>
      c.id === connectionId ? { ...c, status: "revoked", health: "unknown", lastError: undefined } : c,
    ),
    consents: state.consents.map((c) => (c.id === conn?.consentId ? { ...c, revokedAt: now() } : c)),
    padAuthorizations: state.padAuthorizations.map((p) =>
      p.connectionId === connectionId
        ? { ...p, status: "account_connection_required", connectionId: undefined, revokedAt: now() }
        : p,
    ),
  });
  recordEvent("CLIENT_BANK_DISCONNECTED", { actor: state.profile.name, actorRole: "client" });
}

/* ------------------------------------------------------------------- PAD */

export function authorizePad(padId: string, connectionId: string) {
  commit({
    ...state,
    padAuthorizations: state.padAuthorizations.map((p) =>
      p.id === padId
        ? { ...p, status: "active", connectionId, authorizedAt: now(), authorizedBy: state.profile.name }
        : p,
    ),
    schedules: state.schedules.map((s) =>
      s.id === state.padAuthorizations.find((p) => p.id === padId)?.estateScheduleId
        ? { ...s, status: "Active" }
        : s,
    ),
  });
  recordEvent("PAD_AUTHORIZATION_GRANTED", { actor: state.profile.name, actorRole: "client", detail: padId });
}

export function revokePad(padId: string) {
  commit({
    ...state,
    padAuthorizations: state.padAuthorizations.map((p) =>
      p.id === padId ? { ...p, status: "cancelled", revokedAt: now() } : p,
    ),
    schedules: state.schedules.map((s) =>
      s.id === state.padAuthorizations.find((p) => p.id === padId)?.estateScheduleId
        ? { ...s, status: "Pending authorization" }
        : s,
    ),
  });
  recordEvent("PAD_AUTHORIZATION_REVOKED", { actor: state.profile.name, actorRole: "client", detail: padId });
}

/**
 * The client can never mutate the authoritative estate schedule. A change is
 * raised as a message-backed request to the trustee instead.
 */
export function requestScheduleChange(scheduleId: string, message: string) {
  sendClientMessage(`Payment arrangement change request (schedule ${scheduleId}): ${message}`);
}

/* ---------------------------------------------------------------- income */

export function saveIncomePeriod(period: ClientIncomePeriod) {
  commit({
    ...state,
    incomePeriods: state.incomePeriods.map((p) => (p.id === period.id ? period : p)),
  });
}

export function submitIncomePeriod(periodId: string) {
  commit({
    ...state,
    incomePeriods: state.incomePeriods.map((p) =>
      p.id === periodId ? { ...p, status: "Submitted", submittedAt: now() } : p,
    ),
  });
  recordEvent("CLIENT_INCOME_SUBMITTED", { actor: state.profile.name, actorRole: "client", detail: periodId });
  const linked = state.requests.find((r) => r.requestType === "complete_income_statement" && r.status !== "Completed");
  if (linked) submitClientRequest(linked.id, "Income and expense statement submitted through the portal.");
}

/* -------------------------------------------------------------- messages */

export function sendClientMessage(body: string, attachmentDocumentIds: string[] = [], relatedRequestId?: string) {
  const message: ClientMessage = {
    id: uid("msg"),
    estateId: state.profile.estateId,
    threadId: "thread-main",
    senderName: state.profile.name,
    senderRole: "client",
    body,
    sentAt: now(),
    attachmentDocumentIds,
    relatedRequestId,
  };
  commit({ ...state, messages: [...state.messages, message] });
  recordEvent("CLIENT_MESSAGE_SENT", { actor: state.profile.name, actorRole: "client", detail: body.slice(0, 120) });
}

/* ------------------------------------------------------------- selectors */

/** Client-safe request projection: internal staff notes and signal ids removed. */
export const toClientSafeRequest = (r: ClientRequest) => {
  const { staffNotes: _staffNotes, sourceSignalId: _sourceSignalId, ...safe } = r;
  return safe;
};

export const openRequests = (s: ClientPortalState) =>
  s.requests.filter((r) => r.status === "Action Required" || r.status === "More Information Needed" || r.status === "Reopened");

/* ------------------------------------------------- estate context binding */

export interface PortalEstateContext {
  estateId: string;
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  firmName?: string;
  proceedingLabel?: string;
  trusteeName?: string;
}

/**
 * Binds the demo portal state to the estate currently being administered.
 *
 * Preview-only concern: the seeded portal collections carry the demo estate id,
 * so provisioning a portal from any estate re-points every record at that estate.
 * In production the invitation itself establishes estateId/clientId server-side
 * and no re-pointing is required.
 */
export function bindPortalToEstate(ctx: PortalEstateContext) {
  const re = <T extends { estateId: string }>(rows: T[]) => rows.map((r) => ({ ...r, estateId: ctx.estateId }));
  commit({
    ...state,
    profile: {
      ...state.profile,
      id: ctx.clientId,
      estateId: ctx.estateId,
      name: ctx.name || state.profile.name,
      email: ctx.email || state.profile.email,
      phone: ctx.phone || state.profile.phone,
      address: ctx.address || state.profile.address,
      firmName: ctx.firmName || state.profile.firmName,
      proceedingLabel: ctx.proceedingLabel || state.profile.proceedingLabel,
      trusteeName: ctx.trusteeName || state.profile.trusteeName,
    },
    requests: re(state.requests).map((r) => ({ ...r, clientId: ctx.clientId })),
    events: re(state.events),
    connections: re(state.connections),
    consents: re(state.consents),
    imports: re(state.imports),
    statements: re(state.statements),
    transactions: re(state.transactions),
    padAuthorizations: re(state.padAuthorizations),
    schedules: re(state.schedules),
    payments: re(state.payments),
    documents: re(state.documents),
    incomePeriods: re(state.incomePeriods),
    messages: re(state.messages),
    appointments: re(state.appointments),
    notifications: re(state.notifications),
  });
}

/** Staff-side welcome flag consumed once by the client portal dashboard. */
const WELCOME_KEY = "securefiles.clientPortal.welcomePending";
export const setWelcomePending = () => {
  welcomeCache = null;
  try { window.localStorage.setItem(WELCOME_KEY, "1"); } catch { /* ignore */ }
};
let welcomeCache: boolean | null = null;
export const consumeWelcomePending = () => {
  if (welcomeCache !== null) return welcomeCache;
  try {
    const v = window.localStorage.getItem(WELCOME_KEY);
    if (v) window.localStorage.removeItem(WELCOME_KEY);
    welcomeCache = Boolean(v);
    return welcomeCache;
  } catch {
    return false;
  }
};
