import { describe, it, expect } from "vitest";
import { needsYou, paymentPerformance, estimatedPayout, expectedMonths, automationStats, incomeTrend } from "../financialsEngine";

const today = new Date("2026-11-11T00:00:00Z");
const p = (id: string, year: number, month: string, surplus = 0, income = 3000) => ({ id, year, month, monthly_income: income, threshold_amount: 2645, surplus_amount: surplus, amount_required: 0, payments_made: 0, outstanding: 0 });

describe("financials engine", () => {
  it("asks for the insolvency date instead of guessing", () => {
    const n = needsYou({ kind: "bankruptcy", insolvencyDate: null, periods: [], reports: [], schedule: [], today });
    expect(n.map((x) => x.action)).toEqual(["add_date"]);
  });
  it("lists each month with no client report and no income record", () => {
    const n = needsYou({ kind: "bankruptcy", insolvencyDate: "2026-08-15", periods: [p("a", 2026, "August")], reports: [], schedule: [], today });
    expect(n.filter((x) => x.action === "request_report").map((x) => x.month)).toEqual(["2026-09", "2026-10"]);
  });
  it("offers to import a submitted client report rather than flag it missing", () => {
    const n = needsYou({ kind: "bankruptcy", insolvencyDate: "2026-10-01", periods: [], reports: [{ id: "r", period_month: "2026-10-01", status: "submitted", review_state: "Not started", linked_income_period_id: null, totals: {} }], schedule: [], today });
    expect(n.map((x) => x.action)).toEqual(["import_report"]);
  });
  it("flags surplus income starting", () => {
    const n = needsYou({ kind: "bankruptcy", insolvencyDate: "2026-09-01", periods: [p("a", 2026, "September", 0), p("b", 2026, "October", 120)], reports: [], schedule: [], today });
    expect(n.some((x) => x.action === "review_surplus")).toBe(true);
  });
  it("flags the 7-month review within 30 days", () => {
    const n = needsYou({ kind: "bankruptcy", insolvencyDate: "2026-04-20", periods: [], reports: [], schedule: [], today });
    expect(n.find((x) => x.action === "seven_month_review")?.severity).toBe("medium");
  });
  it("counts missed payments and arrears; extends the projected finish", () => {
    const rows = [{ due_date: "2026-09-01", amount_due: 200, amount_received: 200 }, { due_date: "2026-10-01", amount_due: 200, amount_received: 0 }, { due_date: "2026-12-01", amount_due: 200, amount_received: 0 }];
    const perf = paymentPerformance(rows, today)!;
    expect(perf.arrears).toBe(200);
    expect(perf.onTimeRate).toBe(0.5);
    expect(perf.projectedEnd).toBe("2027-01-01");
    expect(needsYou({ kind: "proposal", insolvencyDate: "2026-08-01", periods: [], reports: [], schedule: rows, today }).find((x) => x.action === "chase_payment")).toBeTruthy();
  });
  it("estimated payout abstains with no admitted claims", () => {
    expect(estimatedPayout(1000, 0, 0)).toBeNull();
    expect(estimatedPayout(1000, 0, 2000)!.ratio).toBeCloseTo(0.475);
  });
  it("expected months stop before the current month", () => {
    expect(expectedMonths("2026-10-31", today)).toEqual(["2026-10"]);
  });
  it("counts imported records and forecasts 3 months only with 3+ months of history", () => {
    expect(automationStats([p("a", 2026, "May")], [{ id: "r", period_month: "2026-05-01", status: "submitted", review_state: "", linked_income_period_id: "a", totals: {} }]).auto).toBe(1);
    expect(incomeTrend([p("a", 2026, "May"), p("b", 2026, "June")]).length).toBe(2);
    expect(incomeTrend([p("a", 2026, "May"), p("b", 2026, "June"), p("c", 2026, "July")]).length).toBe(6);
  });
});
