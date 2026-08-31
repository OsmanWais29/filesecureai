import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Invite-specific client account creation.
 *
 * Possession of the one-time invitation link already proves control of the
 * invited mailbox, so accounts created through this path are created
 * server-side with `email_confirm: true`. No Supabase confirmation email is
 * sent, which also means this path can never hit the confirmation-email rate
 * limit. Trustee/staff auth is untouched.
 *
 * The browser never sends an email, estate id or invitation id — everything is
 * derived from the SHA-256 fingerprint of the opaque token.
 */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Best-effort in-memory replay/abuse protection per warm instance.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function throttled(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let body: { token?: unknown; fullName?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim().slice(0, 120) : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!token || token.length < 16 || token.length > 256) return json({ error: "invalid" }, 400);
  if (fullName.length < 2) return json({ error: "invalid_name" }, 400);
  if (password.length < 8 || password.length > 200) return json({ error: "invalid_password" }, 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const tokenHash = await sha256Hex(token);
  if (throttled(`${ip}:${tokenHash.slice(0, 16)}`)) return json({ error: "rate_limited" }, 429);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  const { data: invitation, error: inviteError } = await admin
    .from("client_portal_invitations")
    .select("id, invited_email, invited_name, status, expires_at, revoked_at, suspended_at, redeemed_by")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (inviteError) return json({ error: "invalid" }, 400);
  if (!invitation) return json({ error: "invalid" }, 400);
  if (invitation.revoked_at || invitation.status === "revoked") return json({ error: "revoked" }, 400);
  if (invitation.suspended_at || invitation.status === "suspended") return json({ error: "suspended" }, 400);
  if (new Date(invitation.expires_at).getTime() < Date.now() || invitation.status === "expired") {
    return json({ error: "expired" }, 400);
  }

  const email = String(invitation.invited_email).trim().toLowerCase();

  // Look up an existing auth user for the invited email (never an email from the browser).
  const lookup = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=50`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
  );
  if (!lookup.ok) return json({ error: "server_error" }, 500);
  const lookupBody = (await lookup.json()) as {
    users?: Array<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>;
  };
  const existing = (lookupBody.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);

  if (existing) {
    // A trustee/staff mailbox can never be turned into a portal client account.
    if (String(existing.user_metadata?.user_type ?? "") === "trustee") {
      return json({ error: "staff_account" }, 400);
    }
    // Never touch the password of an account that already exists.
    if (invitation.redeemed_by && invitation.redeemed_by !== existing.id) {
      return json({ error: "used" }, 400);
    }
    return json({ status: "existing_account", email });
  }

  if (invitation.redeemed_by) return json({ error: "used" }, 400);

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { user_type: "client", full_name: fullName },
  });

  if (createError) {
    const message = (createError.message ?? "").toLowerCase();
    if (message.includes("already")) return json({ status: "existing_account", email });
    console.error("create-client-portal-account: createUser failed", {
      status: (createError as { status?: number }).status,
      code: (createError as { code?: string }).code,
    });
    return json({ error: "server_error" }, 500);
  }

  // The invitation is deliberately NOT marked redeemed here: redemption happens
  // through the idempotent RPC once the client holds a real session.
  return json({ status: "created", email });
});
