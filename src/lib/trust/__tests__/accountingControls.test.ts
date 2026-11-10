import { describe, expect, it } from "vitest";
import { accountingChecks, consumerProposalTariff, summaryTrusteeTariff, superintendentLevy, srdEvidenceStatus, type TrustLedger, type AccountingContext } from "../trustLedger";

const ledger: TrustLedger = { account: null, receipts: [{ id: "r", date: "2026-11-01", depositDate: "2026-11-01", source: "pad_payment", payer: "Debtor", sourceRef: "PAD", amount: 5000, clearedOnStatement: true }], disbursements: [], reconciliations: [], holdbacks: [], reserveForCosts: 0 };
const context: AccountingContext = { proceeding: "Bankruptcy", administration: "Summary", classificationComplete: true, bankFeedVerified: false, pooledCoverageVerified: false, today: "2026-11-10" };
describe("estate accounting controls", () => {
  it("allows the Rule 128 $100 administrative lump sum but flags $100.01", () => {
    const withAdmin = (amount: number): TrustLedger => ({ ...ledger, disbursements: [{ id: "d", date: "2026-11-02", kind: "administrative_disbursement", payee: "Firm", reference: "Admin", amount, approvals: [], cleared: true }] });
    expect(accountingChecks(withAdmin(100), context).find(c => c.code === "admin-cap")?.status).toBe("met");
    expect(accountingChecks(withAdmin(100.01), context).find(c => c.code === "admin-cap")?.status).toBe("breach");
  });
  it("allows no extra administrative disbursement in Rule 129 proposals", () => {
    const proposal = { ...context, proceeding: "Consumer Proposal" };
    expect(accountingChecks(ledger, proposal).find(c => c.code === "admin-cap")?.status).toBe("met");
    const l: TrustLedger = { ...ledger, disbursements: [{ id: "d", date: "2026-11-02", kind: "administrative_disbursement", payee: "Firm", reference: "Admin", amount: 0.01, approvals: [], cleared: true }] };
    expect(accountingChecks(l, proposal).find(c => c.code === "admin-cap")?.status).toBe("breach");
  });
  it("calculates the summary fee bands from verified net realization receipts", () => {
    expect(summaryTrusteeTariff(975)).toBe(975);
    expect(summaryTrusteeTariff(2000)).toBe(1333.75);
    expect(summaryTrusteeTariff(3000)).toBe(1833.75);
  });
  it("calculates proposal fees only for supported milestones plus 20% distributed", () => {
    expect(consumerProposalTariff(1000, true, true)).toBe(1700);
    expect(consumerProposalTariff(1000, false, false)).toBe(200);
  });
  it("uses administration-specific Rule 123 levy bands", () => {
    expect(superintendentLevy(1500000)).toBe(56250);
    expect(superintendentLevy(3000000)).toBe(65000);
    expect(superintendentLevy(3000000, "proposal")).toBe(62500);
    expect(superintendentLevy(100, "summary")).toBe(100);
    expect(superintendentLevy(1000, "summary")).toBe(200);
  });
  it("flags a historical negative balance even if later receipts restore it", () => {
    const l: TrustLedger = { ...ledger, disbursements: [{ id: "d", date: "2026-10-31", kind: "filing_fee", payee: "OSB", reference: "Fee", amount: 100, approvals: [], cleared: true }] };
    expect(accountingChecks(l, context).find(c => c.code === "nonnegative")?.status).toBe("breach");
  });
  it("blocks evidence-backed SRD without a verified read-only feed", () => {
    const checks = accountingChecks(ledger, context);
    expect(checks.find(c => c.code === "bank-matches")?.status).toBe("blocked");
    expect(srdEvidenceStatus(ledger, checks).ready).toBe(false);
  });
  it("compares bank-matched proposal receipts to scheduled amounts", () => {
    expect(accountingChecks(ledger, { ...context, proceeding: "Consumer Proposal", scheduleDue: 500, scheduleMatchedReceipts: 499 }).find(c => c.code === "schedule")?.status).toBe("breach");
  });
});