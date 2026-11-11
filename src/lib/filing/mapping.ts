import type { FieldMapping, SchemaElement } from "./types";

export interface Coverage { loaded: boolean; total: number; mapped: number; pct: number; unmappedMandatory: SchemaElement[]; unmappedOptional: SchemaElement[]; releasable: boolean }

/** Coverage of a schema version by mappings. Unloaded schemas never count as covered. */
export const coverage = (elements: SchemaElement[], mappings: FieldMapping[]): Coverage => {
  if (!elements.length) return { loaded: false, total: 0, mapped: 0, pct: 0, unmappedMandatory: [], unmappedOptional: [], releasable: false };
  const mapped = new Set(mappings.map((m) => m.schema_element_id));
  const un = elements.filter((e) => !mapped.has(e.id));
  const unmappedMandatory = un.filter((e) => e.min_occurs > 0);
  const unmappedOptional = un.filter((e) => e.min_occurs === 0);
  const m = elements.length - un.length;
  return { loaded: true, total: elements.length, mapped: m, pct: Math.round((m / elements.length) * 100), unmappedMandatory, unmappedOptional, releasable: unmappedMandatory.length === 0 && unmappedOptional.length === 0 };
};

/** Picks the choice branch from the estate record, never by hand. */
export const debtorChoice = (debtorKind?: string | null): "Person" | "Corporation" | null => {
  const k = (debtorKind ?? "").toLowerCase();
  if (/corp|company|business/.test(k)) return "Corporation";
  if (/person|individual|consumer/.test(k)) return "Person";
  return null;
};

const PROVINCES: Record<string, string> = {
  alberta: "AB", "british columbia": "BC", manitoba: "MB", "new brunswick": "NB", "newfoundland and labrador": "NL", newfoundland: "NL",
  "nova scotia": "NS", ontario: "ON", "prince edward island": "PE", quebec: "QC", "québec": "QC", saskatchewan: "SK",
  "northwest territories": "NT", nunavut: "NU", yukon: "YT",
};
/** Converts free text to a code list value; returns null (flag it) instead of guessing. */
export const toCode = (value: string | null | undefined, allowed: string[]): { code: string | null; confident: boolean } => {
  const v = (value ?? "").trim();
  if (!v) return { code: null, confident: false };
  const up = v.toUpperCase();
  if (allowed.includes(up)) return { code: up, confident: true };
  const p = PROVINCES[v.toLowerCase()];
  if (p && allowed.includes(p)) return { code: p, confident: true };
  return { code: null, confident: false };
};
