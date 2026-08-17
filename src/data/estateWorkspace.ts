// Presentation-layer sample data for the Estate Workspace.
// Replace with ledger-of-record queries as backend tiers land.

export interface EstateSummary {
  id: string;
  debtorName: string;
  estateNumber: string;
  proceeding: string;
  division: string;
  status: string;
  trustee: string;
  administrator: string;
  office: string;
  osbStatus: "in_good_standing" | "attention" | "blocked";
  openIssues: number;
  nextDeadline: string;
  stage: string;
  stageProgress: number;
  osbReadiness: number;
}

export const estates: EstateSummary[] = [
  {
    id: "33-123456",
    debtorName: "John Smith",
    estateNumber: "33-123456",
    proceeding: "Consumer Proposal",
    division: "Division II",
    status: "Active",
    trustee: "Jane Doe",
    administrator: "Mark Lee",
    office: "Ottawa Office",
    osbStatus: "in_good_standing",
    openIssues: 3,
    nextDeadline: "Aug 24 — creditor review deadline",
    stage: "Creditor Administration",
    stageProgress: 72,
    osbReadiness: 92,
  },
  {
    id: "33-123457",
    debtorName: "ABC Corp Ltd.",
    estateNumber: "33-123457",
    proceeding: "Bankruptcy",
    division: "Division I",
    status: "In Realization",
    trustee: "Jane Doe",
    administrator: "Sarah Lee",
    office: "Ottawa Office",
    osbStatus: "attention",
    openIssues: 5,
    nextDeadline: "Sep 02 — asset realization report",
    stage: "Asset Realization",
    stageProgress: 48,
    osbReadiness: 78,
  },
  {
    id: "33-123458",
    debtorName: "Sarah Johnson",
    estateNumber: "33-123458",
    proceeding: "Consumer Proposal",
    division: "Division II",
    status: "Active",
    trustee: "Michael Brown",
    administrator: "Mark Lee",
    office: "Toronto Office",
    osbStatus: "in_good_standing",
    openIssues: 0,
    nextDeadline: "Aug 30 — first counselling",
    stage: "Administration",
    stageProgress: 60,
    osbReadiness: 96,
  },
];

export const getEstate = (id?: string) =>
  estates.find((e) => e.id === id) ?? estates[0];

export type SignalLevel = "insight" | "warning" | "exception" | "critical";

export interface EstateSignal {
  id: string;
  level: SignalLevel;
  title: string;
  detail: string;
  source: string;
}

export const signals: EstateSignal[] = [
  { id: "s1", level: "exception", title: "Missing July income statement", detail: "Form 65 schedule requires a July statement before the statutory review.", source: "Rule Engine · BIA s.68" },
  { id: "s2", level: "warning", title: "CRA claim differs by $4,820", detail: "Filed claim exceeds debtor disclosure in the Statement of Affairs.", source: "SAFA extraction · Form 31" },
  { id: "s3", level: "warning", title: "July bank reconciliation outstanding", detail: "One unmatched $900 deposit blocks the July reconciliation.", source: "Rule Engine · Trust accounting" },
  { id: "s4", level: "insight", title: "Documents arriving 3 days late on average", detail: "Portfolio trend — routed to analytics only, no action required.", source: "SAFA observation" },
];

export const trustPosition = [
  { label: "Bank Balance", value: "$14,280" },
  { label: "Outstanding Deposits", value: "$1,200" },
  { label: "Outstanding Payments", value: "$350" },
  { label: "Adjusted Trust Balance", value: "$15,130", emphasis: true },
];

export const creditorPosition = [
  { label: "SOA Claims", value: "$82,400" },
  { label: "Filed Claims", value: "$91,300" },
  { label: "Admitted", value: "$78,600" },
  { label: "Unresolved", value: "3", emphasis: true },
];

export const estateWork = [
  { label: "Documents", value: "86" },
  { label: "Open Tasks", value: "7" },
  { label: "Upcoming Deadlines", value: "4" },
  { label: "Forms Ready", value: "2" },
];

export interface TimelineEvent {
  id: string;
  label: string;
  date: string;
  state: "done" | "current" | "pending";
  source?: string;
  enteredBy?: string;
  confirmedBy?: string;
  dependencies?: string[];
}

export const timeline: TimelineEvent[] = [
  { id: "t1", label: "Initial Consultation", date: "May 3", state: "done", source: "Intake record", enteredBy: "Mark Lee", confirmedBy: "Mark Lee" },
  { id: "t2", label: "Application Signed", date: "May 10", state: "done", source: "Application package", enteredBy: "SAFA extraction", confirmedBy: "Nancy McJones" },
  { id: "t3", label: "Insolvency Date", date: "May 12", state: "done", source: "Form 1 · Page 2", enteredBy: "SAFA extraction", confirmedBy: "Nancy McJones", dependencies: ["First counselling", "Deemed approval", "Form 65 schedule", "Discharge review"] },
  { id: "t4", label: "Filing Completed", date: "May 12", state: "done", source: "OSB filing receipt", enteredBy: "System", confirmedBy: "Jane Doe" },
  { id: "t5", label: "Creditor Notices Sent", date: "May 14", state: "done", source: "Form 67 batch", enteredBy: "System" },
  { id: "t6", label: "Claims Period", date: "Current", state: "current", source: "Rule Engine", dependencies: ["Claims review", "Voting"] },
  { id: "t7", label: "First Counselling", date: "Aug 21", state: "pending", source: "Rule Engine · derived from insolvency date" },
  { id: "t8", label: "Review", date: "Jan 12", state: "pending", source: "Rule Engine" },
  { id: "t9", label: "Discharge", date: "Pending", state: "pending", source: "Rule Engine" },
];

export interface WorkflowStage {
  name: string;
  steps: { label: string; state: "done" | "current" | "pending"; note?: string }[];
}

export const workflow: WorkflowStage[] = [
  { name: "Intake", steps: [
    { label: "Assessment", state: "done" },
    { label: "Estate created", state: "done" },
    { label: "Required documents", state: "done" },
  ]},
  { name: "Filing", steps: [
    { label: "Application prepared", state: "done" },
    { label: "Trustee approval", state: "done" },
    { label: "Filed", state: "done" },
  ]},
  { name: "Creditors", steps: [
    { label: "Notices", state: "done" },
    { label: "Claims review", state: "current", note: "12 / 14" },
    { label: "Meeting if required", state: "pending" },
  ]},
  { name: "Administration", steps: [
    { label: "Payments", state: "pending" },
    { label: "Counselling", state: "pending" },
    { label: "Income review", state: "pending" },
  ]},
  { name: "Discharge", steps: [
    { label: "Form 82", state: "pending" },
    { label: "Discharge review", state: "pending" },
  ]},
  { name: "Closing", steps: [
    { label: "Final R&D", state: "pending" },
    { label: "Reconciliation", state: "pending" },
    { label: "Close trust account", state: "pending" },
  ]},
];

export const bankAccount = {
  name: "RBC Estate Trust Account",
  masked: "****2331",
  statementBalance: "$18,420",
  ledgerBalance: "$18,070",
  outstandingDeposits: "+$800",
  outstandingPayments: "-$450",
  adjustedBalance: "$18,420",
  reconciledThrough: "July 31",
};

export const receipts = [
  { id: "R-10282", payer: "John Smith", total: 1000, allocations: [
    { label: "Surplus Income", amount: 400 },
    { label: "Proposal Payment", amount: 500 },
    { label: "Asset Repurchase", amount: 100 },
  ]},
  { id: "R-10283", payer: "John Smith", total: 900, allocations: [] },
];

export const reconciliation = {
  period: "July",
  imported: 41,
  matched: 37,
  review: 3,
  unmatched: 1,
  rows: [
    { bank: "$1,000 John Smith", match: "$1,000 Receipt R102", state: "matched" as const },
    { bank: "$250 CRA", match: "$250 Disbursement D14", state: "matched" as const },
    { bank: "$900 Deposit", match: "No matching receipt", state: "unmatched" as const },
  ],
  difference: "$900",
};

export const padBatch = {
  month: "August",
  debtors: 124,
  total: "$48,320",
  validMandates: 121,
  missingAuthorization: 3,
  banks: ["RBC", "TD", "BMO", "Scotiabank"],
};

export interface CreditorRow {
  id: string;
  name: string;
  priority: "Secured" | "Preferred" | "Unsecured";
  soa: number;
  filed: number;
  admitted: number;
  voting: number;
  dividend: number;
  evidence: string[];
  note?: string;
}

export const creditors: CreditorRow[] = [
  { id: "c1", name: "CRA", priority: "Unsecured", soa: 14000, filed: 18820, admitted: 18820, voting: 18820, dividend: 18820, evidence: ["Form 31 — $18,820", "Statement of Affairs — $14,000"], note: "Filed claim exceeds debtor disclosure by $4,820." },
  { id: "c2", name: "RBC Auto Finance", priority: "Secured", soa: 31000, filed: 31000, admitted: 31000, voting: 0, dividend: 0, evidence: ["Security agreement", "PPSA search"] },
  { id: "c3", name: "Capital One", priority: "Unsecured", soa: 8400, filed: 8400, admitted: 8400, voting: 8400, dividend: 8400, evidence: ["Form 31"] },
];

export const assets = [
  {
    id: "a1",
    name: "2022 Ford F-150",
    estimated: 48000,
    realizable: 42000,
    sellingCosts: 2000,
    security: [
      { rank: 1, creditor: "RBC Auto Finance", amount: 31000 },
      { rank: 2, creditor: "ABC Financing", amount: 4000 },
    ],
    net: 5000,
  },
  {
    id: "a2",
    name: "TFSA — Wealthsimple",
    estimated: 6200,
    realizable: 6200,
    sellingCosts: 0,
    security: [],
    net: 6200,
  },
];

export const documents = [
  { id: "d1", name: "CRA Proof of Claim.pdf", type: "Form 31", received: "Aug 12", creditor: "CRA", extraction: "Complete", evidenceFor: ["Claim amount", "Claim type", "CRA account number", "Creditor address"], hash: "Verified" },
  { id: "d2", name: "Statement of Affairs.pdf", type: "Form 79", received: "May 10", creditor: "—", extraction: "Complete", evidenceFor: ["SOA claim totals", "Asset list"], hash: "Verified" },
  { id: "d3", name: "July Bank Statement.pdf", type: "Banking", received: "Aug 03", creditor: "—", extraction: "Complete", evidenceFor: ["Reconciliation"], hash: "Verified" },
];

export const forms = [
  { id: "f1", number: "Form 47", title: "Consumer Proposal", status: "Filed", validation: "Passed" },
  { id: "f2", number: "Form 65", title: "Monthly Income & Expense", status: "Missing — July", validation: "Blocked" },
  { id: "f3", number: "Form 31", title: "Proof of Claim (CRA)", status: "Received", validation: "Variance" },
  { id: "f4", number: "Form 82", title: "Discharge Report", status: "Draft", validation: "Pending" },
];

export const incomePeriods = [
  { period: "May", income: 4200, expenses: 3300, surplus: 900, status: "Received" },
  { period: "June", income: 4310, expenses: 3400, surplus: 910, status: "Received" },
  { period: "July", income: 0, expenses: 0, surplus: 0, status: "Missing" },
];

export const communications = [
  { id: "m1", date: "Aug 12", channel: "Email", subject: "Form 31 acknowledged", party: "CRA", address: "collections@cra-arc.gc.ca" },
  { id: "m2", date: "Jul 28", channel: "Letter", subject: "Form 67 notice to creditors", party: "All creditors", address: "Address snapshot at send time" },
  { id: "m3", date: "Jul 14", channel: "Call", subject: "Missing July paystubs", party: "John Smith", address: "613-555-0134" },
];

export const compliance = [
  { id: "cp1", state: "pass", rule: "Estate identity complete", source: "OSB Directive 1R", due: "—" },
  { id: "cp2", state: "pass", rule: "Significant dates recorded", source: "BIA s.66.13", due: "—" },
  { id: "cp3", state: "pass", rule: "Creditor notices issued", source: "BIA s.66.15", due: "May 22" },
  { id: "cp4", state: "warn", rule: "Form 65 missing — July", source: "BIA s.68 · Directive 11R2", due: "Aug 24" },
  { id: "cp5", state: "warn", rule: "Trust account reconciliation due", source: "Directive 5R", due: "Aug 20" },
  { id: "cp6", state: "fail", rule: "Required discharge review incomplete", source: "BIA s.170", due: "Jan 12" },
];

export const activity = [
  { id: "ac1", at: "Aug 12 · 14:22", actor: "SAFA", action: "Extracted claim amount $18,820 from CRA Proof of Claim.pdf" },
  { id: "ac2", at: "Aug 12 · 14:22", actor: "Rule Engine", action: "Raised claim variance exception (+$4,820 vs SOA)" },
  { id: "ac3", at: "Aug 11 · 09:05", actor: "Mark Lee", action: "Recorded receipt R-10282 with three allocations" },
  { id: "ac4", at: "Aug 03 · 16:40", actor: "System", action: "Imported July bank statement — 41 transactions" },
];

export const safaMessages: Record<string, string> = {
  overview: "Estate health is 72% through Creditor Administration. Three items require attention before the August 24 review.",
  timeline: "The insolvency date of May 12 drives first counselling, deemed approval, the Form 65 schedule and discharge review.",
  workflow: "Claims review is at 12 of 14. Two CRA-related claims are blocked on variance resolution.",
  financials: "July reconciliation contains one unmatched $900 deposit.",
  creditors: "CRA's filed claim is $4,820 higher than the amount disclosed in the SOA.",
  assets: "RBC Auto Finance holds first-ranking security over the 2022 Ford F-150; net realizable value is $5,000.",
  documents: "The uploaded Form 31 appears to belong to CRA and matches creditor account 348920.",
  forms: "Form 65 for July is missing and blocks the statutory income review.",
  income: "July income statement has not been received; surplus income cannot be recalculated.",
  communications: "Form 67 notices used the CRA address on file at the time of sending; that snapshot is preserved.",
  compliance: "Two warnings and one failed rule are open. Discharge review is the only blocker for closing.",
  activity: "All estate changes are hash-chained; the last SAFA action was a claim extraction on Aug 12.",
};
