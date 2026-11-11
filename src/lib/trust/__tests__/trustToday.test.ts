import { describe, it, expect } from "vitest";
import { accountTypeAllowed, reconciliationClock, remittanceOverdue, paymentBlockers, osbViewFlags } from "../trustLedger";

describe("5R8 trustee rules", () => {
  it("blocks a proposal estate in the summary consolidated account", () => {
    expect(accountTypeAllowed("consolidated_summary", "proposal").ok).toBe(false);
    expect(accountTypeAllowed("consolidated_proposal", "proposal").ok).toBe(true);
  });
  it("counts down 45 days and requires notice after 75", () => {
    expect(reconciliationClock("2026-10-31", "2026-11-02", false)).toMatchObject({ daysLeft: 43, state: "on_track" });
    expect(reconciliationClock("2026-08-01", "2026-10-20", false).state).toBe("notice_required");
  });
  it("flags remittance sent after 72 hours", () => {
    expect(remittanceOverdue("2026-11-01T00:00:00Z", "2026-11-04T01:00:00Z", "2026-11-05T00:00:00Z")).toBe(true);
    expect(remittanceOverdue("2026-11-01T00:00:00Z", "2026-11-03T23:00:00Z", "2026-11-05T00:00:00Z")).toBe(false);
  });
  it("prevents overdraw and the $100 summary allowance breach", () => {
    expect(paymentBlockers(100, 138.2)[0]).toContain("$38.20");
    expect(paymentBlockers(500, 30, { isAdmin: true, adminSoFar: 80, adminCap: 100 })).toHaveLength(1);
    expect(paymentBlockers(500, 1, { isAdmin: true, adminCap: 0 })).toHaveLength(1);
  });
  it("shows what the OSB would flag", () => {
    expect(osbViewFlags({ balance: 20, status: "closed", srdCount: 1, bankBalance: null, reconciledBalance: null })[0].code).toBe("closed_with_funds");
    expect(osbViewFlags({ balance: 0, status: "active", srdCount: 0, bankBalance: 5, reconciledBalance: 4 }).map(f => f.code)).toEqual(["no_balance_no_srd", "bank_mismatch"]);
  });
});
