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
    const e = evaluateForm({ ...base, def: def("Form 66"), filingDate: null });
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
  it("Form 67 deadline is 5 days after filing", () => {
    expect(evaluateForm({ ...base, def: def("Form 67") }).deadline).toBe("2024-10-06");
  });
  it("refuses sign and file until unverified data is acknowledged", () => {
    const flagged = evaluateForm({ ...base, def: def("Form 78"), unverifiedSources: ["Ledger"], instance: { generated_at: "x", filed_at: null, signing_date: null } });
    expect(flagged.status).toBe("Flagged");
    expect(signRefusal(flagged)).toMatch(/acknowledge 1 flag/);
    const ackd = evaluateForm({ ...base, def: def("Form 78"), unverifiedSources: ["Ledger"], acks: [{ flag: "unverified:Ledger", reason: "Checked statement", by: "u", at: "t" }], instance: { generated_at: "x", filed_at: null, signing_date: null } });
    expect(ackd.action).toBe("Sign and file");
    expect(signRefusal(ackd)).toBeNull();
  });
  it("maps estate types", () => {
    expect(estateKind("consumer_proposal")).toBe("consumer_proposal");
    expect(estateKind("bankruptcy")).toBe("bankruptcy");
  });
});
