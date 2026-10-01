// Test harness: real Postgres (PGlite, in memory) + fake email/SMS/S3/HTTP.
import { createCrmModule, type AuthUser } from "../src/index.js";
import { localDb } from "../src/db/local.js";

export interface Sent {
  kind: "email" | "sms";
  firmId: string;
  to: string;
  text: string;
}
export type FakeFetch = (url: string, init?: RequestInit) => Promise<Response> | Response;

export async function setup(fetchImpl?: FakeFetch) {
  const db = await localDb();
  const sent: Sent[] = [];
  const calls: { url: string; init?: RequestInit }[] = [];

  const crm = await createCrmModule({
    db,
    config: {
      basePath: "/crm",
      localKey: "11".repeat(32),
      publicApiUrl: "https://api.test",
      appUrl: "https://app.test",
      stateSecret: "test-secret",
      google: { clientId: "g-id", clientSecret: "g-secret" },
    },
    // Test login: firm + role come from headers
    authenticate: async (req): Promise<AuthUser | null> => {
      const firmId = req.headers.get("x-firm");
      return firmId
        ? { id: "u1", firmId, role: req.headers.get("x-role") ?? "trustee" }
        : null;
    },
    services: {
      mail: async (firmId, e) => (
        sent.push({ kind: "email", firmId, to: e.to, text: e.subject }),
        "ses"
      ),
      sms: async (firmId, to, text) => (
        sent.push({ kind: "sms", firmId, to, text }),
        "sns"
      ),
      storage: {
        uploadUrl: async (key) => `https://s3.test/put/${key}`,
        downloadUrl: async (key) => `https://s3.test/get/${key}`,
      },
      fetch: (async (url: string, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        return fetchImpl
          ? fetchImpl(String(url), init)
          : new Response("{}", { status: 404 });
      }) as typeof fetch,
    },
    ask: async (_ctx, firmId, history) => ({
      text: `echo ${firmId}: ${history.at(-1)?.text}`,
      drafts: [],
    }),
  });

  // Call the API as a user of `firm` (default "f1")
  const api = async (
    path: string,
    init: RequestInit & { json?: unknown } = {},
    firm = "f1",
    role = "trustee",
  ) => {
    const headers: Record<string, string> = { "x-firm": firm, "x-role": role };
    if (init.json !== undefined) headers["content-type"] = "application/json";
    const res = await crm.app.request(`/crm${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
    const text = await res.text();
    return { status: res.status, body: text ? safeJson(text) : null };
  };

  return { crm, db, sent, calls, api };
}

const safeJson = (t: string) => {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
};

// Next weekday (Mon-Fri) at least `daysAhead` from now, as YYYY-MM-DD
export function nextWeekday(daysAhead = 2) {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
