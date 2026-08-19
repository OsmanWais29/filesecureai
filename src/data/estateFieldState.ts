// Two-axis field state model for the Estate Workspace.
//
//   provenance -> Where did this value come from?
//   state      -> Can this value currently be relied upon?
//
// A value may therefore be EXTRACTED + UNVERIFIED, CALCULATED + STALE, or
// CALCULATED + BLOCKED. Zero is never used to represent "unknown".

export type Provenance = "SWORN" | "EXTRACTED" | "CALCULATED" | "ENTERED" | "PROPOSED";

export type ValueState = "OK" | "STALE" | "UNVERIFIED" | "BLOCKED" | "DECISION_REQUIRED";

/** A missing or invalid input that prevents a value from being relied upon. */
export interface Dependency {
  /** Human readable name of the missing input, e.g. "Date of insolvency". */
  label: string;
  /** Where the user can supply it. */
  to?: EstateLocation;
}

/** Addressable location inside the estate workspace, used for deep-linking. */
export interface EstateLocation {
  module: string;
  page: string;
  /** Optional record / field identifier the destination should focus. */
  focus?: string;
}

export interface Computed<T> {
  value: T | null;
  provenance: Provenance;
  state: ValueState;
  blockedBy: Dependency[];
  computedAt?: string;
  ruleId?: string;
  ruleVersion?: string;
  directiveVersion?: string;
  /** Named inputs that produced the value — supports reproducibility. */
  inputs?: { label: string; value: string }[];
  /** Extraction confidence 0–1, only meaningful for EXTRACTED provenance. */
  confidence?: number;
}

type Meta<T> = Partial<Omit<Computed<T>, "value">>;

export const computed = <T,>(value: T, meta: Meta<T> = {}): Computed<T> => ({
  value,
  provenance: "CALCULATED",
  state: "OK",
  blockedBy: [],
  computedAt: new Date().toISOString(),
  ...meta,
});

export const blocked = <T,>(blockedBy: Dependency[], meta: Meta<T> = {}): Computed<T> => ({
  value: null,
  provenance: "CALCULATED",
  state: "BLOCKED",
  blockedBy,
  ...meta,
});

export const entered = <T,>(value: T | null | undefined, meta: Meta<T> = {}): Computed<T> =>
  value === null || value === undefined || value === ""
    ? blocked<T>([], { provenance: "ENTERED", ...meta })
    : computed<T>(value, { provenance: "ENTERED", ...meta });

export const isKnown = <T,>(c: Computed<T> | undefined | null): boolean =>
  Boolean(c && c.value !== null && c.value !== undefined && c.state !== "BLOCKED");

/** Renders "—" for anything the system cannot currently assert. Never "0". */
export const displayValue = <T,>(
  c: Computed<T> | undefined | null,
  format: (v: T) => string = (v) => String(v)
): string => (isKnown(c) ? format((c as Computed<T>).value as T) : "—");

export const stateLabel = (c: Computed<unknown> | undefined | null): string => {
  if (!c) return "Unknown";
  switch (c.state) {
    case "BLOCKED":
      return "Blocked";
    case "STALE":
      return "Stale";
    case "UNVERIFIED":
      return "Unverified";
    case "DECISION_REQUIRED":
      return "Human Decision Required";
    default:
      return "Complete";
  }
};

export const blockedReason = (c: Computed<unknown> | undefined | null): string | null => {
  if (!c || !c.blockedBy.length) return null;
  return `Missing: ${c.blockedBy.map((b) => b.label).join(", ")}`;
};

/** Builds the workspace query string used to deep-link a location. */
export const locationHref = (estateId: string | undefined, to: EstateLocation) => {
  const params = new URLSearchParams({ m: to.module, p: to.page });
  if (to.focus) params.set("focus", to.focus);
  return `/estates/${estateId ?? ""}?${params.toString()}`;
};