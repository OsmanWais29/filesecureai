import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client portal provisioning + invitation model — Supabase backed.
 *
 * Tables:
 *   client_portal_invitations   one invite per debtor/estate relationship
 *   client_portal_access        authenticated portal user -> authorized estate
 *   client_portal_events        audit trail
 *
 * SECURITY DESIGN
 * The invitation URL carries ONLY an opaque token. The database never stores the
 * raw token — only a SHA-256 fingerprint — so a leaked row cannot be replayed as
 * a credential. Resolution/redemption run through SECURITY DEFINER routines
 * (`peek_client_portal_invitation`, `redeem_client_portal_invitation`) which
 * verify expiry, revocation, one-time use and that the signed-in email matches
 * the invited email before any estate access row is created.
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
  firmName: string;
  estateId: string;
  clientId: string;
  clientName: string;
  proceedingLabel?: string;
  trusteeName?: string;
  officeName?: string;
  invitedEmail: string;
  /** Present only in the browser session that created the invite. */
  tokenReference?: string;
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
  | "CLIENT_PORTAL_EMAIL_CHANGED"
  | "CLIENT_LOGIN";

export interface PortalEvent {
  id: string;
  estateId: string;
  invitationId?: string;
  eventType: PortalEventType | string;
  actor: string;
  actorRole: "staff" | "client" | "system";
  occurredAt: string;
  detail?: string;
}

export const DEFAULT_EXPIRY_DAYS = 7;

/* ----------------------------------------------------------------- helpers */

const now = () => new Date().toISOString();

const opaqueToken = () => {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Row = Record<string, any>;

const rowToInvitation = (row: Row): ClientPortalInvitation => {
  const expired =
    ["created", "sent", "opened"].includes(row.status) && new Date(row.expires_at).getTime() < Date.now();
  return {
    id: row.id,
    firmName: row.firm_name ?? "",
    estateId: row.estate_id,
    clientId: row.client_id ?? "",
    clientName: row.invited_name ?? "",
    proceedingLabel: row.proceeding_label ?? undefined,
    trusteeName: row.trustee_name ?? undefined,
    officeName: row.office_name ?? undefined,
    invitedEmail: row.invited_email,
    status: expired ? "expired" : (row.status as InvitationStatus),
    createdByUserId: row.created_by,
    createdByName: row.created_by_name ?? "Trustee staff",
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    sentAt: row.sent_at ?? undefined,
    openedAt: row.opened_at ?? undefined,
    acceptedAt: row.redeemed_at ?? undefined,
    revokedAt: row.revoked_at ?? undefined,
    suspendedAt: row.suspended_at ?? undefined,
    activatedUserId: row.redeemed_by ?? undefined,
    resendCount: row.resend_count ?? 0,
    lastSentAt: row.last_sent_at ?? undefined,
    lastActivityAt: row.last_activity_at ?? undefined,
    simulated: !EMAIL_DELIVERY_CONFIGURED,
  };
};

/* -------------------------------------------------------- refresh signalling */

let version = 0;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const refreshPortalProvisioning = () => {
  version += 1;
  listeners.forEach((l) => l());
};
const useVersion = () =>
  useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  );

/* --------------------------------------------------------- token disclosure */

/**
 * Freshly minted tokens are held in memory only (never localStorage) so the
 * staff member can copy the link once, then they disappear on reload.
 */
const mintedTokens = new Map<string, string>();
export const mintedTokenFor = (invitationId: string) => mintedTokens.get(invitationId);

/* ------------------------------------------------------------------- reads */

export function useEstateInvitation(estateId?: string) {
  const v = useVersion();
  const [invitation, setInvitation] = useState<ClientPortalInvitation | undefined>();

  useEffect(() => {
    let cancelled = false;
    if (!estateId) {
      setInvitation(undefined);
      return;
    }
    supabase
      .from("client_portal_invitations")
      .select("*")
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) setInvitation(data?.[0] ? rowToInvitation(data[0] as Row) : undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [estateId, v]);

  return invitation;
}

export function usePortalEvents(estateId?: string) {
  const v = useVersion();
  const [events, setEvents] = useState<PortalEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!estateId) {
      setEvents([]);
      return;
    }
    supabase
      .from("client_portal_events")
      .select("*")
      .eq("estate_id", estateId)
      .order("occurred_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (cancelled) return;
        setEvents(
          (data ?? []).map((r: Row) => ({
            id: r.id,
            estateId: r.estate_id,
            invitationId: r.invitation_id ?? undefined,
            eventType: r.event_type,
            actor: r.actor_name ?? (r.actor_role === "client" ? "Client" : "System"),
            actorRole: r.actor_role,
            occurredAt: r.occurred_at,
            detail: r.detail ?? undefined,
          })),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [estateId, v]);

  return events;
}

/* ------------------------------------------------------------------ writes */

async function logEvent(e: {
  estateId: string;
  invitationId?: string;
  eventType: PortalEventType;
  actor: string;
  actorRole: "staff" | "client" | "system";
  previousState?: string;
  newState?: string;
  detail?: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  await supabase.from("client_portal_events").insert({
    estate_id: e.estateId,
    invitation_id: e.invitationId ?? null,
    event_type: e.eventType,
    actor_user_id: auth?.user?.id ?? null,
    actor_name: e.actor,
    actor_role: e.actorRole,
    previous_state: e.previousState ?? null,
    new_state: e.newState ?? null,
    detail: e.detail ?? null,
  });
}

export async function createInvitation(input: {
  estateId: string;
  clientId?: string;
  clientName: string;
  invitedEmail: string;
  firmName: string;
  officeName?: string;
  proceedingLabel?: string;
  trusteeName?: string;
  createdByName: string;
}): Promise<ClientPortalInvitation> {
  const token = opaqueToken();
  const tokenHash = await sha256Hex(token);
  const { data: auth } = await supabase.auth.getUser();
  const createdBy = auth?.user?.id;
  if (!createdBy) throw new Error("You must be signed in to create a client portal invitation.");

  const isUuid = (v?: string) =>
    !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  const { data, error } = await supabase
    .from("client_portal_invitations")
    .insert({
      estate_id: input.estateId,
      client_id: isUuid(input.clientId) ? input.clientId! : null,
      invited_email: input.invitedEmail.trim().toLowerCase(),

      invited_name: input.clientName,
      token_hash: tokenHash,
      status: "created",
      firm_name: input.firmName,
      office_name: input.officeName ?? null,
      trustee_name: input.trusteeName ?? null,
      proceeding_label: input.proceedingLabel ?? null,
      created_by: createdBy,
      created_by_name: input.createdByName,
      expires_at: new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 864e5).toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;

  const invitation = { ...rowToInvitation(data as Row), tokenReference: token };
  mintedTokens.set(invitation.id, token);

  await logEvent({
    estateId: invitation.estateId,
    invitationId: invitation.id,
    eventType: "CLIENT_PORTAL_INVITE_CREATED",
    actor: input.createdByName,
    actorRole: "staff",
    newState: "created",
    detail: invitation.invitedEmail,
  });
  refreshPortalProvisioning();
  return invitation;
}

async function patch(
  id: string,
  values: Row,
  event?: {
    estateId: string;
    eventType: PortalEventType;
    actor: string;
    previousState?: string;
    newState?: string;
    detail?: string;
  },
) {
  const { error } = await supabase.from("client_portal_invitations").update(values as never).eq("id", id);
  if (error) throw error;
  if (event) {
    await logEvent({ ...event, invitationId: id, actorRole: "staff" });
  }
  refreshPortalProvisioning();
}

export async function markInvitationSent(id: string, actor: string, delivered: boolean, resend = false) {
  const { data } = await supabase.from("client_portal_invitations").select("*").eq("id", id).single();
  if (!data) return;
  const inv = rowToInvitation(data as Row);
  await patch(
    id,
    {
      status: inv.status === "active" ? "active" : "sent",
      sent_at: inv.sentAt ?? now(),
      last_sent_at: now(),
      resend_count: resend ? inv.resendCount + 1 : inv.resendCount,
    },
    {
      estateId: inv.estateId,
      eventType: resend ? "CLIENT_PORTAL_INVITE_RESENT" : "CLIENT_PORTAL_INVITE_SENT",
      actor,
      previousState: inv.status,
      newState: "sent",
      detail: delivered
        ? `Emailed ${inv.invitedEmail}`
        : `Prepared for ${inv.invitedEmail} (email delivery not configured)`,
    },
  );
}

export async function changeInvitationEmail(id: string, estateId: string, email: string, actor: string) {
  const next = email.trim().toLowerCase();
  await patch(id, { invited_email: next }, {
    estateId,
    eventType: "CLIENT_PORTAL_EMAIL_CHANGED",
    actor,
    newState: next,
    detail: `Invitation email changed to ${next}`,
  });
}

export async function revokeInvitation(id: string, actor: string, estateId?: string) {
  const eid = estateId ?? (await estateIdFor(id));
  if (!eid) return;
  await patch(id, { status: "revoked", revoked_at: now() }, {
    estateId: eid,
    eventType: "CLIENT_PORTAL_INVITE_REVOKED",
    actor,
    newState: "revoked",
  });
}

export async function suspendPortalAccess(id: string, actor: string, estateId?: string) {
  const eid = estateId ?? (await estateIdFor(id));
  if (!eid) return;
  await supabase.from("client_portal_access").update({ status: "disabled", disabled_at: now() }).eq("invitation_id", id);
  await patch(id, { status: "suspended", suspended_at: now() }, {
    estateId: eid,
    eventType: "CLIENT_PORTAL_ACCESS_SUSPENDED",
    actor,
    newState: "suspended",
  });
}

export async function restorePortalAccess(id: string, actor: string, estateId?: string) {
  const eid = estateId ?? (await estateIdFor(id));
  if (!eid) return;
  await supabase
    .from("client_portal_access")
    .update({ status: "active", disabled_at: null })
    .eq("invitation_id", id);
  await patch(id, { status: "active", suspended_at: null }, {
    estateId: eid,
    eventType: "CLIENT_PORTAL_ACCESS_RESTORED",
    actor,
    newState: "active",
  });
}

async function estateIdFor(id: string) {
  const { data } = await supabase.from("client_portal_invitations").select("estate_id").eq("id", id).single();
  return (data as Row | null)?.estate_id as string | undefined;
}

/* -------------------------------------------------------- client-side flow */

export interface InvitationPreview {
  invitationId: string;
  invitedEmail: string;
  invitedName: string;
  firmName: string;
  expiresAt: string;
}

export type InvitationResolution =
  | { ok: true; invitation: InvitationPreview }
  | { ok: false; reason: "invalid" | "expired" | "revoked" | "suspended" | "used" };

/** Opaque token -> minimum safe payload, resolved server-side. */
export async function resolveInvitation(token: string): Promise<InvitationResolution> {
  if (!token) return { ok: false, reason: "invalid" };
  const { data, error } = await supabase.rpc("peek_client_portal_invitation", { p_token: token });
  const payload = data as Row | null;
  if (error || !payload) return { ok: false, reason: "invalid" };
  if (!payload.ok) return { ok: false, reason: (payload.reason ?? "invalid") as never };
  return {
    ok: true,
    invitation: {
      invitationId: payload.invitation_id,
      invitedEmail: payload.invited_email,
      invitedName: payload.invited_name ?? "",
      firmName: payload.firm_name ?? "your trustee",
      expiresAt: payload.expires_at,
    },
  };
}

export async function markInvitationOpened(token: string) {
  await supabase.rpc("mark_client_portal_invitation_opened", { p_token: token });
}

export type RedemptionResult =
  | { ok: true; estateId: string }
  | {
      ok: false;
      reason: "invalid" | "expired" | "revoked" | "suspended" | "used" | "email_mismatch" | "unauthenticated";
    };

/** One-time redemption for the currently authenticated portal user. */
export async function redeemInvitation(token: string): Promise<RedemptionResult> {
  const { data, error } = await supabase.rpc("redeem_client_portal_invitation", { p_token: token });
  const payload = data as Row | null;
  if (error || !payload) return { ok: false, reason: "invalid" };
  if (!payload.ok) return { ok: false, reason: (payload.reason ?? "invalid") as never };
  return { ok: true, estateId: payload.estate_id };
}

export async function recordPortalLogin() {
  await supabase.rpc("record_client_portal_login");
}

export async function touchPortalActivity(estateId: string) {
  await supabase
    .from("client_portal_invitations")
    .update({ last_activity_at: now() })
    .eq("estate_id", estateId)
    .eq("status", "active");
}

/* -------------------------------------------------- preview-only activation */

const PREVIEW_KEY = "securefiles.clientPortalPreview.v1";

export interface PreviewSession {
  invitationId: string;
  email: string;
  estateId: string;
  activatedAt: string;
}

const readPreview = (): PreviewSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREVIEW_KEY);
    return raw ? (JSON.parse(raw) as PreviewSession) : null;
  } catch {
    return null;
  }
};

let previewState: PreviewSession | null = readPreview();
const previewListeners = new Set<() => void>();

const setPreview = (next: PreviewSession | null) => {
  previewState = next;
  try {
    if (next) window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(PREVIEW_KEY);
  } catch {
    /* ignore */
  }
  previewListeners.forEach((l) => l());
};

export const usePreviewSession = () =>
  useSyncExternalStore(
    (l) => {
      previewListeners.add(l);
      return () => previewListeners.delete(l);
    },
    () => previewState,
    () => previewState,
  );

export const hasPreviewSession = () => Boolean(readPreview());
export const startPreviewSession = (s: PreviewSession) => setPreview(s);
export const clearPreviewSession = () => setPreview(null);

/* ------------------------------------------------------------------ utils */

export const inviteUrl = (token: string) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}/client-portal/invite/${token}`;

export const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
};

/** Portal access rows for the signed-in client. */
export function useMyPortalAccess() {
  const [state, setState] = useState<{ loading: boolean; estateIds: string[] }>({ loading: true, estateIds: [] });

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return setState({ loading: false, estateIds: [] });
    const { data } = await supabase
      .from("client_portal_access")
      .select("estate_id")
      .eq("user_id", auth.user.id)
      .eq("status", "active");
    setState({ loading: false, estateIds: (data ?? []).map((r: Row) => r.estate_id) });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}

/** No real transactional email backend is configured for this project yet. */
export const EMAIL_DELIVERY_CONFIGURED = false;

/* ------------------------------------------- invite-specific account creation */

export type CreatePortalAccountResult =
  | { ok: true; status: "created" | "existing_account"; email: string }
  | {
      ok: false;
      reason:
        | "invalid"
        | "expired"
        | "revoked"
        | "suspended"
        | "used"
        | "staff_account"
        | "rate_limited"
        | "server_error";
    };

/**
 * Creates the client's auth account server-side from the opaque invitation
 * token. Possession of the invitation link proves control of the invited
 * mailbox, so the account is created already confirmed and NO Supabase
 * confirmation email is sent. Existing accounts are never modified.
 */
export async function createPortalAccount(input: {
  token: string;
  fullName: string;
  password: string;
}): Promise<CreatePortalAccountResult> {
  const { data, error } = await supabase.functions.invoke("create-client-portal-account", {
    body: { token: input.token, fullName: input.fullName, password: input.password },
  });

  if (data && typeof data === "object" && "status" in (data as Row)) {
    const payload = data as Row;
    return { ok: true, status: payload.status, email: payload.email };
  }

  // Non-2xx responses surface as FunctionsHttpError with the body on `context`.
  const ctx = (error as { context?: Response } | null)?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const payload = (await ctx.json()) as Row;
      const reason = payload?.error;
      if (
        reason === "expired" ||
        reason === "revoked" ||
        reason === "suspended" ||
        reason === "used" ||
        reason === "rate_limited"
      ) {
        return { ok: false, reason };
      }
      if (reason === "invalid" || reason === "invalid_name" || reason === "invalid_password") {
        return { ok: false, reason: "invalid" };
      }
    } catch {
      /* fall through */
    }
  }
  if (data && typeof data === "object" && "error" in (data as Row)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: false, reason: "server_error" };
}
