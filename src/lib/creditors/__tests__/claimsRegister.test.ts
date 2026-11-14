import { describe, it, expect } from "vitest";
import { validateDecision, dayOneNotice, noticeStatus } from "../claimsRegister";

describe("claims register", () => {
  it("disallowance requires a reason", () => {
    expect(validateDecision({ decision: "disallowed", filedAmount: 500, admittedAmount: 0, reason: "" })).toContain("Write the reason for disallowance (BIA s.135).");
  });
  it("cannot admit more than claimed", () => {
    expect(validateDecision({ decision: "admitted", filedAmount: 500, admittedAmount: 600, reason: "" }).length).toBe(1);
  });
  it("valid admission passes", () => {
    expect(validateDecision({ decision: "admitted", filedAmount: 500, admittedAmount: 500, reason: "" })).toEqual([]);
  });
  it("bankruptcy notice is due 5 days after appointment", () => {
    expect(dayOneNotice("bankruptcy", "2026-11-01", "2026-11-02")?.dueDate).toBe("2026-11-07");
  });
  it("proposal report is due 10 days after filing", () => {
    expect(dayOneNotice("consumer_proposal", "2026-11-01", null)?.dueDate).toBe("2026-11-11");
  });
  it("missing appointment date gives no deadline", () => {
    expect(dayOneNotice("bankruptcy", "2026-11-01", null)?.dueDate).toBeNull();
  });
  it("status flags overdue and late", () => {
    expect(noticeStatus("2026-11-07", null, "2026-11-08")).toBe("overdue");
    expect(noticeStatus("2026-11-07", "2026-11-09", "2026-11-10")).toBe("sent_late");
    expect(noticeStatus(null, null, "2026-11-10")).toBe("not_checked");
  });
});
