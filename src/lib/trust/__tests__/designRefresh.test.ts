import { describe, expect, it } from "vitest";
import { auditReadiness, depositSplit, threeWay, type TrustLedger } from "../trustLedger";

describe("deposit split", () => {
  it("posts only when the difference is zero", () => {
    expect(depositSplit(750, [{ selected: true, amount: 250 }, { selected: true, amount: 250 }, { selected: true, amount: 250 }, { selected: false, amount: 250 }]).canPost).toBe(true);
    const r = depositSplit(750, [{ selected: true, amount: 250 }, { selected: true, amount: 250 }]);
    expect(r.difference).toBe(250);
    expect(r.canPost).toBe(false);
  });
});

describe("three-way month-end", () => {
  it("is ready when bank, book and estates agree", () => {
    expect(threeWay({ statementBalance: 12230, depositsInTransit: 500, outstandingCheques: 250, bookBalance: 12480, estateBalances: 12480 })).toEqual({ adjustedBank: 12480, difference: 0, state: "ready" });
  });
  it("blocks on a difference or missing statement", () => {
    expect(threeWay({ statementBalance: 12230, depositsInTransit: 0, outstandingCheques: 0, bookBalance: 12480, estateBalances: 12480 }).state).toBe("blocked_difference");
    expect(threeWay({ statementBalance: null, depositsInTransit: 0, outstandingCheques: 0, bookBalance: 1, estateBalances: 1 }).state).toBe("blocked_missing");
  });
});

describe("audit readiness", () => {
  it("marks the package Draft when the estate was never reconciled", () => {
    const l: TrustLedger = { account: null, receipts: [], disbursements: [], reconciliations: [], holdbacks: [], reserveForCosts: 0 };
    expect(auditReadiness(l, [], "2026-11-11").draft).toBe(true);
  });
});
