import { describe, it, expect } from "vitest";
import { readAck, ackMatchesEstate } from "../osbAck";

describe("readAck", () => {
  it("reads reference, estate number, ISO date and acceptance", () => {
    const r = readAck("Your filing was accepted. Confirmation number: OSB-778812 Estate No. 31-2456789 Date: 2026-11-03");
    expect(r).toEqual({ reference: "OSB-778812", estateNumber: "31-2456789", date: "2026-11-03", outcome: "accepted" });
  });
  it("reads written dates and rejections", () => {
    const r = readAck("Submission rejected. Reference #AB12345 received Nov 3, 2026");
    expect(r.date).toBe("2026-11-03");
    expect(r.outcome).toBe("rejected");
    expect(r.reference).toBe("AB12345");
  });
  it("leaves unreadable fields empty instead of guessing", () => {
    expect(readAck("hello")).toEqual({ reference: null, estateNumber: null, date: null, outcome: null });
  });
  it("flags an acknowledgement for a different estate", () => {
    expect(ackMatchesEstate(readAck("Estate No. 31-2456789"), "31-1111111")).toBe(false);
    expect(ackMatchesEstate(readAck("Estate No. 31-2456789"), "312456789")).toBe(true);
    expect(ackMatchesEstate(readAck("none"), "31-1")).toBeNull();
  });
});
