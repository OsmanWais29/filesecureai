// Login, replacing Supabase Auth. Same method names and { data, error } results as
// supabase.auth, backed by the shared Amazon Cognito user pool:
//   VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID
// Without them (local dev) it signs in against the dev server's /dev-login instead.
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";
import { API_URL, onRefreshNeeded, request, setToken, type ApiError } from "./http";

export interface User {
  id: string;
  email: string;
  aud: "authenticated";
  created_at: string;
  // The app reads user_type ("trustee" | "client") to pick the portal
  user_metadata: { full_name?: string; user_type: "trustee" | "client"; role: string };
  app_metadata: { firm_id: string; role: string };
}
export interface Session {
  access_token: string; // the Cognito ID token (carries firm + role)
  refresh_token: string;
  token_type: "bearer";
  expires_at: number; // seconds since 1970
  expires_in: number;
  user: User;
}
type AuthEvent = "INITIAL_SESSION" | "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED";
type Listener = (event: AuthEvent, session: Session | null) => void;

const POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;
const pool = POOL_ID && CLIENT_ID ? new CognitoUserPool({ UserPoolId: POOL_ID, ClientId: CLIENT_ID }) : null;
const DEV_KEY = "sfai.dev.session"; // local dev only

// ---------- Session state ----------

let current: Session | null = null;
const listeners = new Set<Listener>();
const ok = <T>(data: T) => ({ data, error: null });
const fail = (e: unknown) => ({
  data: { user: null, session: null },
  error: { message: (e as Error)?.message ?? String(e), name: "AuthError" } as ApiError & { name: string },
});

// Read a JWT's claims (the signature is checked by the API, not here)
function claims(jwt: string): Record<string, string | number> {
  const part = jwt.split(".")[1] ?? "";
  return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
}

function toSession(idToken: string, refreshToken: string): Session {
  const c = claims(idToken);
  const role = String(c["custom:role"] ?? "staff");
  const exp = Number(c.exp ?? Date.now() / 1000 + 3600);
  return {
    access_token: idToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    expires_at: exp,
    expires_in: Math.max(0, Math.round(exp - Date.now() / 1000)),
    user: {
      id: String(c.sub ?? c.id),
      email: String(c.email ?? ""),
      aud: "authenticated",
      created_at: new Date(Number(c.iat ?? 0) * 1000).toISOString(),
      user_metadata: {
        full_name: c.name ? String(c.name) : undefined,
        user_type: role === "client" ? "client" : "trustee",
        role,
      },
      app_metadata: { firm_id: String(c["custom:firm_id"] ?? c.firmId ?? ""), role },
    },
  };
}

function setSession(s: Session | null, event: AuthEvent) {
  current = s;
  setToken(s?.access_token ?? null);
  listeners.forEach((l) => l(event, s));
}

const fromCognito = (s: CognitoUserSession) =>
  toSession(s.getIdToken().getJwtToken(), s.getRefreshToken().getToken());

// Dev tokens are "dev.<base64 user>"; give them the same claims a Cognito token has
function devSession(token: string): Session {
  const u = JSON.parse(atob(token.slice(4).replace(/-/g, "+").replace(/_/g, "/")));
  const fake = { sub: u.id, email: u.email, name: u.name, "custom:role": u.role, "custom:firm_id": u.firmId, exp: Date.now() / 1000 + 86400 };
  const s = toSession(`x.${btoa(JSON.stringify(fake))}.x`, "");
  return { ...s, access_token: token };
}

// Restore the session saved by the last sign-in (Cognito refreshes it if needed)
const ready: Promise<void> = new Promise((resolve) => {
  if (!pool) {
    const saved = localStorage.getItem(DEV_KEY);
    if (saved) setSession(devSession(saved), "INITIAL_SESSION");
    return resolve();
  }
  const user = pool.getCurrentUser();
  if (!user) return resolve();
  user.getSession((err: Error | null, s: CognitoUserSession | null) => {
    if (!err && s?.isValid()) setSession(fromCognito(s), "INITIAL_SESSION");
    resolve();
  });
});

// ---------- Cognito calls, as promises ----------

const cognitoUser = (email: string) => new CognitoUser({ Username: email.trim().toLowerCase(), Pool: pool! });

function cognitoSignIn(email: string, password: string) {
  return new Promise<CognitoUserSession>((resolve, reject) =>
    cognitoUser(email).authenticateUser(
      new AuthenticationDetails({ Username: email.trim().toLowerCase(), Password: password }),
      {
        onSuccess: resolve,
        onFailure: reject,
        newPasswordRequired: () => reject(new Error("Please reset your password first")),
      },
    ),
  );
}

async function refreshNow(): Promise<Session | null> {
  if (!pool) return current; // dev tokens don't expire
  const user = pool.getCurrentUser();
  if (!user || !current) return null;
  const s = await new Promise<CognitoUserSession | null>((resolve) =>
    user.getSession((err: Error | null, sess: CognitoUserSession | null) => {
      if (err || !sess) return resolve(null);
      user.refreshSession(sess.getRefreshToken(), (e: Error | null, fresh: CognitoUserSession) =>
        resolve(e ? null : fresh),
      );
    }),
  );
  if (!s) {
    setSession(null, "SIGNED_OUT");
    return null;
  }
  setSession(fromCognito(s), "TOKEN_REFRESHED");
  return current;
}
onRefreshNeeded(async () => (await refreshNow())?.access_token ?? null);

// Refresh a minute before the token expires
async function fresh() {
  await ready;
  if (current && current.expires_at * 1000 - Date.now() < 60_000) await refreshNow();
  return current;
}

// ---------- The supabase.auth look-alike ----------

export const auth = {
  async getSession() {
    return ok({ session: await fresh() });
  },

  async getUser() {
    const s = await fresh();
    return s ? ok({ user: s.user }) : { data: { user: null }, error: { message: "Auth session missing!", name: "AuthError" } };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      if (pool) {
        setSession(fromCognito(await cognitoSignIn(email, password)), "SIGNED_IN");
      } else {
        const res = await fetch(new URL(API_URL).origin + "/dev-login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Sign-in failed");
        localStorage.setItem(DEV_KEY, body.token);
        setSession(devSession(body.token), "SIGNED_IN");
      }
      return ok({ user: current!.user, session: current });
    } catch (e) {
      return fail(e);
    }
  },

  // Trustees sign up a new firm. Clients join through their trustee's invite link.
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, string>; emailRedirectTo?: string } }) {
    const meta = options?.data ?? {};
    if (meta.user_type === "client") {
      return fail(new Error("Client accounts are created from your trustee's invitation link."));
    }
    try {
      await request("/public/signup", {
        email,
        password,
        fullName: meta.full_name || email.split("@")[0],
        firmName: meta.firm_name,
      });
    } catch (e) {
      return fail(e);
    }
    return auth.signInWithPassword({ email, password });
  },

  async signOut(_opts?: { scope?: "local" | "global" | "others" }) {
    if (pool) pool.getCurrentUser()?.signOut();
    localStorage.removeItem(DEV_KEY);
    setSession(null, "SIGNED_OUT");
    return { error: null };
  },

  async refreshSession() {
    const s = await refreshNow();
    return s ? ok({ session: s, user: s.user }) : fail(new Error("Session expired"));
  },

  onAuthStateChange(cb: Listener) {
    listeners.add(cb);
    void ready.then(() => cb("INITIAL_SESSION", current));
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },

  // Cognito emails a code; the user enters it with a new password (confirmPasswordReset)
  async resetPasswordForEmail(email: string, _opts?: unknown) {
    if (!pool) return ok({});
    try {
      await new Promise<void>((resolve, reject) =>
        cognitoUser(email).forgotPassword({ onSuccess: () => resolve(), onFailure: reject, inputVerificationCode: () => resolve() }),
      );
      return ok({});
    } catch (e) {
      return fail(e);
    }
  },
  async confirmPasswordReset(email: string, code: string, newPassword: string) {
    if (!pool) return ok({});
    try {
      await new Promise<void>((resolve, reject) =>
        cognitoUser(email).confirmPassword(code, newPassword, { onSuccess: () => resolve(), onFailure: reject }),
      );
      return ok({});
    } catch (e) {
      return fail(e);
    }
  },

  // Profile fields live in the "profiles" table; role and firm can't be self-edited
  async updateUser(_attrs: { data?: Record<string, unknown>; password?: string }) {
    const s = await fresh();
    return s ? ok({ user: s.user }) : fail(new Error("Not signed in"));
  },

  // Accounts are created verified, so there is nothing to confirm
  async resend(_opts?: unknown) {
    return ok({});
  },
  async verifyOtp(_opts?: unknown) {
    return ok({ user: current?.user ?? null, session: current });
  },
};

// The current session without waiting (for synchronous file URLs)
export const sessionNow = () => current;
