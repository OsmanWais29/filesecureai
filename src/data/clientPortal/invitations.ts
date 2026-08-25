import { useSyncExternalStore } from "react";

/**
 * Client portal provisioning + invitation model.
 *
 * Backend mapping (eventual Supabase tables):
 *   client_portal_invitations -> ClientPortalInvitation
 *   client_portal_events      -> PortalEvent
 *
 * SECURITY DESIGN
 * The invitation URL carries ONLY an opaque token. Estate/client/email are never
 * encoded into the link. Resolution happens through `resolveInvitation(token)`,
 * which in production becomes a server call that looks the token hash up and
 * returns the minimum safe payload (firm name + masked email). Activation is
 * one-time; revoke/suspend block access without deleting audit history.
 */

export type InvitationStatus =
  | "created"
  | "sent"
  | "opened"
  | "active"
  | "expired"
  | "revoked"
  | "suspended";

export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  created: "Invitation ready",
  sent: "Invitation sent",
  opened: "Client opened invitation",
  active: "Active",
  expired: "Invitation expired",
  revoked: "Invitation revoked",
  suspended: "Access suspended",
};

export interface ClientPortalInvitation {
  id: string;
  firmId: string;
  firmName: string;
  officeId?: string;
  estateId: string;
  clientId: string;
  clientName: string;
  proceedingLabel?: string;
  trusteeName?: string;
  officeName?: string;
  invitedEmail: string;
  /** Opaque reference. Server would persist a hash of the token only. */
  tokenReference: string;
  status: InvitationStatus;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  expiresAt: string;
  sentAt?: string;
  openedAt?: string;
  acceptedAt?: string;
  revokedAt?: string;
  suspendedAt?: string;
  activatedUserId?: string;
  resendCount: number;
  lastSentAt?: string;
  lastActivityAt?: string;
  /** True when no real email backend delivered the invitation. */
  simulated: boolean;
}

export type PortalEventType =
  | "CLIENT_PORTAL_CREATED"
  | "CLIENT_PORTAL_INVITE_CREATED"
  | "CLIENT_PORTAL_INVITE_SENT"
  | "CLIENT_PORTAL_INVITE_OPENED"
  | "CLIENT_PORTAL_INVITE_ACCEPTED"
  | "CLIENT_PORTAL_INVITE_RESENT"
  | "CLIENT_PORTAL_INVITE_REVOKED"
  | "CLIENT_PORTAL_ACCESS_SUSPENDED"
  | "CLIENT_PORTAL_ACCESS_RESTORED"
  | "CLIENT_LOGIN";

export interface PortalEvent {
  id: string;
  estateId: string;
  invitationId?: string;
  eventType: PortalEventType;
  actor: string;
  actorRole: "staff" | "client" | "system";
  occurredAt: string;
  detail?: string;
}

interface InvitationState {
  invitations: ClientPortalInvitation[];
  events: PortalEvent[];
  /** Preview-only activation marker so the acceptance test runs in one browser. */
  previewSession?: { invitationId: string; email: string; estateId: string; activatedAt: string } | null;
}

const STORAGE_KEY = "securefiles.clientPortalInvites.v1";

const empty: InvitationState = { invitations: [], events: [], previewSession: null };

let state: InvitationState = load();
const listeners = new Set<() => void>();

function load(): InvitationState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...empty, ...(JSON.parse(raw) as InvitationState) };
  } catch {
    /* ignore */
  }
  return empty;
}

function commit(next: InvitationState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

const opaqueToken = () => {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

/** Applies lazy expiry so reads always reflect the true state. */
const withExpiry = (inv: ClientPortalInvitation): ClientPortalInvitation => {
  if (
    (inv.status === "created" || inv.status === "sent" || inv.status === "opened") &&
    new Date(inv.expiresAt).getTime() < Date.now()
  ) {
    return { ...inv, status: "expired" };
  }
  return inv;
};

export const useInvitationState = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

export function useEstateInvitation(estateId?: string) {
  const s = useInvitationState();
  if (!estateId) return undefined;
  const found = [...s.invitations]
    .filter((i) => i.estateId === estateId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return found ? withExpiry(found) : undefined;
}

export function usePortalEvents(estateId?: string) {
  const s = useInvitationState();
  return s.events.filter((e) => !estateId || e.estateId === estateId);
}

export const usePreviewSession = () => useInvitationState().previewSession ?? null;

export const hasPreviewSession = () => Boolean(load().previewSession);

/* ------------------------------------------------------------------ writes */

function logEvent(e: Omit<PortalEvent, "id" | "occurredAt">) {
  state = { ...state, events: [{ ...e, id: uid("pev"), occurredAt: now() }, ...state.events] };
}

function patch(id: string, p: Partial<ClientPortalInvitation>, event?: Omit<PortalEvent, "id" | "occurredAt">) {
  const invitations = state.invitations.map((i) => (i.id === id ? { ...i, ...p } : i));
  state = { ...state, invitations };
  if (event) logEvent(event);
  commit(state);
  return state.invitations.find((i) => i.id === id);
}

export const DEFAULT_EXPIRY_DAYS = 7;

export function createInvitation(input: {
  estateId: string;
  clientId: string;
  clientName: string;
  invitedEmail: string;
  firmId?: string;
  firmName: string;
  officeId?: string;
  officeName?: string;
  proceedingLabel?: string;
  trusteeName?: string;
  createdByUserId: string;
  createdByName: string;
}): ClientPortalInvitation {
  const token = opaqueToken();
  const invitation: ClientPortalInvitation = {
    id: uid("inv"),
    firmId: input.firmId ?? "firm-default",
    firmName: input.firmName,
    officeId: input.officeId,
    officeName: input.officeName,
    estateId: input.estateId,
    clientId: input.clientId,
    clientName: input.clientName,
    proceedingLabel: input.proceedingLabel,
    trusteeName: input.trusteeName,
    invitedEmail: input.invitedEmail.trim().toLowerCase(),
    tokenReference: token,
    status: "created",
    createdByUserId: input.createdByUserId,
    createdByName: input.createdByName,
    createdAt: now(),
    expiresAt: new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 864e5).toISOString(),
    resendCount: 0,
    simulated: true,
  };
  state = { ...state, invitations: [invitation, ...state.invitations] };
  logEvent({
    estateId: invitation.estateId,
    invitationId: invitation.id,
    eventType: "CLIENT_PORTAL_CREATED",
    actor: input.createdByName,
    actorRole: "staff",
    detail: `Portal created for ${invitation.clientName}`,
  });
  logEvent({
    estateId: invitation.estateId,
    invitationId: invitation.id,
    eventType: "CLIENT_PORTAL_INVITE_CREATED",
    actor: input.createdByName,
    actorRole: "staff",
    detail: invitation.invitedEmail,
  });
  commit(state);
  return invitation;
}

/**
 * Marks the invitation as sent. `delivered` is false whenever no real email
 * backend handled the message — the UI must say so rather than claim delivery.
 */
export function markInvitationSent(id: string, actor: string, delivered: boolean, resend = false) {
  const inv = state.invitations.find((i) => i.id === id);
  if (!inv) return;
  patch(
    id,
    {
      status: inv.status === "active" ? inv.status : "sent",
      sentAt: inv.sentAt ?? now(),
      lastSentAt: now(),
      resendCount: resend ? inv.resendCount + 1 : inv.resendCount,
      simulated: !delivered,
    },
    {
      estateId: inv.estateId,
      invitationId: id,
      eventType: resend ? "CLIENT_PORTAL_INVITE_RESENT" : "CLIENT_PORTAL_INVITE_SENT",
      actor,
      actorRole: "staff",
      detail: delivered ? `Emailed ${inv.invitedEmail}` : `Prepared for ${inv.invitedEmail} (email not configured)`,
    },
  );
}

export function revokeInvitation(id: string, actor: string) {
  const inv = state.invitations.find((i) => i.id === id);
  if (!inv) return;
  patch(id, { status: "revoked", revokedAt: now() }, {
    estateId: inv.estateId,
    invitationId: id,
    eventType: "CLIENT_PORTAL_INVITE_REVOKED",
    actor,
    actorRole: "staff",
  });
}

export function suspendPortalAccess(id: string, actor: string) {
  const inv = state.invitations.find((i) => i.id === id);
  if (!inv) return;
  patch(id, { status: "suspended", suspendedAt: now() }, {
    estateId: inv.estateId,
    invitationId: id,
    eventType: "CLIENT_PORTAL_ACCESS_SUSPENDED",
    actor,
    actorRole: "staff",
  });
}

export function restorePortalAccess(id: string, actor: string) {
  const inv = state.invitations.find((i) => i.id === id);
  if (!inv) return;
  patch(id, { status: "active", suspendedAt: undefined }, {
    estateId: inv.estateId,
    invitationId: id,
    eventType: "CLIENT_PORTAL_ACCESS_RESTORED",
    actor,
    actorRole: "staff",
  });
}

/* ------------------------------------------------------- client-side flow */

export type InvitationResolution =
  | { ok: true; invitation: ClientPortalInvitation }
  | { ok: false; reason: "invalid" | "expired" | "revoked" | "suspended" };

/** Server-side equivalent: opaque token -> firm/estate/client/email. */
export function resolveInvitation(token: string): InvitationResolution {
  const raw = state.invitations.find((i) => i.tokenReference === token);
  if (!raw) return { ok: false, reason: "invalid" };
  const inv = withExpiry(raw);
  if (inv.status === "revoked") return { ok: false, reason: "revoked" };
  if (inv.status === "suspended") return { ok: false, reason: "suspended" };
  if (inv.status === "expired") return { ok: false, reason: "expired" };
  return { ok: true, invitation: inv };
}

export function markInvitationOpened(id: string) {
  const inv = state.invitations.find((i) => i.id === id);
  if (!inv || inv.openedAt || inv.status === "active") return;
  patch(id, { status: "opened", openedAt: now() }, {
    estateId: inv.estateId,
    invitationId: id,
    eventType: "CLIENT_PORTAL_INVITE_OPENED",
    actor: inv.clientName,
    actorRole: "client",
  });
}

/** One-time activation. Ties the authenticated user to the invitation. */
export function activateInvitation(id: string, userId: string | undefined, previewOnly: boolean) {
  const inv = state.invitations.find((i) => i.id === id);
  if (!inv) return;
  state = {
    ...state,
    invitations: state.invitations.map((i) =>
      i.id === id
        ? { ...i, status: "active", acceptedAt: now(), activatedUserId: userId, lastActivityAt: now() }
        : i,
    ),
    previewSession: previewOnly
      ? { invitationId: id, email: inv.invitedEmail, estateId: inv.estateId, activatedAt: now() }
      : state.previewSession ?? null,
  };
  logEvent({
    estateId: inv.estateId,
    invitationId: id,
    eventType: "CLIENT_PORTAL_INVITE_ACCEPTED",
    actor: inv.clientName,
    actorRole: "client",
  });
  logEvent({
    estateId: inv.estateId,
    invitationId: id,
    eventType: "CLIENT_LOGIN",
    actor: inv.clientName,
    actorRole: "client",
  });
  commit(state);
}

export function touchPortalActivity(estateId: string) {
  const inv = state.invitations.find((i) => i.estateId === estateId && i.status === "active");
  if (!inv) return;
  patch(inv.id, { lastActivityAt: now() });
}

export function clearPreviewSession() {
  commit({ ...state, previewSession: null });
}

/* ------------------------------------------------------------------ utils */

export const inviteUrl = (token: string) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}/client-portal/invite/${token}`;

export const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
};

/** No real transactional email backend is configured for this project yet. */
export const EMAIL_DELIVERY_CONFIGURED = false;
