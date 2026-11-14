import { describe, expect, it } from "vitest";
import { assessmentErrors, counsellingEvidence, counsellingWindow } from "../estateJourney";
describe("estate journey checks", () => {
  it("uses the Directive 1R8 first-session window of 10 to 90 days", () => {
    expect(counsellingWindow("2026-01-01", null)).toEqual({ firstFrom: "2026-01-11", firstThrough: "2026-04-01", secondFrom: null });
  });
  it("requires at least 30 days between sessions", () => {
    expect(counsellingWindow(null, "2026-02-01").secondFrom).toBe("2026-03-03");
  });
  it("does not invent dates without a recorded anchor", () => {
    expect(counsellingWindow(null, null).firstThrough).toBeNull();
  });
  it("two copies of the first session do not fulfil both stages", () => {
    const s = { session_number: "First session (Stage 1)", completed: true, appointment_date: "2026-02-01", counsellor: "Counsellor", source_document: "Certificate ref", refused: false, neglected: false };
    expect(counsellingEvidence([s, s])).toBe(false);
    expect(counsellingEvidence([s, { ...s, session_number: "Second session (Stage 2)" }])).toBe(true);
  });
  it("blocks assessment sign-off without debtor acknowledgement", () => {
    const v = { assessed_on: "2026-01-01", assessor: "A", options_explained: "Options", recommendation: "Proposal", evidence_reference: "ref", supervising_lit: "LIT", signed_off: true, id_verified: true, prior_insolvency_checked: true, debtor_acknowledged: false };
    expect(assessmentErrors(v)).toHaveLength(1);
    expect(assessmentErrors({ ...v, debtor_acknowledged: true })).toEqual([]);
  });
});