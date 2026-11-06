// Trust account engine — Directive 5R8 (Estate Funds and Banking).
// Every figure here is derived from ledger rows; nothing is typed in by hand.

export type ReceiptSource =
  | "pad_payment"
  | "surplus_income"
  | "tax_refund"
  | "asset_sale"
  | "interest"
  | "third_party"
  | "other";

export type DisbursementKind =
  | "superintendent_levy"
  | "trustee_fee"
  | "counselling_fee"
  | "filing_fee"
  | "dividend"
  | "secured_payout"
  | "preferred_payout"
  | "other";

export interface TrustAccount {
  bank: string;
  last4: string;
  holder: string; // trustee firm — funds never sit with SecureFiles
  designation: "estate_specific" | "pooled";
  dualSignatureThreshold: number;
  openedOn: string;
}

export interface TrustReceipt {
  id: string;
  date: string; // date received
  depositDate: string | null; // null = not yet deposited
  source: ReceiptSource;
  sourceRef: string; // what it ties to (PAD run, asset, CRA notice…)
  payer: string;
  amount: number;
  clearedOnStatement: boolean;
  reversedById?: string; // NSF / reversal entry id
  reversalOf?: string;
}

export interface TrustDisbursement {
  id: string;
  date: string;
  kind: DisbursementKind;
  payee: string;
  reference: string;
  amount: number;
  approvals: string[]; // names of approvers
  cleared: boolean; // cashed / on bank statement
}

export interface Reconciliation {
  id: string;
  statementDate: string;
  statementBalance: number;
  reconciledOn: string;
  reconciledBy: string;
  ledgerBalanceAtDate: number;
  adjustedBankBalance: number;
  difference: number;
  notes?: string;
}

export interface Holdback {
  id: string;
  reason: string; // e.g. disputed claim
  amount: number;
}

export interface TrustLedger {
  account: TrustAccount | null;
  receipts: TrustReceipt[];
  disbursements: TrustDisbursement[];
  reconciliations: Reconciliation[];
  holdbacks: Holdback[];
  reserveForCosts: number;
}

const round = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: number[]) => round(xs.reduce((a, b) => a + b, 0));

export const RECON_MAX_AGE_DAYS = 30;
export const DEPOSIT_MAX_DAYS = 5; // business promptness proxy
export const STALE_CHEQUE_DAYS = 183;

export function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export function computeBalances(l: TrustLedger) {
  const totalReceipts = sum(l.receipts.map((r) => r.amount));
  const totalDisbursements = sum(l.disbursements.map((d) => d.amount));
  const ledgerBalance = round(totalReceipts - totalDisbursements);
  const outstandingCheques = sum(l.disbursements.filter((d) => !d.cleared).map((d) => d.amount));
  const depositsInTransit = sum(
    l.receipts.filter((r) => r.depositDate && !r.clearedOnStatement).map((r) => r.amount),
  );
  const undeposited = sum(l.receipts.filter((r) => !r.depositDate).map((r) => r.amount));
  const holdbacks = sum(l.holdbacks.map((h) => h.amount));
  const available = Math.max(0, round(ledgerBalance - holdbacks - l.reserveForCosts - undeposited));
  return {
    totalReceipts,
    totalDisbursements,
    ledgerBalance,
    outstandingCheques,
    depositsInTransit,
    undeposited,
    holdbacks,
    reserve: l.reserveForCosts,
    available,
  };
}

export function lastReconciliation(l: TrustLedger): Reconciliation | null {
  return [...l.reconciliations].sort((a, b) => b.statementDate.localeCompare(a.statementDate))[0] ?? null;
}

/** Bank-statement balance → adjusted bank balance → difference vs ledger. */
export function reconcile(ledgerBalance: number, statementBalance: number, depositsInTransit: number, outstandingCheques: number) {
  const adjustedBankBalance = round(statementBalance + depositsInTransit - outstandingCheques);
  return { adjustedBankBalance, difference: round(adjustedBankBalance - ledgerBalance) };
}

// ---------------------------------------------------------------- levy (s.147)
// Superintendent's levy on dividends: 5% of the first $1M, 2.5% of the next
// $1M, 1.25% above $2M.
export function superintendentLevy(dividends: number) {
  const t1 = Math.min(dividends, 1_000_000) * 0.05;
  const t2 = Math.min(Math.max(dividends - 1_000_000, 0), 1_000_000) * 0.025;
  const t3 = Math.max(dividends - 2_000_000, 0) * 0.0125;
  return round(t1 + t2 + t3);
}

// ---------------------------------------------------------- distribution gate
export interface ApprovalGateInput {
  distributionAmount: number;
  available: number;
  admittedClaims: number;
  lastReconciledOn: string | null;
  reconDifference: number;
  today: string;
}

export function distributionBlockers(i: ApprovalGateInput): string[] {
  const out: string[] = [];
  if (i.admittedClaims === 0) out.push("No claims are admitted yet.");
  if (i.distributionAmount > i.available)
    out.push(`Amount exceeds funds available in trust (${fmt(i.distributionAmount)} vs ${fmt(i.available)}).`);
  if (!i.lastReconciledOn) out.push("The trust account has never been reconciled.");
  else if (daysBetween(i.lastReconciledOn, i.today) > RECON_MAX_AGE_DAYS)
    out.push(`Last reconciliation is older than ${RECON_MAX_AGE_DAYS} days.`);
  if (Math.abs(i.reconDifference) >= 0.01) out.push("Ledger does not match the bank statement.");
  return out;
}

// ------------------------------------------------------------------ risk flags
export type FlagSeverity = "high" | "medium" | "low";
export interface TrustFlag {
  code: string;
  severity: FlagSeverity;
  title: string;
  detail: string;
  citation: string;
}

export function trustRiskFlags(l: TrustLedger, today: string, estateClosing = false): TrustFlag[] {
  const flags: TrustFlag[] = [];
  const b = computeBalances(l);
  const last = lastReconciliation(l);

  if (!l.account)
    flags.push({ code: "NO_ACCOUNT", severity: "high", title: "No trust account linked", detail: "Estate funds must be held in a trust account in the trustee's name.", citation: "Dir. 5R8 · BIA s.25(1)" });

  if (!last)
    flags.push({ code: "NEVER_RECONCILED", severity: "high", title: "Trust account never reconciled", detail: "No bank reconciliation is on file.", citation: "Dir. 5R8" });
  else {
    const age = daysBetween(last.statementDate, today);
    if (age > RECON_MAX_AGE_DAYS)
      flags.push({ code: "RECON_STALE", severity: age > 60 ? "high" : "medium", title: "Reconciliation overdue", detail: `Last matched to the bank statement ${age} days ago (limit ${RECON_MAX_AGE_DAYS}).`, citation: "Dir. 5R8" });
    if (Math.abs(last.difference) >= 0.01)
      flags.push({ code: "LEDGER_MISMATCH", severity: "high", title: "Ledger does not match bank", detail: `Unexplained difference of ${fmt(last.difference)} at ${last.statementDate}.`, citation: "Dir. 5R8" });
  }

  if (b.ledgerBalance < 0)
    flags.push({ code: "NEGATIVE", severity: "high", title: "Negative trust balance", detail: `Ledger balance is ${fmt(b.ledgerBalance)}.`, citation: "Dir. 5R8 · BIA s.25" });

  for (const r of l.receipts) {
    if (r.reversalOf) continue;
    const ref = r.depositDate ?? today;
    const d = daysBetween(r.date, ref);
    if (d > DEPOSIT_MAX_DAYS)
      flags.push({ code: `LATE_DEPOSIT_${r.id}`, severity: "medium", title: r.depositDate ? "Late deposit" : "Receipt not deposited", detail: `${fmt(r.amount)} from ${r.payer} — ${d} days from receipt to deposit.`, citation: "Dir. 5R8 · BIA s.25(1)" });
    if (r.reversedById)
      flags.push({ code: `NSF_${r.id}`, severity: "medium", title: "Returned / reversed payment", detail: `${fmt(r.amount)} from ${r.payer} (${r.sourceRef}) was reversed.`, citation: "Dir. 5R8" });
  }

  for (const d of l.disbursements) {
    if (!d.cleared && daysBetween(d.date, today) > STALE_CHEQUE_DAYS)
      flags.push({ code: `STALE_${d.id}`, severity: "medium", title: "Stale-dated cheque", detail: `${fmt(d.amount)} to ${d.payee} uncashed for over 6 months; unclaimed dividends go to the Superintendent.`, citation: "BIA s.154" });
    if (l.account && d.amount >= l.account.dualSignatureThreshold && d.approvals.length < 2)
      flags.push({ code: `SINGLE_SIG_${d.id}`, severity: "high", title: "Single approval above threshold", detail: `${fmt(d.amount)} to ${d.payee} has ${d.approvals.length} approval(s).`, citation: "Dir. 5R8" });
  }

  if (estateClosing && b.ledgerBalance !== 0)
    flags.push({ code: "CLOSING_BALANCE", severity: "high", title: "Balance remaining at closing", detail: `Trust must be $0 before discharge of trustee; ${fmt(b.ledgerBalance)} remains.`, citation: "Dir. 5R8" });

  return flags;
}

// --------------------------------------------- Statement of Receipts & Disb.
export const RECEIPT_LABEL: Record<ReceiptSource, string> = {
  pad_payment: "Debtor payments (PAD)",
  surplus_income: "Surplus income",
  tax_refund: "Income tax refunds",
  asset_sale: "Realization of assets",
  interest: "Interest earned",
  third_party: "Third-party contributions",
  other: "Other receipts",
};
export const DISB_LABEL: Record<DisbursementKind, string> = {
  superintendent_levy: "Superintendent's levy",
  trustee_fee: "Trustee's fees",
  counselling_fee: "Counselling fees",
  filing_fee: "Filing fees",
  dividend: "Dividends to creditors",
  secured_payout: "Payments to secured creditors",
  preferred_payout: "Payments to preferred creditors",
  other: "Other disbursements",
};

export function buildSRD(l: TrustLedger) {
  const group = <K extends string>(rows: { k: K; amount: number }[], labels: Record<K, string>) => {
    const m = new Map<K, number>();
    rows.forEach((r) => m.set(r.k, round((m.get(r.k) ?? 0) + r.amount)));
    return [...m.entries()].filter(([, v]) => v !== 0).map(([k, v]) => ({ key: k, label: labels[k], amount: v }));
  };
  const receipts = group(l.receipts.map((r) => ({ k: r.source, amount: r.amount })), RECEIPT_LABEL);
  const disbursements = group(l.disbursements.map((d) => ({ k: d.kind, amount: d.amount })), DISB_LABEL);
  const b = computeBalances(l);
  return { receipts, disbursements, totalReceipts: b.totalReceipts, totalDisbursements: b.totalDisbursements, balance: b.ledgerBalance };
}

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
