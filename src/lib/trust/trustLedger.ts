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
  | "administrative_disbursement"
  | "other";

export interface TrustAccount {
  bank: string;
  last4: string;
  holder: string; // trustee firm — funds never sit with SecureFiles
  designation: "estate_specific" | "pooled";
  dualSignatureThreshold: number | null; // firm policy, not an OSB dollar threshold
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
  bankEvidenceVerified?: boolean;
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
  assessmentBlockers?: string[];
}

const round = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: number[]) => round(xs.reduce((a, b) => a + b, 0));

export const RECON_MAX_AGE_DAYS = 45;
export const RECON_ERROR_NOTICE_DAYS = 75;
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
// General Rules 123: rates depend on the administration/proceeding.
export function superintendentLevy(dividends: number, regime: "ordinary" | "proposal" | "summary" = "ordinary") {
  const payments = Math.max(0, dividends);
  if (regime === "summary") return round(Math.min(payments, 200));
  const t1 = Math.min(payments, 1_000_000) * 0.05;
  const t2 = Math.min(Math.max(payments - 1_000_000, 0), 1_000_000) * 0.0125;
  const t3 = Math.max(payments - 2_000_000, 0) * (regime === "proposal" ? 0 : 0.0025);
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
  assessmentBlockers?: string[];
}

export function distributionBlockers(i: ApprovalGateInput): string[] {
  const out: string[] = [...(i.assessmentBlockers ?? [])];
  if (i.admittedClaims === 0) out.push("No claims are admitted yet.");
  if (i.distributionAmount > i.available)
    out.push(`Amount exceeds funds available in trust (${fmt(i.distributionAmount)} vs ${fmt(i.available)}).`);
  if (!i.lastReconciledOn) out.push("The trust account has never been reconciled.");
  else if (daysBetween(i.lastReconciledOn, i.today) > RECON_MAX_AGE_DAYS)
    out.push(`Monthly statement reconciliation is overdue (${RECON_MAX_AGE_DAYS}-day completion window).`);
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
      flags.push({ code: "RECON_STALE", severity: "medium", title: "Monthly reconciliation evidence overdue", detail: `Latest statement is ${age} days old. Monthly reconciliations must be completed within 45 days of the statement date; obtain any newer statement.`, citation: "Dir. 5R8" });
    if (Math.abs(last.difference) >= 0.01)
      flags.push({ code: "LEDGER_MISMATCH", severity: "high", title: "Ledger does not match bank", detail: `Unexplained difference of ${fmt(last.difference)} at ${last.statementDate}.`, citation: "Dir. 5R8" });
    if (Math.abs(last.difference) >= 0.01 && age > RECON_ERROR_NOTICE_DAYS)
      flags.push({ code: "OSB_NOTICE_REQUIRED", severity: "high", title: "Written OSB notice required", detail: "Reconciliation error remains uncorrected more than 75 days after the statement date. Record written notification to the OSB.", citation: "Dir. 5R8" });
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
    if (l.account?.dualSignatureThreshold != null && d.amount >= l.account.dualSignatureThreshold && d.approvals.length < 2)
      flags.push({ code: `SINGLE_SIG_${d.id}`, severity: "high", title: "Single approval above firm threshold", detail: `${fmt(d.amount)} to ${d.payee} has ${d.approvals.length} approval(s).`, citation: "Firm payment policy (not an OSB dollar threshold)" });
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
  administrative_disbursement: "Administrative disbursements",
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

export function summaryTrusteeTariff(netRealizationReceipts: number) {
  const net = Math.max(0, netRealizationReceipts);
  return round(Math.min(net, 975) + Math.min(Math.max(net - 975, 0), 1025) * 0.35 + Math.max(net - 2000, 0) * 0.5);
}

export function consumerProposalTariff(distributed: number, filed: boolean, approved: boolean) {
  return round((filed ? 750 : 0) + (approved ? 750 : 0) + Math.max(0, distributed) * 0.2);
}

export interface AccountingCheck {
  code: string;
  title: string;
  status: "met" | "breach" | "blocked";
  detail: string;
  citation: string;
  url?: string;
}

export interface AccountingContext {
  proceeding?: string;
  administration?: string;
  tariffBase?: number;
  proposalFiled?: boolean;
  proposalApproved?: boolean;
  levyBasis?: number;
  scheduleDue?: number;
  scheduleMatchedReceipts?: number;
  /** Fee approved by court or inspectors for ordinary administrations. */
  approvedFeeAmount?: number;
  classificationComplete: boolean;
  bankFeedVerified: boolean;
  pooledCoverageVerified: boolean;
  today: string;
}

/** Compliance checks abstain when scope, classification or source evidence is missing. */
export function accountingChecks(l: TrustLedger, c: AccountingContext): AccountingCheck[] {
  const rules = "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._368/";
  const b = computeBalances(l);
  const last = lastReconciliation(l);
  const rows = runningTrustLedger(l);
  const checks: AccountingCheck[] = [];
  const add = (code: string, title: string, status: AccountingCheck["status"], detail: string, citation: string, url?: string) => checks.push({ code, title, status, detail, citation, url });
  const negative = rows.find(r => r.balance < 0);
  add("nonnegative", "No negative estate balance", negative ? "breach" : "met", negative ? `${fmt(negative.balance)} on ${negative.date}; entry ${negative.id}.` : `${rows.length} bank-side postings checked, including historical balances.`, "Directive 5R8");
  const unmatched = l.receipts.filter(r => !r.clearedOnStatement).length + l.disbursements.filter(d => !d.cleared).length;
  add("bank-matches", "Read-only bank transaction evidence", !c.bankFeedVerified ? "blocked" : unmatched ? "breach" : "met", !c.bankFeedVerified ? "No verified read-only bank feed is connected. Statement records alone do not prove provider provenance." : `${unmatched} postings lack a verified bank match.`, "Directive 5R8");
  add("reconciliation", "Monthly bank / estate reconciliation", !last || !last.bankEvidenceVerified ? "blocked" : last.difference !== 0 ? "breach" : daysBetween(last.statementDate, c.today) > 45 ? "blocked" : "met", !last ? "No monthly statement is on file." : `${last.statementDate}: adjusted bank ${fmt(last.adjustedBankBalance)}, estate ledger ${fmt(last.ledgerBalanceAtDate)}, difference ${fmt(last.difference)}. ${last.bankEvidenceVerified ? "" : "Statement provenance and reviewed matches are not verified."}`, "Directive 5R8");
  add("pooled", "Bank balance / sum of estate sub-ledgers", c.pooledCoverageVerified ? "met" : "blocked", c.pooledCoverageVerified ? "All estate sub-ledgers for this bank account are included." : "Canonical shared bank-account identity and complete sub-ledger coverage are not recorded; an estate-only total cannot prove pooled reconciliation.", "Directive 5R8");
  const summary = c.proceeding === "Bankruptcy" && c.administration === "Summary";
  const proposal = c.proceeding === "Consumer Proposal";
  const admin = sum(l.disbursements.filter(d => d.kind === "administrative_disbursement").map(d => d.amount));
  const cap = summary ? 100 : proposal ? 0 : null;
  add("admin-cap", "Administrative disbursement allowance", cap === null || !c.classificationComplete ? "blocked" : admin > cap ? "breach" : "met", cap === null ? "Rule 128 summary / Rule 129 consumer proposal scope does not apply; review ordinary-administration authority." : `${fmt(admin)} recorded / ${fmt(cap)} allowance. Counselling, filing, registrar fees and applicable taxes are separate permitted categories.`, summary ? "Rule 128(2)(e)" : "Rule 129(1)", rules + (summary ? "section-128.html" : "section-129.html"));
  const fees = sum(l.disbursements.filter(d => d.kind === "trustee_fee").map(d => d.amount));
  const ordinaryFee = !summary && !proposal && c.approvedFeeAmount !== undefined ? c.approvedFeeAmount : undefined;
  const tariff = ordinaryFee !== undefined ? ordinaryFee : summary && c.tariffBase !== undefined ? summaryTrusteeTariff(c.tariffBase) : proposal && c.proposalFiled !== undefined && c.proposalApproved !== undefined && c.levyBasis !== undefined ? consumerProposalTariff(c.levyBasis, c.proposalFiled, c.proposalApproved) : null;
  add("tariff", "Trustee / administrator fees against tariff", tariff === null || !c.classificationComplete ? "blocked" : fees > tariff ? "breach" : "met", tariff === null ? "Verified realization deductions or filing/approval milestones and distributed payments are missing; ordinary estates require approved fee authority." : `${fmt(fees)} recorded / ${fmt(tariff)} tariff ceiling (before separate taxes and permitted expenses). Advance timing requires separate review.`, summary ? "Rule 128" : "Rule 129", rules + (summary ? "section-128.html" : "section-129.html"));
  const levy = sum(l.disbursements.filter(d => d.kind === "superintendent_levy").map(d => d.amount));
  const expectedLevy = c.levyBasis === undefined ? null : superintendentLevy(c.levyBasis, summary ? "summary" : c.proceeding?.includes("Proposal") ? "proposal" : "ordinary");
  add("levy", "Superintendent’s levy", expectedLevy === null || !c.classificationComplete ? "blocked" : Math.abs(levy - expectedLevy) >= 0.01 ? "breach" : "met", expectedLevy === null ? "Verified levy-bearing creditor payments are missing. No levy inferred from unclassified cash." : `${fmt(levy)} recorded / ${fmt(expectedLevy)} required on ${fmt(c.levyBasis ?? 0)} payments.`, "BIA s.147 · Rule 123", rules + "section-123.html");
  if (proposal) add("schedule", "Proposal receipts against payment schedule", c.scheduleDue === undefined || c.scheduleMatchedReceipts === undefined ? "blocked" : c.scheduleMatchedReceipts < c.scheduleDue ? "breach" : "met", c.scheduleDue === undefined || c.scheduleMatchedReceipts === undefined ? "Bank-matched proposal receipts must be linked to due schedule periods; schedule amounts alone are not evidence of payment." : `${fmt(c.scheduleMatchedReceipts)} bank-matched / ${fmt(c.scheduleDue)} due.`, "Approved consumer proposal payment terms");
  return checks;
}

export function runningTrustLedger(l: TrustLedger) {
  const rows = [...l.receipts.map(r => ({ id: r.id, date: r.date, party: r.payer, source: r.sourceRef, category: RECEIPT_LABEL[r.source], incoming: r.amount, outgoing: 0, matched: r.clearedOnStatement })), ...l.disbursements.map(d => ({ id: d.id, date: d.date, party: d.payee, source: d.reference, category: DISB_LABEL[d.kind], incoming: 0, outgoing: d.amount, matched: d.cleared }))].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let balance = 0;
  return rows.map(r => ({ ...r, balance: balance = round(balance + r.incoming - r.outgoing) }));
}

export function srdEvidenceStatus(l: TrustLedger, checks: AccountingCheck[]) {
  const blockers = checks.filter(c => c.status !== "met").map(c => `${c.title}: ${c.detail}`);
  if (!l.receipts.length && !l.disbursements.length) blockers.push("No posted transactions are available.");
  return { ready: blockers.length === 0, blockers, srd: buildSRD(l) };
}

// ------------------------------------------------ Trustee "Today" helpers (5R8)

export type TrustAccountType = "consolidated_summary" | "consolidated_proposal" | "individual_estate" | "trust_transfer" | "pre_filing";

/** 5R8: a consolidated account may only hold the administration type it was approved for. */
export function accountTypeAllowed(type: TrustAccountType, proceeding: "summary" | "ordinary" | "proposal"): { ok: boolean; reason?: string } {
  if (type === "trust_transfer") return { ok: false, reason: "A trust transfer account cannot hold estate balances; money must move on without delay." };
  if (type === "pre_filing") return { ok: false, reason: "Pre-filing deposits are not estate funds until the proceeding is registered." };
  if (type === "consolidated_summary" && proceeding !== "summary") return { ok: false, reason: "Only summary administrations may sit in the summary consolidated account." };
  if (type === "consolidated_proposal" && proceeding !== "proposal") return { ok: false, reason: "Only consumer proposals may sit in the proposal consolidated account." };
  return { ok: true };
}

/** Countdown for the month's reconciliation: 45 days to sign, 75 days before written OSB notice of errors. */
export function reconciliationClock(statementDate: string, today: string, signed: boolean) {
  const age = daysBetween(statementDate, today);
  const daysLeft = RECON_MAX_AGE_DAYS - age;
  const state: "signed" | "on_track" | "due_soon" | "overdue" | "notice_required" =
    signed ? "signed" : age > RECON_ERROR_NOTICE_DAYS ? "notice_required" : age > RECON_MAX_AGE_DAYS ? "overdue" : daysLeft <= 10 ? "due_soon" : "on_track";
  return { age, daysLeft, state };
}

/** 5R8 EFT: payment and remittance information must go out within 72 hours. */
export function remittanceOverdue(paidAt: string, remittanceSentAt: string | null, now: string) {
  const end = remittanceSentAt ? new Date(remittanceSentAt).getTime() : new Date(now).getTime();
  return (end - new Date(paidAt).getTime()) / 3_600_000 > 72;
}

/** Payments are prevented, not flagged afterwards. Returns plain-language reasons. */
export function paymentBlockers(balance: number, amount: number, opts: { adminSoFar?: number; adminCap?: number | null; isAdmin?: boolean; hasSchedule3?: boolean; electronic?: boolean } = {}): string[] {
  const out: string[] = [];
  if (amount <= 0) out.push("Enter an amount above $0.");
  if (round(balance - amount) < 0) out.push(`This estate would go negative by ${fmt(round(amount - balance))} if this payment runs.`);
  if (opts.isAdmin && opts.adminCap != null && round((opts.adminSoFar ?? 0) + amount) > opts.adminCap)
    out.push(`Administrative disbursements would exceed the ${fmt(opts.adminCap)} allowance.`);
  if (opts.electronic && opts.hasSchedule3 === false) out.push("Creditor has no Schedule 3 consent on file for electronic payment.");
  return out;
}

/** What the OSB's banking-data analysis looks for. */
export function osbViewFlags(i: { balance: number; status: "active" | "closed"; srdCount: number; bankBalance: number | null; reconciledBalance: number | null }) {
  const out: { code: string; title: string }[] = [];
  if (i.balance < 0) out.push({ code: "negative", title: "Negative balance in an open estate" });
  if (i.status === "closed" && Math.abs(i.balance) >= 0.01) out.push({ code: "closed_with_funds", title: "Closed estate still holds money" });
  if (i.status === "active" && Math.abs(i.balance) < 0.01 && i.srdCount === 0) out.push({ code: "no_balance_no_srd", title: "Active estate with no balance and no SRD" });
  if (i.bankBalance != null && i.reconciledBalance != null && Math.abs(i.bankBalance - i.reconciledBalance) >= 0.01) out.push({ code: "bank_mismatch", title: "Bank balance does not match reconciled balance" });
  return out;
}

/** Total due under a proposal schedule up to `today` (inclusive). Returns undefined when the schedule is incomplete. */
export function scheduleDueToDate(s: { amount?: number | null; frequency?: "weekly" | "biweekly" | "monthly" | null; firstDue?: string | null; lastDue?: string | null }, today: string): number | undefined {
  if (!s.amount || !s.frequency || !s.firstDue) return undefined;
  const end = s.lastDue && s.lastDue < today ? s.lastDue : today;
  if (end < s.firstDue) return 0;
  let n = 0;
  const d = new Date(s.firstDue + "T00:00:00Z");
  while (d.toISOString().slice(0, 10) <= end && n < 1000) {
    n++;
    if (s.frequency === "monthly") d.setUTCMonth(d.getUTCMonth() + 1); else d.setUTCDate(d.getUTCDate() + (s.frequency === "weekly" ? 7 : 14));
  }
  return round(n * s.amount);
}
