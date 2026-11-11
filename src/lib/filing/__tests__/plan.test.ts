import { describe, it, expect } from "vitest";
import { buildPlan, form65Gaps, type PlanEstate } from "../plan";
const bk: PlanEstate = { id: "e1", debtor_name: "Mercer", file_number: "31-1", estate_type: "bankruptcy", insolvency_date: "2026-09-01", appointment_date: null, administration_type: "summary" };
const T = "2026-11-11";
describe("filing plan", () => {
  it("Form 68 without an appointment date has no deadline and says why", () => {
    const f = buildPlan([bk], [], T).find((p) => p.def.number === "Form 68")!;
    expect(f.deadline).toBeNull();
    expect(f.blocker).toBe("Trustee appointment date not recorded");
  });
  it("Form 68 deadline is 5 days after appointment", () => {
    const f = buildPlan([{ ...bk, appointment_date: "2026-09-02" }], [], T).find((p) => p.def.number === "Form 68")!;
    expect(f.deadline).toBe("2026-09-07");
  });
  it("a form already drafted leaves the plan", () => {
    expect(buildPlan([bk], [{ estate_id: "e1", form_number: "Form 68", status: "drafted", created_at: "2026-09-03" }], T).some((p) => p.def.number === "Form 68")).toBe(false);
  });
  it("Form 65 is planned once per month", () => {
    expect(buildPlan([bk], [{ estate_id: "e1", form_number: "Form 65", status: "drafted", created_at: "2026-11-02" }], T).some((p) => p.def.number === "Form 65")).toBe(false);
    expect(buildPlan([bk], [], T).some((p) => p.def.number === "Form 65")).toBe(true);
  });
  it("consumer proposals get no Form 65", () => {
    expect(buildPlan([{ ...bk, estate_type: "consumer_proposal" }], [], T).some((p) => p.def.number === "Form 65")).toBe(false);
  });
  it("lists missed Form 65 months since filing", () => {
    expect(form65Gaps([bk], [{ estate_id: "e1", form_number: "Form 65", status: "accepted", created_at: "2026-10-05" }], T).map((g) => g.month)).toEqual([]);
    expect(form65Gaps([bk], [], T).map((g) => g.month)).toEqual(["2026-10"]);
  });
});
