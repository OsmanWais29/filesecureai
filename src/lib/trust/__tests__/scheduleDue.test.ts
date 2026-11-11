import { describe, it, expect } from "vitest";
import { scheduleDueToDate } from "../trustLedger";

describe("proposal schedule due to date", () => {
  it("counts monthly payments including the first", () => expect(scheduleDueToDate({ amount: 250, frequency: "monthly", firstDue: "2026-01-15" }, "2026-04-14")).toBe(750));
  it("stops at the last payment date", () => expect(scheduleDueToDate({ amount: 100, frequency: "monthly", firstDue: "2026-01-01", lastDue: "2026-03-01" }, "2026-12-01")).toBe(300));
  it("is unknown without a frequency", () => expect(scheduleDueToDate({ amount: 100, firstDue: "2026-01-01" }, "2026-02-01")).toBeUndefined());
});
