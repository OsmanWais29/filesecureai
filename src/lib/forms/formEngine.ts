// Form engine: the only place that decides a form's version, applicability,
// status, bucket and single next action. Pure — no I/O, fully unit-tested.

export type AdminType = "summary" | "ordinary";
export type EstateKind = "bankruptcy" | "consumer_proposal" | "unknown";
export type FormBucket = "due" | "waiting" | "filed" | "na";
export type FormStatus =
  | "Ready"
  | "Missing data"
  | "Waiting on debtor"
  | "Waiting on creditor"
  | "Flagged"
  | "Signed"
  | "Filed";
export type FormAction = "Generate" | "Remind" | "Resolve" | "Sign" | "Record OSB filing" | null;
export type DataSource = "Estate record" | "Ledger" | "Debtor portal" | "Creditor register" | "Estate dates";

export interface FormDef {
  number: string;
  title: string;
  appliesTo: EstateKind[];
  /** Compliance rule ids that must pass before generation. */
  requires: string[];
  /** Covers a monthly period (labelled with the previous month). */
  monthly?: boolean;
  waitsOn?: "debtor" | "creditor";
  /** Pre-September 16, 2024 OSB title, when it differs. */
  titlePre2024?: string;
  /** Bankruptcy administration types this form applies to (omit = all). */
  adminTypes?: AdminType[];
  /** Deadlines count from a recorded date; "appointment" never falls back to the filing date. */
  deadline?: { days: number; anchor: "filing" | "appointment"; label: string; citation: string };
  sources: DataSource[];
}

export const VERSION_CUTOVER = "2024-09-16";

// Numbers and names checked against the OSB forms list
// (ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/forms), 2009-amendment versions.
export const FORM_DEFS: FormDef[] = [
  { number: "Form 21", title: "Assignment for the General Benefit of Creditors", appliesTo: ["bankruptcy"], requires: ["identity"], deadline: { days: 0, anchor: "filing", label: "Accompanies the assignment when filed", citation: "BIA s.49(1)–(2)" }, sources: ["Estate record"] },
  { number: "Form 47", title: "Consumer Proposal", appliesTo: ["consumer_proposal"], requires: ["identity", "dates"], sources: ["Estate record", "Estate dates"] },
  { number: "Form 48", title: "Report of Administrator on Consumer Proposal", appliesTo: ["consumer_proposal"], requires: ["identity", "creditors"], deadline: { days: 10, anchor: "filing", label: "Within 10 days after filing the consumer proposal", citation: "BIA s.66.14(a)" }, sources: ["Estate record", "Creditor register"] },
  { number: "Form 49", title: "Notice to Creditors of Consumer Proposal", appliesTo: ["consumer_proposal"], requires: ["creditors"], deadline: { days: 10, anchor: "filing", label: "Sent to every known creditor within 10 days after filing", citation: "BIA s.66.14(b)" }, sources: ["Creditor register"] },
  { number: "Form 68", title: "Notice of Bankruptcy, First Meeting of Creditors", appliesTo: ["bankruptcy"], requires: ["creditors"], deadline: { days: 5, anchor: "appointment", label: "Within 5 days after the trustee’s appointment", citation: "BIA s.102(1)" }, sources: ["Estate record", "Creditor register"] },
  { number: "Form 79", title: "Statement of Affairs (Bankruptcy/Proposal of an Individual)", titlePre2024: "Statement of Affairs (Non-Business Bankruptcy/Proposal)", appliesTo: ["bankruptcy", "consumer_proposal"], requires: ["identity", "assets", "creditors"], sources: ["Estate record", "Creditor register"] },
  { number: "Form 31", title: "Proof of Claim", appliesTo: ["bankruptcy", "consumer_proposal"], requires: ["creditors"], waitsOn: "creditor", sources: ["Creditor register"] },
  { number: "Form 65", title: "Monthly Income and Expense Statement of the Bankrupt/Debtor and the Family Unit", appliesTo: ["bankruptcy"], requires: ["income"], monthly: true, waitsOn: "debtor", sources: ["Debtor portal"] },
  { number: "Form 12", title: "Statement of Receipts and Disbursements (Other than Summary Administration and Consumer Proposals)", appliesTo: ["bankruptcy"], adminTypes: ["ordinary"], requires: ["reconciliation"], sources: ["Ledger"] },
  { number: "Form 13", title: "Trustee’s Statement of Receipts and Disbursements (Summary Administration)", appliesTo: ["bankruptcy"], adminTypes: ["summary"], requires: ["reconciliation"], sources: ["Ledger"] },
  { number: "Form 14", title: "Administrator’s Statement of Receipts and Disbursements", appliesTo: ["consumer_proposal"], requires: ["reconciliation"], sources: ["Ledger"] },
  { number: "Form 82", title: "Report of Trustee on Bankrupt’s Application for Discharge", appliesTo: ["bankruptcy"], requires: ["counselling", "income"], sources: ["Estate record", "Debtor portal"] },
];

export const estateKind = (type?: string | null): EstateKind => {
  const t = (type ?? "").toLowerCase();
  if (t.includes("proposal")) return "consumer_proposal";
  if (t.includes("bankrupt")) return "bankruptcy";
  return "unknown";
};

export interface FormVersion { label: string; reason: string; known: boolean }

export const formVersion = (filingDate?: string | null): FormVersion => {
  if (!filingDate) return { label: "Version unknown", reason: "Filing date missing, so the form version cannot be determined.", known: false };
  return filingDate < VERSION_CUTOVER
    ? { label: "Pre-2024 version", reason: "Estate filed before September 16, 2024.", known: true }
    : { label: "Current version", reason: "Estate filed on or after September 16, 2024.", known: true };
};

export const periodLabel = (def: FormDef, today: Date): string | null => {
  if (!def.monthly) return null;
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  return d.toLocaleString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
};

export const adminType = (v?: string | null): AdminType | null => {
  const t = (v ?? "").toLowerCase();
  if (t.includes("summary")) return "summary";
  if (t.includes("ordinary")) return "ordinary";
  return null;
};

export const formTitle = (def: FormDef, filingDate?: string | null) =>
  def.titlePre2024 && filingDate && filingDate < VERSION_CUTOVER ? def.titlePre2024 : def.title;

export const deadlineDate = (def: FormDef, filingDate?: string | null, appointmentDate?: string | null): string | null => {
  if (!def.deadline) return null;
  const anchor = def.deadline.anchor === "appointment" ? appointmentDate : filingDate;
  if (!anchor) return null;
  const d = new Date(`${anchor}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + def.deadline.days);
  return d.toISOString().slice(0, 10);
};

export interface FormFlag { id: string; message: string; why: string }
export interface FlagAck { flag: string; reason: string; by: string; at: string }

export interface FormInput {
  def: FormDef;
  kind: EstateKind;
  filingDate?: string | null;
  /** Recorded trustee appointment date — never inferred from the filing date. */
  appointmentDate?: string | null;
  adminType?: AdminType | null;
  /** Failing compliance rules: id -> plain-language rule text. */
  failing: Record<string, string>;
  /** Sources holding AI-extracted / bank-fed values not yet confirmed. */
  unverifiedSources: DataSource[];
  instance?: { generated_at: string | null; filed_at: string | null; signing_date: string | null };
  /** Evidence that the OSB (or recipient) received the filing. Required for "Filed". */
  osbEvidence?: { reference: string; received_at: string } | null;
  acks: FlagAck[];
  today: Date;
}

export interface FormEvaluation {
  title: string;
  bucket: FormBucket;
  status?: FormStatus;
  detail: string;
  action: FormAction;
  version: FormVersion;
  period: string | null;
  deadline: string | null;
  flags: FormFlag[];
  openFlags: FormFlag[];
  blockers: string[];
  naReason?: string;
}

const KIND_LABEL: Record<EstateKind, string> = { bankruptcy: "bankruptcies", consumer_proposal: "consumer proposals", unknown: "a known estate type" };

export const evaluateForm = (i: FormInput): FormEvaluation => {
  const version = formVersion(i.filingDate);
  const period = periodLabel(i.def, i.today);
  const deadline = deadlineDate(i.def, i.filingDate, i.appointmentDate);
  const title = formTitle(i.def, i.filingDate);
  const base = { title, version, period, deadline, flags: [] as FormFlag[], openFlags: [] as FormFlag[], blockers: [] as string[] };

  if (i.kind === "unknown") {
    return { ...base, bucket: "due", status: "Missing data", detail: "Missing: estate type", action: "Resolve" };
  }
  if (!i.def.appliesTo.includes(i.kind)) {
    const only = i.def.appliesTo.map((k) => KIND_LABEL[k]).join(" and ");
    return { ...base, bucket: "na", detail: "", action: null, naReason: `${i.def.number} applies to ${only} only.` };
  }
  if (i.def.adminTypes && i.kind === "bankruptcy") {
    if (!i.adminType) return { ...base, bucket: "due", status: "Missing data", detail: "Missing: administration type (summary or ordinary) — review needed", action: "Resolve" };
    if (!i.def.adminTypes.includes(i.adminType)) {
      return { ...base, bucket: "na", detail: "", action: null, naReason: `${i.def.number} is for ${i.def.adminTypes[0]} administrations; this estate is ${i.adminType}.` };
    }
  }
  if (i.instance?.filed_at && i.osbEvidence?.reference) {
    return { ...base, bucket: "filed", status: "Filed", detail: `OSB evidence: ${i.osbEvidence.reference} (${i.osbEvidence.received_at})`, action: null };
  }
  if (i.instance?.signing_date || i.instance?.filed_at) {
    return {
      ...base,
      bucket: "due",
      status: "Signed",
      detail: i.instance?.filed_at
        ? "Marked filed without OSB evidence — record the acknowledgement to confirm filing"
        : "Signed internally — not filed until OSB evidence is recorded",
      action: "Record OSB filing",
    };
  }

  const blockers = i.def.requires.filter((id) => i.failing[id]).map((id) => i.failing[id]);
  const flags: FormFlag[] = i.def.sources
    .filter((s) => i.unverifiedSources.includes(s))
    .map((s) => ({ id: `unverified:${s}`, message: `${s} values came from AI extraction or bank data and are not yet confirmed.`, why: "OSB Directive 32 — records must be verified before filing." }));
  const ackd = new Set(i.acks.map((a) => a.flag));
  const openFlags = flags.filter((f) => !ackd.has(f.id));
  const ev = { ...base, flags, openFlags, blockers };

  if (!version.known) return { ...ev, bucket: "due", status: "Missing data", detail: "Missing: filing date", action: "Resolve" };
  if (i.def.deadline?.anchor === "appointment" && !i.appointmentDate) {
    return { ...ev, bucket: "due", status: "Missing data", detail: "Missing: trustee appointment date — deadline not calculated, review needed", action: "Resolve" };
  }
  if (blockers.length) {
    if (i.def.waitsOn === "debtor") return { ...ev, bucket: "waiting", status: "Waiting on debtor", detail: blockers[0], action: "Remind" };
    if (i.def.waitsOn === "creditor") return { ...ev, bucket: "waiting", status: "Waiting on creditor", detail: blockers[0], action: "Remind" };
    return { ...ev, bucket: "due", status: "Missing data", detail: `Missing: ${blockers[0]}`, action: "Resolve" };
  }
  if (openFlags.length) return { ...ev, bucket: "due", status: "Flagged", detail: openFlags[0].message, action: "Resolve" };
  if (i.instance?.generated_at) {
    return { ...ev, bucket: "due", status: "Ready", detail: "Generated — ready for trustee signature", action: "Sign" };
  }
  return { ...ev, bucket: "due", status: "Ready", detail: "All data present", action: "Generate" };
};

/** Why Sign must refuse, or null when it may proceed. */
export const signRefusal = (e: FormEvaluation): string | null => {
  if (e.bucket === "na" || e.bucket === "filed" || e.status === "Signed") return "This form is not open for signing.";
  if (e.blockers.length || !e.version.known) return `Cannot file yet: ${e.detail}.`;
  if (e.openFlags.length) return `Fix or acknowledge ${e.openFlags.length} flag(s) with a written reason before filing.`;
  return null;
};

export const sortDue = <T extends { evaluation: FormEvaluation }>(rows: T[]) =>
  [...rows].sort((a, b) => (a.evaluation.deadline ?? "9999").localeCompare(b.evaluation.deadline ?? "9999"));
