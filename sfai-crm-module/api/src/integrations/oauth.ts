// OAuth for Google (Calendar + Gmail) and Microsoft 365 (Outlook calendar + mail).
// Flow: /connect returns a consent URL -> provider redirects to /callback ->
// we store the refresh token (KMS-encrypted) -> later calls swap it for access tokens.
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { integrations } from "../db/schema.js";

export type OAuthProvider = "google" | "microsoft";

const ms = (tenant: string) => `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`;

// Endpoints + scopes per provider
function provider(ctx: Ctx, p: OAuthProvider) {
  if (p === "google") {
    if (!ctx.cfg.google) throw new Error("Google is not configured");
    return {
      ...ctx.cfg.google,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes:
        "openid email https://www.googleapis.com/auth/calendar.events " +
        "https://www.googleapis.com/auth/gmail.send",
      extra: { access_type: "offline", prompt: "consent" }, // needed for refresh token
    };
  }
  if (!ctx.cfg.microsoft) throw new Error("Microsoft is not configured");
  return {
    ...ctx.cfg.microsoft,
    authUrl: `${ms(ctx.cfg.microsoft.tenant)}/authorize`,
    tokenUrl: `${ms(ctx.cfg.microsoft.tenant)}/token`,
    scopes: "offline_access openid email User.Read Calendars.ReadWrite Mail.Send",
    extra: {} as Record<string, string>,
  };
}

const redirectUri = (ctx: Ctx, p: OAuthProvider) =>
  `${ctx.cfg.publicApiUrl}${ctx.cfg.basePath}/integrations/${p}/callback`;

// ---------- Signed "state" (stops forged callbacks) ----------

const sign = (ctx: Ctx, data: string) =>
  createHmac("sha256", ctx.cfg.stateSecret).update(data).digest("base64url");

function makeState(ctx: Ctx, firmId: string, p: OAuthProvider) {
  const data = Buffer.from(
    JSON.stringify({ firmId, p, exp: Date.now() + 600_000 }),
  ).toString("base64url");
  return `${data}.${sign(ctx, data)}`;
}

export function readState(ctx: Ctx, state: string): { firmId: string; p: OAuthProvider } {
  const [data, mac] = state.split(".");
  const expected = Buffer.from(sign(ctx, data ?? ""));
  if (
    !mac ||
    mac.length !== expected.length ||
    !timingSafeEqual(Buffer.from(mac), expected)
  ) {
    throw new Error("Invalid OAuth state");
  }
  const parsed = JSON.parse(Buffer.from(data, "base64url").toString());
  if (parsed.exp < Date.now()) throw new Error("OAuth state expired");
  return parsed;
}

// ---------- Flow ----------

export function consentUrl(ctx: Ctx, firmId: string, p: OAuthProvider) {
  const cfg = provider(ctx, p);
  const q = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(ctx, p),
    response_type: "code",
    scope: cfg.scopes,
    state: makeState(ctx, firmId, p),
    ...cfg.extra,
  });
  return `${cfg.authUrl}?${q}`;
}

// POST to the token endpoint (code exchange or refresh)
async function tokenRequest(ctx: Ctx, p: OAuthProvider, params: Record<string, string>) {
  const cfg = provider(ctx, p);
  const res = await ctx.svc.fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      ...params,
    }),
  });
  if (!res.ok) throw new Error(`${p} token request failed: ${res.status}`);
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
  }>;
}

// Callback: swap the code for tokens and save the (encrypted) refresh token
export async function finishConnect(
  ctx: Ctx,
  p: OAuthProvider,
  code: string,
  firmId: string,
) {
  const t = await tokenRequest(ctx, p, {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(ctx, p),
  });
  if (!t.refresh_token) throw new Error(`${p} did not return a refresh token`);
  const idClaims = t.id_token
    ? JSON.parse(Buffer.from(t.id_token.split(".")[1], "base64url").toString())
    : {};
  const row = {
    firmId,
    provider: p,
    account: idClaims.email ?? null,
    secretEncrypted: await ctx.svc.crypto.encrypt(t.refresh_token, firmId),
  };
  await ctx.db
    .insert(integrations)
    .values(row)
    .onConflictDoUpdate({
      target: [integrations.firmId, integrations.provider],
      set: {
        account: row.account,
        secretEncrypted: row.secretEncrypted,
        connectedAt: new Date(),
      },
    });
}

// Short-lived access tokens, cached in memory until just before they expire
const cache = new Map<string, { token: string; until: number }>();

export async function accessToken(ctx: Ctx, firmId: string, p: OAuthProvider) {
  const key = `${firmId}:${p}`;
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.token;
  const [row] = await ctx.db
    .select()
    .from(integrations)
    .where(and(eq(integrations.firmId, firmId), eq(integrations.provider, p)));
  if (!row) return null; // not connected
  const refresh = await ctx.svc.crypto.decrypt(row.secretEncrypted, firmId);
  const t = await tokenRequest(ctx, p, {
    grant_type: "refresh_token",
    refresh_token: refresh,
  });
  cache.set(key, {
    token: t.access_token,
    until: Date.now() + (t.expires_in - 60) * 1000,
  });
  return t.access_token;
}
