import { describe, it, expect } from "vitest";
import { rankClaim, splitWageClaim, natureFromImportType } from "../s136";

describe("BIA s.136 ranking", () => {
  it("does not guess when the claim type is missing", () => expect(rankClaim("unknown").rank).toBe("needs_review"));
  it("CRA income tax ranks unsecured, not preferred", () => expect(rankClaim("crown_tax").rank).toBe("unsecured"));
  it("levy ranks after administration costs", () => expect(rankClaim("superintendent_levy").order).toBeGreaterThan(rankClaim("administration_costs").order));
  it("source deductions are a deemed trust", () => expect(rankClaim("deemed_trust_source_deductions").rank).toBe("deemed_trust"));
  it("caps wage preference at $2,000", () => expect(splitWageClaim(3500)).toEqual({ preferred: 2000, unsecured: 1500 }));
  it("a bank name alone is not security", () => expect(natureFromImportType("RBC Visa")).toBe("unknown"));
  it("unsecured wording is not read as secured", () => expect(natureFromImportType("Unsecured")).toBe("general"));
});
