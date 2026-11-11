import { describe, it, expect } from "vitest";
import { standardThreshold, computeSurplus } from "@/hooks/useEstateIncome";

describe("Superintendent's standards (Directive 11R2)", () => {
  it("2026 one-person limit is $2,716", () => expect(standardThreshold("2026", 1)).toBe(2716));
  it("2026 four-person limit is $5,047", () => expect(standardThreshold("2026", 4)).toBe(5047));
  it("2025 one-person limit is $2,666", () => expect(standardThreshold("2025", 1)).toBe(2666));
  it("2024 one-person limit is $2,610", () => expect(standardThreshold("2024", 1)).toBe(2610));
  it("households of 7 or more use the 7+ row", () => expect(standardThreshold("2026", 9)).toBe(7188));
  it("uses the 2026 four-person limit in the surplus calculation", () => {
    const r = computeSurplus({ monthlyIncome: 6000, nonDiscretionaryExpenses: 0, householdMembers: 4, standardVersion: "2026" } as any);
    expect(r.threshold).toBe(5047);
  });
});
