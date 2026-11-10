import { describe, it, expect } from "vitest";
import { computeBalances, distributionBlockers, superintendentLevy, trustRiskFlags, reconcile, type TrustLedger } from "../trustLedger";

const base: TrustLedger = {
  account: { bank: "RBC", last4: "4421", holder: "Firm", designation: "estate_specific", dualSignatureThreshold: 5000, openedOn: "2026-01-01" },
  receipts: [
    { id: "r1", date: "2026-10-01", depositDate: "2026-10-02", source: "pad_payment", sourceRef: "PAD", payer: "Debtor", amount: 1200, clearedOnStatement: true },
  ],
  disbursements: [
    { id: "d1", date: "2026-10-05", kind: "filing_fee", payee: "OSB", reference: "x", amount: 199.62, approvals: ["A"], cleared: true },
  ],
  reconciliations: [
    { id: "c1", statementDate: "2026-11-03", statementBalance: 1000.38, reconciledOn: "2026-11-03", reconciledBy: "A", ledgerBalanceAtDate: 1000.38, adjustedBankBalance: 1000.38, difference: 0 },
  ],
  holdbacks: [],
  reserveForCosts: 0,
};

describe("trust ledger", () => {
  it("running balance is receipts minus disbursements", () => {
    expect(computeBalances(base).ledgerBalance).toBe(1000.38);
  });

  it("blocks approval when amount exceeds trust balance", () => {
    const b = distributionBlockers({ distributionAmount: 1500, available: 1000.38, admittedClaims: 3, lastReconciledOn: "2026-11-03", reconDifference: 0, today: "2026-11-06" });
    expect(b.some((m) => m.includes("exceeds"))).toBe(true);
  });

  it("blocks approval when no claims are admitted", () => {
    const b = distributionBlockers({ distributionAmount: 500, available: 1000, admittedClaims: 0, lastReconciledOn: "2026-11-03", reconDifference: 0, today: "2026-11-06" });
    expect(b).toContain("No claims are admitted yet.");
  });

  it("allows approval when funded, admitted and reconciled", () => {
    expect(distributionBlockers({ distributionAmount: 500, available: 1000, admittedClaims: 2, lastReconciledOn: "2026-11-03", reconDifference: 0, today: "2026-11-06" })).toEqual([]);
  });

  it("flags monthly reconciliation evidence after the 45-day window", () => {
    const codes = trustRiskFlags(base, "2026-12-19").map((f) => f.code);
    expect(codes).toContain("RECON_STALE");
    expect(trustRiskFlags(base, "2026-12-18").map((f) => f.code)).not.toContain("RECON_STALE");
  });

  it("requires written OSB notice for uncorrected differences after 75 days", () => {
    const ledger = { ...base, reconciliations: [{ ...base.reconciliations[0], difference: 25 }] };
    expect(trustRiskFlags(ledger, "2027-01-17").map(f => f.code)).not.toContain("OSB_NOTICE_REQUIRED");
    expect(trustRiskFlags(ledger, "2027-01-18").map(f => f.code)).toContain("OSB_NOTICE_REQUIRED");
  });

  it("blocks distribution with missing reserve evidence", () => {
    expect(distributionBlockers({ distributionAmount: 500, available: 1000, admittedClaims: 2, lastReconciledOn: "2026-11-03", reconDifference: 0, today: "2026-11-06", assessmentBlockers: ["Reserves not verified"] })).toContain("Reserves not verified");
  });

  it("flags ledger that does not match bank", () => {
    const l = { ...base, reconciliations: [{ ...base.reconciliations[0], difference: -25 }] };
    expect(trustRiskFlags(l, "2026-11-06").map((f) => f.code)).toContain("LEDGER_MISMATCH");
  });

  it("reconcile adjusts statement by transit items", () => {
    expect(reconcile(1000, 1100, 0, 100)).toEqual({ adjustedBankBalance: 1000, difference: 0 });
  });

  it("ordinary levy is 5% then 1.25% under Rule 123", () => {
    expect(superintendentLevy(10000)).toBe(500);
    expect(superintendentLevy(1_500_000)).toBe(56250);
  });
});
