import type { Payload } from "./types";
export interface Change { field: string; before: string; after: string }
const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : Array.isArray(v) ? `${v.length} entr${v.length === 1 ? "y" : "ies"}` : String(v));
/** Field-by-field differences between a filed payload and its amendment. */
export const diffPayload = (before: Payload, after: Payload): Change[] =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
    .filter((k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null))
    .map((k) => ({ field: k, before: show(before[k]), after: show(after[k]) }));
