import { describe, expect, it } from "vitest";
import { ledgerFromPostings } from "../persistedLedger";
import { computeBalances } from "../trustLedger";

describe("persisted trust postings", () => {
  const entries = [{ id: "receipt", gl_date: "2026-11-01", created_at: "2026-11-01", memo: "Receipt", source_type: "receipt", lines: [{ account: "10000 · Trust Bank", debit: 1200, credit: 0 }, { account: "Income", debit: 0, credit: 1200 }] }, { id: "payment", gl_date: "2026-11-05", created_at: "2026-11-05", memo: "Payment", source_type: "disbursement", lines: [{ account: "10000 · Trust Bank", debit: 0, credit: 199.62 }] }];
  it("counts only the bank side, without double-counting allocations", () => { expect(computeBalances(ledgerFromPostings(entries)).ledgerBalance).toBe(1000.38); });
  it("reconciles a statement using only postings through its date", () => { expect(computeBalances(ledgerFromPostings(entries, "2026-11-03")).ledgerBalance).toBe(1200); });
});
describe("reversals", () => {
  const base = { memo: "Debtor", source_id: null, created_at: "2026-11-01T00:00:00Z" };
  const rows = [
    { ...base, id: "r1", gl_date: "2026-11-01", source_type: "deposit", lines: [{ account: "10000 · Trust Bank", debit: 300, credit: 0 }, { account: "Estate receipts", debit: 0, credit: 300 }] },
    { ...base, id: "x1", gl_date: "2026-11-05", source_type: "reversal", source_id: "r1", lines: [{ account: "Returned payments", debit: 300, credit: 0 }, { account: "10000 · Trust Bank", debit: 0, credit: 300 }] },
  ];
  it("marks the original receipt reversed and nets the balance to zero", () => {
    const l = ledgerFromPostings(rows);
    expect(l.receipts[0].reversedById).toBe("x1");
    expect(computeBalances(l).ledgerBalance).toBe(0);
  });
});
