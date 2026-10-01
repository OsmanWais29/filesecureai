// Test harness: real Postgres (PGlite, in memory) + fake email/SMS/S3/HTTP.
import { createSfaiModule, type AuthUser } from "../src/index.js";
import { localDb } from "../src/db/local.js";
import type { AnalysisResult } from "../src/ai/analyze.js";

// A typical analysis result, as Claude would return it (no Bedrock in tests)
export const fakeAnalysis = (over: Partial<AnalysisResult> = {}): AnalysisResult => ({
  summary: "Form 31 proof of claim from Big Bank.",
  extracted_info: {
    formType: "form-31",
    formNumber: "31",
    documentStatus: "needs_review",
    clientName: "Maria Lopez",
    trusteeName: "",
    estateNumber: "31-1234567",
    district: "Ontario",
    divisionNumber: "",
    courtNumber: "",
    filingDate: "",
    dateSigned: "",
    dateBankruptcy: "",
    submissionDeadline: "",
    totalDebts: "12500",
  },
  risks: [
    {
      type: "missing_information",
      description: "Creditor signature missing",
      severity: "high",
      regulation: "BIA s.124",
      impact: "Claim may be disallowed",
      requiredAction: "Get the creditor to sign the claim",
      deadline: "2030-01-15",
    },
    {
      type: "formatting",
      description: "Minor formatting issue",
      severity: "low",
      regulation: "",
      impact: "",
      requiredAction: "",
      deadline: "",
    },
  ],
  recommendations: ["Request signed copy"],
  suggestedFolder: "Proofs of claim",
  financials: {
    monthlyIncome: null,
    monthlyExpenses: null,
    totalAssets: null,
    totalDebts: 12500,
  },
  ...over,
});

export interface Sent {
  kind: "email" | "sms";
  firmId: string;
  to: string;
  text: string;
}
export type FakeFetch = (url: string, init?: RequestInit) => Promise<Response> | Response;

// realMail: use the real mailer (Gmail/Outlook/SES code) over the fake fetch
export async function setup(
  fetchImpl?: FakeFetch,
  opts: { realMail?: boolean; analysis?: () => AnalysisResult } = {},
) {
  const db = await localDb();
  const sent: Sent[] = [];
  const files = new Map<string, Uint8Array>(); // fake S3
  const portalUsers = new Map<string, string>(); // fake Cognito: email -> role
  const calls: { url: string; init?: RequestInit }[] = [];

  const crm = await createSfaiModule({
    db,
    config: {
      basePath: "/api",
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
      mail: opts.realMail
        ? undefined
        : async (firmId, e) => {
            sent.push({ kind: "email", firmId, to: e.to, text: e.subject });
            return { via: "ses", id: `ses-${sent.length}`, threadId: null };
          },
      sms: async (firmId, to, text) => (
        sent.push({ kind: "sms", firmId, to, text }),
        "sns"
      ),
      storage: {
        uploadUrl: async (key) => `https://s3.test/put/${key}`,
        downloadUrl: async (key) => `https://s3.test/get/${key}`,
        read: async (key) => files.get(key) ?? new TextEncoder().encode("hello"),
      },
      identity: {
        roleOf: async (email) => portalUsers.get(email) ?? null,
        createClientUser: async (u) => void portalUsers.set(u.email, "client"),
      },
      readDocument: async () => (opts.analysis ?? fakeAnalysis)(),
      fetch: (async (url: string, init?: RequestInit) => {
        calls.push({ url: String(url), init });
        return fetchImpl
          ? fetchImpl(String(url), init)
          : new Response("{}", { status: 404 });
      }) as typeof fetch,
    },
    ask: async (_ctx, firmId, history) => ({
      text: `echo ${firmId}: ${history.at(-1)?.text}`,
      draftIds: [],
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
    const res = await crm.app.request(`/api${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
    const text = await res.text();
    return { status: res.status, body: text ? safeJson(text) : null };
  };

  return { crm, db, sent, calls, api, files, portalUsers };
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
