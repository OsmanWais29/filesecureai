/**
 * Claim ranking under the BIA. Secured creditors rank outside the scheme of
 * distribution; deemed trusts (s.67(3)) are not estate property; preferred claims
 * follow s.136(1) in order; Crown claims are unsecured (s.86) unless secured or a deemed trust.
 * When the claim's nature isn't recorded, the result is "needs_review" — never guessed from the name.
 */
export type ClaimNature =
  | "secured" | "deemed_trust_source_deductions"
  | "funeral" | "administration_costs" | "superintendent_levy" | "wages" | "pension"
  | "support_arrears" | "municipal_taxes" | "landlord_rent" | "execution_costs"
  | "crown_tax" | "general" | "unknown";

export type ClaimRank = "secured" | "deemed_trust" | "preferred" | "unsecured" | "needs_review";

const PREFERRED: Partial<Record<ClaimNature, { order: number; cite: string; label: string }>> = {
  funeral: { order: 1, cite: "BIA s.136(1)(a)", label: "Funeral expenses (deceased bankrupt)" },
  administration_costs: { order: 2, cite: "BIA s.136(1)(b)", label: "Costs of administration" },
  superintendent_levy: { order: 3, cite: "BIA s.136(1)(c)", label: "Superintendent's levy" },
  wages: { order: 4, cite: "BIA s.136(1)(d)", label: "Wages, 6 months before bankruptcy, up to $2,000" },
  pension: { order: 5, cite: "BIA s.136(1)(d.01)", label: "Unremitted pension contributions" },
  support_arrears: { order: 6, cite: "BIA s.136(1)(d.1)", label: "Support arrears, 12 months before bankruptcy" },
  municipal_taxes: { order: 7, cite: "BIA s.136(1)(e)", label: "Municipal taxes, 2 years before bankruptcy" },
  landlord_rent: { order: 8, cite: "BIA s.136(1)(f)", label: "Landlord: 3 months' arrears + 3 months accelerated" },
  execution_costs: { order: 9, cite: "BIA s.136(1)(g)", label: "First executing creditor's costs" },
};

export function rankClaim(nature: ClaimNature | null | undefined): { rank: ClaimRank; order: number; citation: string; reason: string } {
  if (!nature || nature === "unknown") return { rank: "needs_review", order: 99, citation: "BIA s.136", reason: "Claim type not recorded. Review the proof of claim before ranking." };
  if (nature === "secured") return { rank: "secured", order: 0, citation: "BIA s.136(1), s.69.3", reason: "Valid security ranks ahead of the scheme of distribution, once the trustee has reviewed it." };
  if (nature === "deemed_trust_source_deductions") return { rank: "deemed_trust", order: 0, citation: "BIA s.67(3)", reason: "Unremitted source deductions are held in trust and are not estate property." };
  const p = PREFERRED[nature];
  if (p) return { rank: "preferred", order: p.order, citation: p.cite, reason: p.label };
  if (nature === "crown_tax") return { rank: "unsecured", order: 50, citation: "BIA s.86", reason: "Crown claims rank as unsecured unless secured or a deemed trust." };
  return { rank: "unsecured", order: 50, citation: "BIA s.141", reason: "Ordinary unsecured claim, paid rateably." };
}

/** Wage preference is capped: s.136(1)(d) $2,000 (plus up to $1,000 sales expenses); the rest is unsecured. */
export function splitWageClaim(amount: number, salesExpenses = 0) {
  const wages = Math.min(Math.max(amount, 0), 2000);
  const expenses = Math.min(Math.max(salesExpenses, 0), 1000);
  return { preferred: wages + expenses, unsecured: Math.max(amount - wages, 0) + Math.max(salesExpenses - expenses, 0) };
}

export const NATURE_OPTIONS: { value: ClaimNature; label: string }[] = [
  { value: "unknown", label: "Not yet reviewed" }, { value: "general", label: "General unsecured" }, { value: "secured", label: "Secured" },
  { value: "deemed_trust_source_deductions", label: "Deemed trust (source deductions)" }, { value: "crown_tax", label: "Crown / income tax" },
  ...Object.entries(PREFERRED).map(([value, p]) => ({ value: value as ClaimNature, label: `Preferred: ${p!.label}` })),
];

/** Maps a free-text creditor type from an import file. Only explicit wording counts. */
export function natureFromImportType(type: string): ClaimNature {
  const t = type.toLowerCase();
  if (/\bsecured\b/.test(t) && !/unsecured/.test(t)) return "secured";
  if (/source deduction|deemed trust/.test(t)) return "deemed_trust_source_deductions";
  if (/unsecured|general/.test(t)) return "general";
  return "unknown";
}
