import { describe, it, expect } from "vitest";
import { FORM_DEFS, evaluateForm, formVersion, signRefusal, estateKind } from "../formEngine";

const def = (n: string) => FORM_DEFS.find((d) => d.number === n)!;
const base = { kind: "bankruptcy" as const, filingDate: "2024-10-01", failing: {}, unverifiedSources: [], acks: [], today: new Date("2026-11-11T00:00:00Z") };

describe("formEngine", () => {
  it("uses the pre-2024 version for estates filed before Sept 16, 2024", () => {
    expect(formVersion("2024-09-15").label).toBe("Pre-2024 version");
    expect(formVersion("2024-09-16").label).toBe("Current version");
  });
  it("reports missing filing date instead of guessing a version", () => {
    const e = evaluateForm({ ...base, def: def("Form 79"), filingDate: null });
    expect(e.status).toBe("Missing data");
    expect(e.detail).toBe("Missing: filing date");
  });
  it("rules out Form 47 for a bankruptcy", () => {
    const e = evaluateForm({ ...base, def: def("Form 47") });
    expect(e.bucket).toBe("na");
    expect(e.naReason).toBe("Form 47 applies to consumer proposals only.");
  });
  it("Form 65 waits on the debtor when income is missing, labelled with last month", () => {
    const e = evaluateForm({ ...base, def: def("Form 65"), failing: { income: "Monthly income reported" } });
    expect(e.status).toBe("Waiting on debtor");
    expect(e.action).toBe("Remind");
    expect(e.period).toBe("October 2026");
  });
  it("Form 68 deadline is 5 days after the recorded trustee appointment, not the filing date", () => {
    expect(evaluateForm({ ...base, def: def("Form 68"), appointmentDate: "2024-10-03" }).deadline).toBe("2024-10-08");
  });
  it("Form 68 flags a missing appointment date instead of assuming the filing date", () => {
    const e = evaluateForm({ ...base, def: def("Form 68"), appointmentDate: null });
    expect(e.deadline).toBeNull();
    expect(e.status).toBe("Missing data");
    expect(e.detail).toMatch(/trustee appointment date/);
  });
  it("uses the pre-2024 Form 79 title for estates filed before Sept 16, 2024", () => {
    expect(evaluateForm({ ...base, def: def("Form 79"), filingDate: "2024-01-10" }).title).toBe("Statement of Affairs (Non-Business Bankruptcy/Proposal)");
  });
  it("picks Form 13 for summary administration and rules out Form 12", () => {
    expect(evaluateForm({ ...base, def: def("Form 12"), adminType: "summary" }).bucket).toBe("na");
    expect(evaluateForm({ ...base, def: def("Form 13"), adminType: "summary" }).bucket).toBe("due");
    expect(evaluateForm({ ...base, def: def("Form 13"), adminType: null }).detail).toMatch(/administration type/);
  });
  it("refuses sign and file until unverified data is acknowledged", () => {
    const flagged = evaluateForm({ ...base, def: def("Form 14"), unverifiedSources: ["Ledger"], kind: "consumer_proposal" as const, instance: { generated_at: "x", filed_at: null, signing_date: null } });
    expect(flagged.status).toBe("Flagged");
    expect(signRefusal(flagged)).toMatch(/acknowledge 1 flag/);
    const ackd = evaluateForm({ ...base, def: def("Form 14"), unverifiedSources: ["Ledger"], kind: "consumer_proposal" as const, acks: [{ flag: "unverified:Ledger", reason: "Checked statement", by: "u", at: "t" }], instance: { generated_at: "x", filed_at: null, signing_date: null } });
    expect(ackd.action).toBe("Sign");
    expect(signRefusal(ackd)).toBeNull();
  });
  it("consumer proposal report is due 10 days after filing (BIA s.66.14)", () => {
    const e = evaluateForm({ ...base, kind: "consumer_proposal", def: def("Form 48") });
    expect(e.deadline).toBe("2024-10-11");
  });
  it("a signed form is never Filed without OSB evidence", () => {
    const inst = { generated_at: "x", filed_at: "2026-11-01", signing_date: "2026-11-01" };
    const noEvidence = evaluateForm({ ...base, def: def("Form 79"), instance: inst });
    expect(noEvidence.status).toBe("Signed");
    expect(noEvidence.action).toBe("Record OSB filing");
    const withEvidence = evaluateForm({ ...base, def: def("Form 79"), instance: inst, osbEvidence: { reference: "OSB-123", received_at: "2026-11-02" } });
    expect(withEvidence.status).toBe("Filed");
  });
  it("maps estate types", () => {
    expect(estateKind("consumer_proposal")).toBe("consumer_proposal");
    expect(estateKind("bankruptcy")).toBe("bankruptcy");
  });
});
