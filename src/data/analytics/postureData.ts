// Audience-split analytics dataset.
// Section A = regulatory posture (obligation-bound, point-in-time)
// Section B = firm performance
// Section C = benchmarks against OSB published figures

export type MetricStatus = "compliant" | "watch" | "breach" | "neutral";

export interface FileRow {
  estate: string;
  file: string;
  lit: string;
  office: string;
  detail: string;
  status: MetricStatus;
}

export interface SpreadRow {
  label: string;
  numerator: number;
  denominator: number;
}

export interface PostureMetric {
  id: string;
  label: string;
  /** Named obligation or regulatory signal this metric answers to. */
  citation?: string;
  numerator: number;
  denominator: number;
  /** How to render the ratio: percentage, raw count, or days. */
  unit: "percent" | "count" | "days";
  /** Higher is better for percent metrics unless inverted. */
  inverted?: boolean;
  status: MetricStatus;
  statusReason: string;
  /** AI-derived figures must declare themselves and their sign-off state. */
  aiDerived?: boolean;
  signOff?: "signed" | "pending" | "not-required";
  spreadLabel?: string;
  spread?: SpreadRow[];
  files: FileRow[];
  note?: string;
}

export interface BenchmarkRow {
  id: string;
  label: string;
  firmValue: number;
  publishedValue: number;
  unit: "percent" | "count" | "days";
  source: string;
  betterWhen: "lower" | "higher";
  asOf: string;
}

/** Immutable snapshots. A view "as of 31 March" must reproduce on 30 September. */
export interface Snapshot {
  id: string;
  asOf: string; // ISO date, absolute — never "last 30 days"
  label: string;
  sealedAt: string;
  sealedBy: string;
}

export const SNAPSHOTS: Snapshot[] = [
  {
    id: "2026-06-30",
    asOf: "2026-06-30",
    label: "As of 30 June 2026 (Q1 2026-27)",
    sealedAt: "2026-07-02T13:04:00Z",
    sealedBy: "M. Harris, LIT",
  },
  {
    id: "2026-03-31",
    asOf: "2026-03-31",
    label: "As of 31 March 2026 (fiscal year end)",
    sealedAt: "2026-04-01T09:12:00Z",
    sealedBy: "M. Harris, LIT",
  },
  {
    id: "2025-12-31",
    asOf: "2025-12-31",
    label: "As of 31 December 2025",
    sealedAt: "2026-01-02T10:41:00Z",
    sealedBy: "M. Harris, LIT",
  },
];

const f = (
  estate: string,
  file: string,
  lit: string,
  office: string,
  detail: string,
  status: MetricStatus
): FileRow => ({ estate, file, lit, office, detail, status });

export const SECTION_A: PostureMetric[] = [
  {
    id: "srd-first-pass",
    label: "SRD first-pass acceptance rate",
    citation: "SRD risk model — summary admin + consumer proposals (national); Standards of Practice consultation 2026-27",
    numerator: 288,
    denominator: 317,
    unit: "percent",
    status: "watch",
    statusReason: "Below the 95% internal floor at two offices; no OSB threshold published yet.",
    spreadLabel: "By office — spread, not average",
    spread: [
      { label: "Winnipeg", numerator: 96, denominator: 98 },
      { label: "Regina", numerator: 74, denominator: 86 },
      { label: "Calgary", numerator: 61, denominator: 63 },
      { label: "Thunder Bay", numerator: 57, denominator: 70 },
    ],
    files: [
      f("Doyle, R.", "31-2917440", "M. Harris", "Regina", "Comment: assets schedule inconsistent with Form 79 attachment", "breach"),
      f("Nkemdirim, A.", "31-2917612", "M. Harris", "Regina", "Comment: income figure differs from verified deposit record", "breach"),
      f("Pelletier, J.", "31-2918003", "S. Okafor", "Thunder Bay", "Comment: counselling appointment not recorded at filing", "watch"),
      f("Vasquez, D.", "31-2918119", "S. Okafor", "Thunder Bay", "Comment: creditor address incomplete", "watch"),
    ],
    note: "Days-to-clearance on returned filings: median 6, worst 21 (Thunder Bay).",
  },
  {
    id: "srd-comment-mix",
    label: "Returned filings carrying an income or asset comment",
    citation: "SRD comment categories; Standards of Practice consultation 2026-27",
    numerator: 17,
    denominator: 29,
    unit: "percent",
    inverted: true,
    status: "watch",
    statusReason: "Majority of returns trace to unverified income at intake, not clerical error.",
    aiDerived: true,
    signOff: "signed",
    files: [
      f("Doyle, R.", "31-2917440", "M. Harris", "Regina", "Category: income — intake estimate vs verified", "watch"),
      f("Nkemdirim, A.", "31-2917612", "M. Harris", "Regina", "Category: income — undeclared second employer", "watch"),
      f("Pelletier, J.", "31-2918003", "S. Okafor", "Thunder Bay", "Category: assets — vehicle valuation basis", "watch"),
    ],
  },
  {
    id: "aged-estates",
    label: "Estates past expected closing",
    citation: "LITRAS aging model (national); BIA s. 34(2) motions",
    numerator: 23,
    denominator: 412,
    unit: "percent",
    inverted: true,
    status: "breach",
    statusReason: "4 estates are more than 24 months past expected closing with no s. 34(2) motion on file.",
    spreadLabel: "Age distribution past expected closing",
    spread: [
      { label: "0-6 months", numerator: 11, denominator: 23 },
      { label: "6-12 months", numerator: 6, denominator: 23 },
      { label: "12-24 months", numerator: 2, denominator: 23 },
      { label: "24+ months", numerator: 4, denominator: 23 },
    ],
    files: [
      f("Cormier Holdings", "31-2811004", "M. Harris", "Winnipeg", "38 months past expected closing — no s. 34(2) motion", "breach"),
      f("Aluko, T.", "31-2809551", "M. Harris", "Winnipeg", "31 months past expected closing — trust balance unresolved", "breach"),
      f("Brar, S.", "31-2812277", "L. Chen", "Calgary", "27 months — tax clearance outstanding", "breach"),
      f("Ferland, M.", "31-2813900", "L. Chen", "Calgary", "25 months — final dividend not distributed", "breach"),
    ],
  },
  {
    id: "proposal-early-warning",
    label: "Consumer proposals in projected default",
    citation: "LITRAS early-intervention model for consumer proposals",
    numerator: 19,
    denominator: 208,
    unit: "percent",
    inverted: true,
    status: "watch",
    statusReason: "Projection is model output; each file requires human confirmation before contact.",
    aiDerived: true,
    signOff: "pending",
    spreadLabel: "Signal composition",
    spread: [
      { label: "Missed payments (2+)", numerator: 9, denominator: 19 },
      { label: "Projected default only", numerator: 7, denominator: 19 },
      { label: "Third amendment filed", numerator: 3, denominator: 19 },
    ],
    files: [
      f("Iqbal, N.", "35-2904118", "M. Harris", "Winnipeg", "3 missed PAD runs; annulment window opens in 21 days", "breach"),
      f("Ross, K.", "35-2905220", "S. Okafor", "Thunder Bay", "2 missed payments; projected default at month 14", "watch"),
      f("Dubois, C.", "35-2905773", "L. Chen", "Calgary", "Second amendment filed; payment ratio 0.82", "watch"),
    ],
  },
  {
    id: "referral-provenance",
    label: "Files with a documented referral source",
    citation: "DARR; Position Paper (Dec 2023); DAM Updates Aug 2025 / Mar 2026; Form 79",
    numerator: 371,
    denominator: 412,
    unit: "percent",
    status: "watch",
    statusReason: "41 files have unknown source; 6 sit in hold-for-review pending paid-advisor attestation.",
    spreadLabel: "Source mix and concentration",
    spread: [
      { label: "Direct / self-referred", numerator: 188, denominator: 412 },
      { label: "Paid advisor (attested)", numerator: 96, denominator: 412 },
      { label: "Professional referral", numerator: 87, denominator: 412 },
      { label: "Unknown source", numerator: 41, denominator: 412 },
    ],
    files: [
      f("Whitecloud, P.", "31-2918441", "M. Harris", "Winnipeg", "Hold-for-review: paid advisor attestation missing", "breach"),
      f("Okonkwo, B.", "31-2918470", "M. Harris", "Winnipeg", "Hold-for-review: referrer concentration >20% single source", "watch"),
      f("Santos, R.", "35-2906010", "L. Chen", "Calgary", "Unknown source — Form 79 field blank", "watch"),
    ],
    note: "Top referrer concentration: 22% of paid-advisor files from a single firm.",
  },
  {
    id: "counselling",
    label: "Counselling sessions completed within the prescribed window",
    citation: "Directive 1R8; OSB notice on counselling session review",
    numerator: 389,
    denominator: 412,
    unit: "percent",
    status: "watch",
    statusReason: "23 files late; 11 sessions recorded under 45 minutes; all counsellors qualified on record.",
    spreadLabel: "By office",
    spread: [
      { label: "Winnipeg", numerator: 163, denominator: 168 },
      { label: "Regina", numerator: 84, denominator: 92 },
      { label: "Calgary", numerator: 92, denominator: 96 },
      { label: "Thunder Bay", numerator: 50, denominator: 56 },
    ],
    files: [
      f("Beaulieu, A.", "31-2917988", "S. Okafor", "Thunder Bay", "Second session 19 days past window", "breach"),
      f("Grewal, H.", "31-2918102", "M. Harris", "Regina", "Session length recorded 32 minutes", "watch"),
    ],
  },
  {
    id: "surplus-income",
    label: "Files with Form 65 filed and income verified",
    citation: "Surplus Income Directive (redraft pending 2026-27); Form 65",
    numerator: 344,
    denominator: 412,
    unit: "percent",
    status: "watch",
    statusReason: "68 files rely on intake estimates; mean variance to verified income is $310/month.",
    spreadLabel: "Intake estimate vs verified income",
    spread: [
      { label: "Within $100", numerator: 201, denominator: 344 },
      { label: "$100-$400 variance", numerator: 98, denominator: 344 },
      { label: "Over $400 variance", numerator: 45, denominator: 344 },
    ],
    files: [
      f("Tremblay, L.", "31-2917330", "M. Harris", "Winnipeg", "Verified income $912 above intake estimate — adjustment #2", "breach"),
      f("Sanders, M.", "31-2917901", "L. Chen", "Calgary", "No Form 65 on file at day 34", "watch"),
    ],
  },
  {
    id: "deadline-health",
    label: "Statutory clocks in good standing",
    citation: "Deadline engine — BIA and directives, cited per clock",
    numerator: 1189,
    denominator: 1246,
    unit: "percent",
    status: "breach",
    statusReason: "9 clocks breached, including two s. 170 reports past due.",
    spreadLabel: "Clock state",
    spread: [
      { label: "Green", numerator: 1189, denominator: 1246 },
      { label: "Amber", numerator: 48, denominator: 1246 },
      { label: "Breached", numerator: 9, denominator: 1246 },
    ],
    files: [
      f("Cormier Holdings", "31-2811004", "M. Harris", "Winnipeg", "s. 170 report 62 days past due", "breach"),
      f("Aluko, T.", "31-2809551", "M. Harris", "Winnipeg", "s. 170 report 27 days past due", "breach"),
      f("Brar, S.", "31-2812277", "L. Chen", "Calgary", "Final statement of receipts and disbursements overdue", "breach"),
    ],
  },
  {
    id: "trust-reconciliation",
    label: "Trust accounts reconciled for the period",
    citation: "Directive 5R8 / proposed 5R9",
    numerator: 11,
    denominator: 12,
    unit: "percent",
    status: "breach",
    statusReason: "One account carries two unexplained exceptions past the reconciliation date.",
    files: [
      f("Trust — Calgary operating", "TR-004", "L. Chen", "Calgary", "2 exceptions: unidentified deposit $1,240; stale cheque $86", "breach"),
    ],
  },
  {
    id: "consent-ledger",
    label: "Consent ledger complete",
    citation: "PIPEDA; Outsourcing Position Paper; OSB AI Guidance",
    numerator: 397,
    denominator: 412,
    unit: "percent",
    status: "watch",
    statusReason: "15 files missing at least one of: banking consent, outsourcing notice, AI human sign-off.",
    spreadLabel: "Consent type completeness",
    spread: [
      { label: "Banking consent recorded", numerator: 402, denominator: 412 },
      { label: "Outsourcing notice acknowledged", numerator: 405, denominator: 412 },
      { label: "AI-assisted output signed off", numerator: 397, denominator: 412 },
    ],
    files: [
      f("Santos, R.", "35-2906010", "L. Chen", "Calgary", "AI-drafted asset summary without human sign-off", "breach"),
      f("Ross, K.", "35-2905220", "S. Okafor", "Thunder Bay", "Outsourcing notice not acknowledged", "watch"),
    ],
  },
  {
    id: "complaints",
    label: "Complaints received against the firm",
    citation: "Statutory complaints — 41% of 2025-26 complaints were against LITs",
    numerator: 4,
    denominator: 412,
    unit: "percent",
    inverted: true,
    status: "compliant",
    statusReason: "Rate 0.97% below national 0.98%; 1 open past the 10-business-day response target.",
    spreadLabel: "Category and response",
    spread: [
      { label: "Fee / disbursement", numerator: 2, denominator: 4 },
      { label: "Communication", numerator: 1, denominator: 4 },
      { label: "Conduct", numerator: 1, denominator: 4 },
    ],
    files: [
      f("Ferland, M.", "31-2813900", "L. Chen", "Calgary", "Open 14 business days — fee dispute", "breach"),
    ],
  },
  {
    id: "cyber-baseline",
    label: "Cyber baseline controls confirmed",
    citation: "OSB Cybersecurity Notice; directive updates pending",
    numerator: 46,
    denominator: 51,
    unit: "percent",
    status: "watch",
    statusReason: "MFA coverage 96%; two access reviews overdue; data residency confirmed for all stores.",
    spreadLabel: "Control coverage",
    spread: [
      { label: "MFA enrolled", numerator: 49, denominator: 51 },
      { label: "Quarterly access review done", numerator: 44, denominator: 51 },
      { label: "Data residency confirmed", numerator: 51, denominator: 51 },
    ],
    files: [
      f("Access review — Regina", "SEC-014", "M. Harris", "Regina", "Q1 review 22 days overdue", "watch"),
    ],
  },
  {
    id: "provincial-consistency",
    label: "Provincial consistency — best vs worst office",
    citation: "Expanded NMJ supervision model",
    numerator: 96,
    denominator: 100,
    unit: "percent",
    status: "watch",
    statusReason: "Spread of 15 points on first-pass rate between Calgary (96.8%) and Thunder Bay (81.4%).",
    spreadLabel: "First-pass rate by province",
    spread: [
      { label: "Alberta", numerator: 61, denominator: 63 },
      { label: "Manitoba", numerator: 96, denominator: 98 },
      { label: "Saskatchewan", numerator: 74, denominator: 86 },
      { label: "Ontario", numerator: 57, denominator: 70 },
    ],
    files: [
      f("Thunder Bay office", "OFF-004", "S. Okafor", "Thunder Bay", "Worst office on first-pass, counselling timeliness and unknown-source share", "breach"),
    ],
  },
];

export const SECTION_B: PostureMetric[] = [
  {
    id: "intake-funnel",
    label: "Enquiry to engaged conversion",
    numerator: 188,
    denominator: 604,
    unit: "percent",
    status: "neutral",
    statusReason: "Median 11 days enquiry → engaged; consultation no-show rate 18%.",
    spreadLabel: "Funnel stage",
    spread: [
      { label: "Enquiry", numerator: 604, denominator: 604 },
      { label: "Consultation booked", numerator: 402, denominator: 604 },
      { label: "Consultation held", numerator: 329, denominator: 604 },
      { label: "Engaged", numerator: 188, denominator: 604 },
      { label: "Filed", numerator: 171, denominator: 604 },
    ],
    files: [
      f("Channel — paid search", "CH-01", "—", "All", "Cost per filed estate $412", "neutral"),
      f("Channel — professional referral", "CH-02", "—", "All", "Cost per filed estate $118", "neutral"),
      f("Channel — organic", "CH-03", "—", "All", "Cost per filed estate $64", "neutral"),
    ],
  },
  {
    id: "time-to-file",
    label: "Files filed within 30 days of first contact",
    numerator: 118,
    denominator: 171,
    unit: "percent",
    status: "neutral",
    statusReason: "Median 24 days. Stalls concentrate in document collection and income verification.",
    spreadLabel: "Where files stall",
    spread: [
      { label: "Documents outstanding", numerator: 31, denominator: 53 },
      { label: "Income verification", numerator: 14, denominator: 53 },
      { label: "Counselling scheduling", numerator: 8, denominator: 53 },
    ],
    files: [
      f("Sanders, M.", "31-2917901", "L. Chen", "Calgary", "Stalled 19 days — pay stubs outstanding", "watch"),
      f("Santos, R.", "35-2906010", "L. Chen", "Calgary", "Stalled 12 days — manual income verification", "watch"),
    ],
  },
  {
    id: "verification-mode",
    label: "Income verified through bank connection rather than manually",
    numerator: 244,
    denominator: 412,
    unit: "percent",
    status: "neutral",
    statusReason: "Manual verification adds a median 6 days and correlates with SRD income comments.",
    files: [
      f("Manual cohort", "COH-01", "—", "All", "168 files; median 11 days to verify", "neutral"),
      f("Connected cohort", "COH-02", "—", "All", "244 files; median 5 days to verify", "neutral"),
    ],
  },
  {
    id: "filing-readiness",
    label: "Files ready to push to estate software",
    numerator: 74,
    denominator: 96,
    unit: "percent",
    status: "neutral",
    statusReason: "22 blocked. Named missing documents drive the queue.",
    spreadLabel: "Named missing document",
    spread: [
      { label: "Pay stubs (2 recent)", numerator: 9, denominator: 22 },
      { label: "Tax return — prior year", numerator: 6, denominator: 22 },
      { label: "Signed Form 79", numerator: 4, denominator: 22 },
      { label: "Vehicle valuation", numerator: 3, denominator: 22 },
    ],
    files: [
      f("Whitecloud, P.", "31-2918441", "M. Harris", "Winnipeg", "Blocked — signed Form 79", "watch"),
      f("Grewal, H.", "31-2918102", "M. Harris", "Regina", "Blocked — pay stubs", "watch"),
    ],
  },
  {
    id: "capacity",
    label: "Counselling sessions per counsellor per day",
    numerator: 47,
    denominator: 4,
    unit: "count",
    status: "watch",
    statusReason: "Harris runs 12/day; the two offices with the highest session load also carry the late-session findings in Section A.",
    spreadLabel: "Load by person",
    spread: [
      { label: "M. Harris", numerator: 12, denominator: 12 },
      { label: "S. Okafor", numerator: 11, denominator: 12 },
      { label: "L. Chen", numerator: 9, denominator: 12 },
      { label: "R. Adeyemi", numerator: 15, denominator: 12 },
    ],
    files: [
      f("R. Adeyemi", "STF-04", "—", "Regina", "15 sessions/day — above sustainable load, 4 short sessions logged", "breach"),
    ],
  },
  {
    id: "per-file-economics",
    label: "Fee realized against tariff",
    numerator: 91,
    denominator: 100,
    unit: "percent",
    status: "neutral",
    statusReason: "Summary admin realizes 91% of tariff; fixed-fee proposals realize 103% of modelled cost.",
    spreadLabel: "By administration type",
    spread: [
      { label: "Summary administration", numerator: 91, denominator: 100 },
      { label: "Consumer proposal (fixed fee)", numerator: 103, denominator: 100 },
      { label: "Ordinary administration", numerator: 88, denominator: 100 },
    ],
    files: [
      f("Summary cohort", "ECO-01", "—", "All", "Mean levy $412; mean disbursements $187", "neutral"),
    ],
  },
  {
    id: "rework",
    label: "Files requiring rework after first submission",
    numerator: 41,
    denominator: 412,
    unit: "percent",
    inverted: true,
    status: "watch",
    statusReason: "Rework is the cost of the Section A findings: 29 SRD returns, 8 form corrections, 4 debtor re-contacts.",
    spreadLabel: "Rework type",
    spread: [
      { label: "SRD amendment", numerator: 29, denominator: 41 },
      { label: "Form correction", numerator: 8, denominator: 41 },
      { label: "Debtor re-contact", numerator: 4, denominator: 41 },
    ],
    files: [
      f("Doyle, R.", "31-2917440", "M. Harris", "Regina", "2 amendments, 4.5 hours logged", "watch"),
    ],
  },
  {
    id: "discharge",
    label: "Discharges granted on first application",
    numerator: 152,
    denominator: 166,
    unit: "percent",
    status: "neutral",
    statusReason: "14 opposed; median 9 months to discharge; 61 post-discharge re-engagements offered.",
    spreadLabel: "Outcome",
    spread: [
      { label: "Automatic", numerator: 121, denominator: 166 },
      { label: "Granted on hearing", numerator: 31, denominator: 166 },
      { label: "Opposed / adjourned", numerator: 14, denominator: 166 },
    ],
    files: [
      f("Tremblay, L.", "31-2917330", "M. Harris", "Winnipeg", "Opposed — surplus income adjustment", "watch"),
    ],
  },
];

export const SECTION_C: BenchmarkRow[] = [
  {
    id: "filings-growth",
    label: "Filings growth year over year",
    firmValue: 6.2,
    publishedValue: 3.5,
    unit: "percent",
    source: "OSB insolvency statistics, 2025-26",
    betterWhen: "higher",
    asOf: "2026-06-30",
  },
  {
    id: "complaint-rate",
    label: "Complaint rate as a share of insolvencies",
    firmValue: 0.97,
    publishedValue: 0.98,
    unit: "percent",
    source: "OSB complaints reporting, 2025-26",
    betterWhen: "lower",
    asOf: "2026-06-30",
  },
  {
    id: "srd-threshold",
    label: "SRD first-pass rate",
    firmValue: 90.9,
    publishedValue: 0,
    unit: "percent",
    source: "Threshold not yet published — Standards of Practice consultation 2026-27",
    betterWhen: "higher",
    asOf: "2026-06-30",
  },
  {
    id: "aging-threshold",
    label: "Estates past expected closing",
    firmValue: 5.6,
    publishedValue: 0,
    unit: "percent",
    source: "Threshold not yet published — LITRAS aging model",
    betterWhen: "lower",
    asOf: "2026-06-30",
  },
  {
    id: "debtor-mix",
    label: "Consumer proposals as a share of consumer insolvencies",
    firmValue: 50.5,
    publishedValue: 79.8,
    unit: "percent",
    source: "OSB Consumer Debtor Profile",
    betterWhen: "higher",
    asOf: "2026-03-31",
  },
];

export const formatRatio = (m: Pick<PostureMetric, "numerator" | "denominator" | "unit">) => {
  if (m.unit === "count") return `${m.numerator}`;
  if (m.unit === "days") return `${m.numerator} days`;
  if (!m.denominator) return "—";
  return `${((m.numerator / m.denominator) * 100).toFixed(1)}%`;
};
