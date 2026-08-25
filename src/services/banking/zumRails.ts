import {
  BankConnection,
  BankDataImport,
  ClientBankTransaction,
} from "@/data/clientPortal/types";

/**
 * Zūm Rails provider adapter.
 *
 * All provider logic lives here — React components only ever call this service.
 * No banking credentials are ever collected, transmitted or stored by SecureFiles:
 * the client authenticates directly with their institution inside the provider's
 * hosted connection flow, and we only receive safe references and masked data.
 *
 * Credentials are read from server-side configuration. When they are absent the
 * adapter runs in SIMULATION mode, which is surfaced in the UI so nobody can
 * mistake a demo connection for a real bank link.
 */

export type ZumRailsMode = "live" | "simulation";

export interface ZumRailsConfig {
  /** Set server-side (edge function secrets). Never a client-side secret. */
  connectTokenEndpoint?: string;
  environment: "sandbox" | "production";
}

/**
 * Client bundles never carry provider secrets. The presence of a configured
 * token endpoint (an edge function that mints a short-lived connect token using
 * the server-held Zūm Rails API key) is what enables live mode.
 */
const CONFIG: ZumRailsConfig = {
  connectTokenEndpoint: import.meta.env.VITE_ZUMRAILS_CONNECT_ENDPOINT || undefined,
  environment: (import.meta.env.VITE_ZUMRAILS_ENV as "sandbox" | "production") || "sandbox",
};

export const zumRailsMode = (): ZumRailsMode => (CONFIG.connectTokenEndpoint ? "live" : "simulation");

export const zumRailsConfig = () => CONFIG;

export interface ConnectResult {
  externalConnectionId: string;
  institutionName: string;
  accountMask: string;
  accountType: "Chequing" | "Savings";
  sourceAccountRef: string;
  simulated: boolean;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Launch the provider's secure bank-link flow.
 *
 * Live mode: request a one-time connect token from the server endpoint and hand
 * control to the Zūm Rails hosted flow. Simulation mode: return a deterministic
 * demo account after a short delay.
 */
export async function launchBankConnection(params: {
  estateId: string;
  clientId: string;
  consentId: string;
  institutionHint?: string;
}): Promise<ConnectResult> {
  if (zumRailsMode() === "live") {
    const res = await fetch(CONFIG.connectTokenEndpoint!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Zum Rails connect token request failed (${res.status})`);
    const data = (await res.json()) as ConnectResult;
    return { ...data, simulated: false };
  }

  await wait(1200);
  return {
    externalConnectionId: `zr_sim_${Math.random().toString(36).slice(2, 12)}`,
    institutionName: params.institutionHint || "Royal Bank of Canada",
    accountMask: "****4417",
    accountType: "Chequing",
    sourceAccountRef: `acct_sim_${Math.random().toString(36).slice(2, 10)}`,
    simulated: true,
  };
}

export async function syncTransactions(connection: BankConnection, periodDays = 90) {
  const end = new Date();
  const start = new Date(end.getTime() - periodDays * 86400000);

  if (zumRailsMode() === "live") {
    // Live aggregation is performed server-side so raw provider payloads and
    // error metadata never reach the browser.
    throw new Error("Live transaction aggregation requires the server-side Zum Rails sync function.");
  }

  await wait(900);
  const seedTxns: Omit<ClientBankTransaction, "id" | "estateId" | "connectionId" | "classification">[] = [
    { postedAt: new Date(end.getTime() - 2 * 86400000).toISOString(), description: "Payroll deposit — Northwind Ltd", amount: 1710, direction: "credit", category: "Income" },
    { postedAt: new Date(end.getTime() - 6 * 86400000).toISOString(), description: "Rent — Bellwoods Property Mgmt", amount: 1750, direction: "debit", category: "Housing" },
    { postedAt: new Date(end.getTime() - 9 * 86400000).toISOString(), description: "Hydro One", amount: 118.4, direction: "debit", category: "Utilities" },
    { postedAt: new Date(end.getTime() - 16 * 86400000).toISOString(), description: "Payroll deposit — Northwind Ltd", amount: 1710, direction: "credit", category: "Income" },
    { postedAt: new Date(end.getTime() - 21 * 86400000).toISOString(), description: "Grocery — Loblaws", amount: 214.86, direction: "debit", category: "Food" },
  ];

  const transactions: ClientBankTransaction[] = seedTxns.map((t, i) => ({
    ...t,
    id: `txn-${connection.id}-${i}`,
    estateId: connection.estateId,
    connectionId: connection.id,
    // Client evidence only. Never a trust-account receipt.
    classification: "CLIENT_FINANCIAL_EVIDENCE",
  }));

  const imp: BankDataImport = {
    id: `imp-${Math.random().toString(36).slice(2, 10)}`,
    estateId: connection.estateId,
    connectionId: connection.id,
    provider: "zum_rails",
    kind: "transactions",
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    status: "complete",
    recordCount: transactions.length,
    syncedAt: new Date().toISOString(),
    consentId: connection.consentId,
    providerStatus: "SIMULATED_OK",
  };

  return { imp, transactions };
}

/**
 * Statement retrieval. The endpoint in use does not expose downloadable
 * statement PDFs, so we never fabricate them — the UI falls back to
 * client-uploaded statements and says so explicitly.
 */
export const providerStatementsSupported = () => false;

/** PAD mandate registration with the provider. */
export async function registerPadMandate(params: {
  connectionExternalId: string;
  amount: number;
  frequency: string;
  startDate: string;
}): Promise<{ mandateRef: string; simulated: boolean }> {
  if (zumRailsMode() === "live") {
    throw new Error("Live PAD mandate registration requires the server-side Zum Rails function.");
  }
  await wait(800);
  return { mandateRef: `mandate_sim_${params.connectionExternalId.slice(-6)}`, simulated: true };
}
