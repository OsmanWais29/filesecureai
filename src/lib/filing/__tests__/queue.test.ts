import { describe, it, expect } from "vitest";
import { actionBucket, isOverdue, isDueSoon, byRisk } from "../queue";
const T = "2026-11-11";
describe("filing action counts", () => {
  it("checked filing with no issues is ready to sign", () => expect(actionBucket({ status: "checked", deadline: null, readiness: { issues: [] } })).toBe("sign"));
  it("filing with an issue needs a fix", () => expect(actionBucket({ status: "checked", deadline: null, readiness: { issues: [{ message: "x" }] } })).toBe("fix"));
  it("rejected filing needs a fix", () => expect(actionBucket({ status: "rejected", deadline: null })).toBe("fix"));
  it("signed but unfiled past deadline is overdue", () => expect(isOverdue({ status: "signed", deadline: "2026-11-10" }, T)).toBe(true));
  it("accepted filing is never overdue", () => expect(isOverdue({ status: "accepted", deadline: "2026-11-01" }, T)).toBe(false));
  it("due in 7 days includes day 7, excludes day 8", () => {
    expect(isDueSoon({ status: "drafted", deadline: "2026-11-18" }, T)).toBe(true);
    expect(isDueSoon({ status: "drafted", deadline: "2026-11-19" }, T)).toBe(false);
  });
  it("sorts overdue first", () => {
    const r = [{ status: "drafted" as const, deadline: "2026-11-15" }, { status: "drafted" as const, deadline: "2026-11-01" }].sort(byRisk(T));
    expect(r[0].deadline).toBe("2026-11-01");
  });
});
