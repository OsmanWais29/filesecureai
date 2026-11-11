import type { CheckIssue, CheckLayer, Payload, SchemaElement } from "./types";

/** Layer 1: structure, mandatory, types, allowed values, repeat limits — against the estate's exact version. */
export const schemaCheck = (elements: SchemaElement[], payload: Payload): CheckLayer => {
  const base = { id: "schema" as const, label: "OSB schema" };
  if (!elements.length) return { ...base, state: "not_checked", issues: [], note: "Schema for this form version is not loaded, so the XML cannot be checked." };
  const issues: CheckIssue[] = [];
  const val = (el: SchemaElement, v: unknown, where: string) => {
    if (v === null || v === undefined || v === "") { if (el.min_occurs > 0) issues.push({ message: `${where} is required but empty.`, fix: el.path }); return; }
    if (el.data_type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) issues.push({ message: `${where} must be a date (YYYY-MM-DD).`, fix: el.path });
    if (el.data_type === "decimal" && Number.isNaN(Number(v))) issues.push({ message: `${where} must be a number.`, fix: el.path });
    if (el.enum_values?.length && !el.enum_values.includes(String(v))) issues.push({ message: `${where} "${v}" is not an allowed OSB code.`, fix: el.path });
  };
  const groups = new Map<string, SchemaElement[]>();
  for (const el of elements) {
    const [g, child] = el.path.split("/");
    if (child) { groups.set(g, [...(groups.get(g) ?? []), el]); continue; }
    val(el, payload[el.path], el.path);
  }
  groups.forEach((kids, g) => {
    const rows = Array.isArray(payload[g]) ? (payload[g] as Array<Record<string, unknown>>) : [];
    const groupMin = Math.min(...kids.map((k) => k.min_occurs));
    if (groupMin > 0 && !rows.length) issues.push({ message: `At least one ${g} entry is required.`, fix: g });
    rows.forEach((r, i) => kids.forEach((k) => val(k, r[k.path.split("/")[1]], `${g} ${i + 1}: ${k.path.split("/")[1]}`)));
  });
  return { ...base, state: issues.length ? "fail" : "pass", issues };
};

export interface CrossFormInput { form79LiabilitiesTotal?: number | null; creditorRegisterTotal?: number | null; form65MonthlyIncome?: number | null; form79MonthlyIncome?: number | null }
const cents = (n: number) => Math.round(n * 100);
/** Layer 2: forms filed together must agree. Abstains when either side is unknown. */
export const crossFormCheck = (i: CrossFormInput): CheckLayer => {
  const issues: CheckIssue[] = [];
  let compared = 0;
  if (i.form79LiabilitiesTotal != null && i.creditorRegisterTotal != null) {
    compared++;
    if (cents(i.form79LiabilitiesTotal) !== cents(i.creditorRegisterTotal)) issues.push({ message: `Statement of affairs liabilities ($${i.form79LiabilitiesTotal.toFixed(2)}) don't match the creditor list ($${i.creditorRegisterTotal.toFixed(2)}).`, fix: "creditors" });
  }
  if (i.form65MonthlyIncome != null && i.form79MonthlyIncome != null) {
    compared++;
    if (cents(i.form65MonthlyIncome) !== cents(i.form79MonthlyIncome)) issues.push({ message: `Monthly income on Form 65 ($${i.form65MonthlyIncome.toFixed(2)}) differs from Form 79 ($${i.form79MonthlyIncome.toFixed(2)}).`, fix: "income" });
  }
  const base = { id: "cross_form" as const, label: "Cross-form consistency" };
  if (!compared) return { ...base, state: "not_checked", issues: [], note: "No related form figures available to compare yet." };
  return { ...base, state: issues.length ? "fail" : "pass", issues };
};

/** Layer 3: BIA rules from the estate compliance registry. */
export const rulesCheck = (failing: string[], evaluated: boolean): CheckLayer => {
  const base = { id: "rules" as const, label: "BIA rules" };
  if (!evaluated) return { ...base, state: "not_checked", issues: [], note: "Estate compliance rules haven't been evaluated." };
  return { ...base, state: failing.length ? "fail" : "pass", issues: failing.map((m) => ({ message: m, fix: "compliance" })) };
};

/** Required companion forms by filing type (what the OSB system would prompt for). */
export const PACKAGES: Record<string, { label: string; forms: string[] }> = {
  initial_consumer_proposal: { label: "Initial consumer proposal", forms: ["Form 47", "Form 48", "Form 65", "Form 79"] },
  initial_bankruptcy: { label: "Initial bankruptcy", forms: ["Form 21", "Form 65", "Form 79"] },
};
export const packageFor = (formNumber: string, estateType?: string | null): string | null => {
  const t = (estateType ?? "").toLowerCase();
  const key = t.includes("proposal") ? "initial_consumer_proposal" : t.includes("bankrupt") ? "initial_bankruptcy" : null;
  return key && PACKAGES[key].forms.includes(formNumber) ? key : null;
};
/** Layer 4: package completeness — companion forms must be signed or filed alongside. */
export const packageCheck = (formNumber: string, estateType: string | null | undefined, readyForms: string[]): CheckLayer => {
  const base = { id: "package" as const, label: "Package completeness" };
  const key = packageFor(formNumber, estateType);
  if (!key) return { ...base, state: "pass", issues: [], note: "Filed on its own." };
  const missing = PACKAGES[key].forms.filter((f) => f !== formNumber && !readyForms.includes(f));
  return { ...base, state: missing.length ? "fail" : "pass", issues: missing.map((f) => ({ message: `${PACKAGES[key].label} also needs ${f}.`, fix: f })) };
};

export interface Readiness { state: "ready" | "blocked" | "not_checked"; score: number; issues: CheckIssue[]; layers: CheckLayer[] }
/** One indicator. Any unrun layer means "not checked" — never "ready". */
export const readiness = (layers: CheckLayer[]): Readiness => {
  const issues = layers.flatMap((l) => l.issues);
  const passed = layers.filter((l) => l.state === "pass").length;
  const score = Math.round((passed / layers.length) * 100);
  const state = issues.length ? "blocked" : layers.some((l) => l.state === "not_checked") ? "not_checked" : "ready";
  return { state, score, issues, layers };
};
