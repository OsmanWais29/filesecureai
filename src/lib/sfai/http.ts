// One place that talks to the SFAI Platform Module API on AWS.
//   VITE_SFAI_API_URL  the API base, e.g. https://api.sfai.ca/api (default: local dev)
// Every request carries the signed-in user's token (see auth.ts).

export const API_URL: string = import.meta.env.VITE_SFAI_API_URL ?? "http://localhost:3000/api";

// The current login token, set by auth.ts (null when signed out)
let token: string | null = null;
export const setToken = (t: string | null) => {
  token = t;
  void refreshViewKey();
};
export const getToken = () => token;

// File-view key for getPublicUrl links (<img>, <iframe>): it only opens files and
// lasts 10 minutes, so links never carry the login token. Renewed before it runs out.
let viewKey: string | null = null;
let viewTimer: ReturnType<typeof setTimeout> | undefined;
export const getViewKey = () => viewKey;
async function refreshViewKey() {
  clearTimeout(viewTimer);
  if (!token) {
    viewKey = null;
    return;
  }
  const forToken = token;
  try {
    const { key, expiresAt } = await request<{ key: string; expiresAt: string }>("/files/view-key");
    if (token !== forToken) return; // signed out or switched user meanwhile
    viewKey = key;
    const renewIn = Date.parse(expiresAt) - Date.now() - 2 * 60_000; // 2 minutes early
    viewTimer = setTimeout(refreshViewKey, Math.max(renewIn, 30_000));
  } catch {
    viewTimer = setTimeout(refreshViewKey, 30_000); // offline: try again soon
  }
}
let refresh: (() => Promise<string | null>) | null = null;
export const onRefreshNeeded = (fn: typeof refresh) => (refresh = fn);

// The error shape the app already expects from Supabase
export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  context?: Response; // the raw response (old functions.invoke callers read it)
}

export async function request<T = unknown>(path: string, json?: unknown, method = "POST"): Promise<T> {
  const send = (t: string | null) =>
    fetch(API_URL + path, {
      method,
      headers: {
        ...(json !== undefined && { "content-type": "application/json" }),
        ...(t && { authorization: `Bearer ${t}` }),
      },
      body: json === undefined ? undefined : JSON.stringify(json),
    });

  let res = await send(token);
  // Token expired: refresh once and retry
  if (res.status === 401 && refresh) {
    const fresh = await refresh();
    if (fresh) res = await send(fresh);
  }
  if (!res.ok) {
    const body = await res.clone().json().catch(() => ({}));
    const err: ApiError = {
      message: (typeof body.error === "string" ? body.error : body.error?.message) ?? `Request failed (${res.status})`,
      code: String(res.status),
      status: res.status,
      context: res,
    };
    throw err;
  }
  return (res.status === 204 ? null : res.json()) as Promise<T>;
}
