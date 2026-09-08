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
  /** Overrides the computed headline figure. */
  headline?: string;
  /** Overrides the "numerator / denominator" text entirely. */
  ratioText?: string;
  /** Names the population behind the denominator. */
  population?: string;
  /** Extra line rendered under the headline. */
  secondLine?: string;
  /** True total of underlying files when the list is truncated. */
  totalFiles?: number;
  /** Show a dot on file rows only when that file has a breached clock. */
  fileDotsBreachOnly?: boolean;
  /** Overrides the drill-down sub-header. */
  drilldownHeader?: string;
}

export type BenchmarkBadge = "above" | "below" | "inline" | "context" | "none";

export interface BenchmarkRow {
  id: string;
  label: string;
  firmValue: number;
  publishedValue: number;
  unit: "percent" | "count" | "days";
  source: string;
  betterWhen: "lower" | "higher";
  asOf: string;
  badge: BenchmarkBadge;
  firmDisplay?: string;
  publishedDisplay?: string;
  subtext?: string;
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
    sealedBy: "J. Okonkwo, LIT",
  },
  {
    id: "2026-03-31",
    asOf: "2026-03-31",
    label: "As of 31 March 2026 (fiscal year end)",
    sealedAt: "2026-04-01T09:12:00Z",
    sealedBy: "J. Okonkwo, LIT",
  },
  {
    id: "2025-12-31",
    asOf: "2025-12-31",
    label: "As of 31 December 2025",
    sealedAt: "2026-01-02T10:41:00Z",
    sealedBy: "J. Okonkwo, LIT",
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
    population: "filings submitted",
    status: "watch",
    statusReason: "Below the 95% internal floor at two offices; no OSB threshold published yet.",
    spreadLabel: "By office — spread, not average",
    totalFiles: 29,
    fileDotsBreachOnly: true,
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
    population: "returned filings",
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
    population: "open estates",
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
    population: "consumer proposals",
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
    population: "open estates",
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
    population: "open estates",
    status: "watch",
    statusReason:
      "23 files late; 11 sessions recorded under 45 minutes; all counsellors qualified on record. Firm-set ceiling: 12 sessions/day (configurable in Settings).",
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
    citation: "Directive 11R2-2026, Surplus Income; Form 65. Bankruptcies only.",
    numerator: 170,
    denominator: 204,
    unit: "percent",
    population: "bankruptcies",
    status: "watch",
    statusReason: "34 files rely on intake estimates; mean variance to verified income is $310/month.",
    spreadLabel: "Intake estimate vs verified income",
    spread: [
      { label: "Within $100", numerator: 101, denominator: 170 },
      { label: "$100-$400 variance", numerator: 47, denominator: 170 },
      { label: "Over $400 variance", numerator: 22, denominator: 170 },
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
    population: "statutory clocks",
    secondLine: "57 not in good standing: 54 amber (due within window) · 3 breached",
    status: "breach",
    statusReason: "3 clocks breached, including two s. 170 reports past due.",
    spreadLabel: "Clock state",
    spread: [
      { label: "Green", numerator: 1189, denominator: 1246 },
      { label: "Amber", numerator: 54, denominator: 1246 },
      { label: "Breached", numerator: 3, denominator: 1246 },
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
    population: "trust accounts",
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
    population: "open estates",
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
    population: "estates filed in period",
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
    citation:
      "OSB Cybersecurity Notice (22 Jan 2026): 10 baseline safeguards + breach-reporting procedure",
    numerator: 9,
    denominator: 11,
    unit: "percent",
    headline: "9 / 11 controls",
    ratioText: "",
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
    label: "Office spread — SRD first-pass rate",
    citation:
      "Spread: best office 98.0% (Winnipeg) · worst 81.4% (Thunder Bay) · offices with n ≥ 10 only",
    numerator: 166,
    denominator: 10,
    unit: "percent",
    headline: "16.6 pts",
    ratioText: "",
    status: "watch",
    statusReason: "Spread of 16.6 points on first-pass rate between Winnipeg (98.0%) and Thunder Bay (81.4%).",
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
  {
    id: "advisor-fees-nil",
    label: "Referred files reporting advisor fees as nil or zero",
    citation:
      "Form 79 Q7.1 = yes with fees reported $0 · BIA s. 21, s. 158(d); BIGR s. 45; OSB Winter 2026 DAM Update",
    numerator: 6,
    denominator: 47,
    unit: "percent",
    headline: "12.8%",
    ratioText: "6 / 47",
    status: "breach",
    statusReason: "Six referred files declare a paid advisor but report the fee as nil.",
    files: [
      f("Whitecloud, P.", "31-2918441", "M. Harris", "Winnipeg", "Form 79 Q7.1 = yes, fee reported $0", "breach"),
      f("Santos, R.", "35-2906010", "L. Chen", "Calgary", "Form 79 Q7.1 = yes, fee field blank", "breach"),
    ],
  },
  {
    id: "cp-annulment-cohort",
    label: "Consumer proposal annulment rate — filing cohort vs national",
    citation:
      "Div II proposals filed Q1–Q2 2024, observed 24 months · national baseline 16% (OSB, Phong Su decision fn 2)",
    numerator: 19,
    denominator: 134,
    unit: "percent",
    headline: "14.2%",
    ratioText: "19 / 134",
    status: "neutral",
    statusReason: "Cohort measure. No obligation attaches to this rate; shown for comparison only.",
    files: [
      f("Cohort — Q1 2024", "COH-A", "—", "All", "9 annulments of 68 proposals", "neutral"),
      f("Cohort — Q2 2024", "COH-B", "—", "All", "10 annulments of 66 proposals", "neutral"),
    ],
  },
  {
    id: "referral-source-review",
    label: "Referral sources reviewed and signed off in last 12 months",
    citation: "Code of Ethics Rules 34, 49; OSB Winter 2026 DAM Update",
    numerator: 15,
    denominator: 21,
    unit: "percent",
    headline: "71.4%",
    ratioText: "15 / 21 sources",
    status: "watch",
    statusReason: "Six referral sources have not been reviewed within the last 12 months.",
    files: [
      f("Referral source — Northline Debt Co.", "REF-07", "M. Harris", "Winnipeg", "Last review 19 months ago", "watch"),
      f("Referral source — Prairie Advisors", "REF-12", "L. Chen", "Calgary", "No review on record", "watch"),
    ],
  },
  {
    id: "correspondence-retention",
    label: "Estate correspondence retained 4 years post-discharge",
    citation: "BIA s. 26(1)–(2); Rule 68; Directive 17 ¶5, ¶7(1)",
    numerator: 88,
    denominator: 88,
    unit: "percent",
    headline: "100%",
    ratioText: "88 / 88 discharged estates",
    status: "neutral",
    statusReason: "All discharged estates in scope carry complete retained correspondence.",
    files: [
      f("Retention sweep — 2026 Q1", "RET-01", "—", "All", "88 discharged estates verified", "neutral"),
    ],
  },
];

export const SECTION_B: PostureMetric[] = [
  {
    id: "intake-funnel",
    label: "Intake funnel — enquiry → engaged",
    numerator: 188,
    denominator: 604,
    unit: "percent",
    population: "enquiries",
    secondLine: "604 enquiries → 341 consultations → 188 engaged → 118 filed",
    status: "neutral",
    statusReason: "Median 11 days enquiry → engaged; consultation no-show rate 18%.",
    spreadLabel: "Funnel stage",
    spread: [
      { label: "Enquiry", numerator: 604, denominator: 604 },
      { label: "Consultation booked", numerator: 402, denominator: 604 },
      { label: "Consultation held", numerator: 341, denominator: 604 },
      { label: "Engaged", numerator: 188, denominator: 604 },
      { label: "Filed", numerator: 118, denominator: 604 },
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
    population: "filed estates",
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
    population: "open estates",
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
    population: "files in queue",
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
    headline: "11.8",
    ratioText: "47 sessions / 4 counsellors",
    drilldownHeader: "As of 2026-06-30 · 47 sessions across 4 counsellors · avg 11.8/day",
    status: "watch",
    statusReason:
      "Firm-set ceiling: 12 sessions/day (configurable in Settings). The two offices with the highest session load also carry the late-session findings in Section A.",
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
    citation: "From filed SRDs only; tariff per Canada Gazette Part I (proposed)",
    numerator: 91,
    denominator: 100,
    unit: "percent",
    headline: "91.0%",
    ratioText: "$91,200 / $100,200 tariff cap",
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
    population: "open estates",
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
    population: "discharge applications",
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
    badge: "above",
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
    badge: "inline",
    subtext: "4 complaints — difference is within sampling noise",
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
    badge: "none",
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
    badge: "none",
  },
  {
    id: "debtor-mix",
    label: "Consumer proposals as a share of consumer insolvencies",
    firmValue: 62.1,
    publishedValue: 79.8,
    unit: "percent",
    source: "OSB insolvency statistics, 2025 · verify before release",
    betterWhen: "higher",
    asOf: "2026-03-31",
    badge: "below",
    firmDisplay: "62.1% of estates filed Q1 2026-27",
  },
  {
    id: "darr-major-cases",
    label: "DARR reviews referred to Major Cases",
    firmValue: 0,
    publishedValue: 0,
    unit: "count",
    source: "OSB Winter 2026 DAM Update",
    betterWhen: "lower",
    asOf: "2026-06-30",
    badge: "context",
    firmDisplay: "—",
    publishedDisplay: "11 firms / 30+ LITs / 100%",
  },
  {
    id: "advisor-advice-monthly",
    label: "Estates reporting advisor advice (monthly)",
    firmValue: 4.1,
    publishedValue: 7.1,
    unit: "percent",
    source: "OSB Winter 2026 DAM Update",
    betterWhen: "higher",
    asOf: "2026-06-30",
    badge: "below",
    publishedDisplay: "7.1% (Dec 2025)",
  },
  {
    id: "conduct-investigations",
    label: "LITs under Professional Conduct Investigation",
    firmValue: 0,
    publishedValue: 0,
    unit: "count",
    source: "OSB Annual Report 2025-26, 31 Mar 2026",
    betterWhen: "lower",
    asOf: "2026-03-31",
    badge: "context",
    firmDisplay: "0",
    publishedDisplay: "58 individual / 20 corporate",
  },
  {
    id: "ai-examinations",
    label: "AI-assisted debtor examinations → court intervention",
    firmValue: 0,
    publishedValue: 75.4,
    unit: "percent",
    source: "OSB Annual Report 2025-26",
    betterWhen: "lower",
    asOf: "2026-03-31",
    badge: "context",
    firmDisplay: "—",
    publishedDisplay: "75.4%",
  },
  {
    id: "cp-annulment-benchmark",
    label: "Consumer proposal annulment rate",
    firmValue: 14.2,
    publishedValue: 16,
    unit: "percent",
    source: "OSB, Phong Su decision (2020–21 baseline)",
    betterWhen: "lower",
    asOf: "2026-06-30",
    badge: "below",
  },
];

export const formatRatio = (m: Pick<PostureMetric, "numerator" | "denominator" | "unit" | "headline">) => {
  if (m.headline) return m.headline;
  if (m.unit === "count") return `${m.numerator}`;
  if (m.unit === "days") return `${m.numerator} days`;
  if (!m.denominator) return "—";
  return `${((m.numerator / m.denominator) * 100).toFixed(1)}%`;
};

export const ratioDetail = (m: PostureMetric) => {
  if (m.ratioText !== undefined) return m.ratioText;
  return `${m.numerator} / ${m.denominator}${m.population ? ` ${m.population}` : ""}`;
};
