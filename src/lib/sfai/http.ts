// One place that talks to the SFAI Platform Module API on AWS.
//   VITE_SFAI_API_URL  the API base, e.g. https://api.sfai.ca/api (default: local dev)
// Every request carries the signed-in user's token (see auth.ts).

export const API_URL: string = import.meta.env.VITE_SFAI_API_URL ?? "http://localhost:3000/api";

// The current login token, set by auth.ts (null when signed out)
let token: string | null = null;
export const setToken = (t: string | null) => (token = t);
export const getToken = () => token;
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
