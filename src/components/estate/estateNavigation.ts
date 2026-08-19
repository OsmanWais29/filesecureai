// Two-level estate information architecture.
// Level 1 = operating modules. Level 2 = the subpages belonging to the module.

export interface EstateSubPage {
  id: string;
  label: string;
}

export interface EstateModule {
  id: string;
  label: string;
  /** Heading + description used by the page header of each subpage. */
  pages: (EstateSubPage & { description?: string })[];
}

export const ESTATE_MODULES: EstateModule[] = [
  {
    id: "overview",
    label: "Overview",
    pages: [{ id: "overview", label: "Overview", description: "Estate health, signals and current position." }],
  },
  {
    id: "record",
    label: "Estate Record",
    pages: [
      { id: "details", label: "Details", description: "Classification and the anchor dates the rules engine depends on." },
      { id: "client", label: "Client / Debtor", description: "Debtor identity, contact details and statutory information." },
      { id: "history", label: "Insolvency History", description: "Prior proceedings recorded as structured records." },
      { id: "conduct", label: "Conduct", description: "Cause of insolvency and conduct matters for trustee review." },
      { id: "communications", label: "Communications", description: "Structured contact log with follow-ups." },
      { id: "court", label: "Court & Jurisdiction", description: "Court, division, district and OSB identifiers." },
    ],
  },
  {
    id: "office",
    label: "Office & Team",
    pages: [
      { id: "team", label: "Team", description: "Everyone responsible for this estate and their open work." },
      { id: "assignments", label: "Assignments", description: "Assign or reassign responsibility for each estate role." },
      { id: "history", label: "History", description: "Immutable record of every responsibility change." },
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    pages: [
      { id: "summary", label: "Summary", description: "Stage progress and outstanding blockers." },
      { id: "tasks", label: "Tasks", description: "Estate notes, follow-ups and reminders." },
      { id: "deadlines", label: "Deadlines", description: "Statutory dates driving the milestone engine." },
      { id: "milestones", label: "Milestones", description: "Milestone register by administration stage." },
      { id: "counselling", label: "Counselling", description: "BIA s.157.1 sessions and certificates." },
      { id: "closing", label: "Closing", description: "Gated closing checklist and final trust position." },
    ],
  },
  {
    id: "financials",
    label: "Financials",
    pages: [
      { id: "summary", label: "Summary", description: "Trust position, realization and surplus at a glance." },
      { id: "income", label: "Income & Surplus", description: "Income register, Form 65 periods and surplus calculation." },
      { id: "payments", label: "Payments", description: "Payment obligations, schedules and arrears." },
      { id: "assets", label: "Assets", description: "Realization values, costs and ranked security interests." },
      { id: "trust", label: "Trust Accounting", description: "Banking, receipts, disbursements and reconciliation." },
      { id: "tax", label: "Tax", description: "Return tracking and refund administration." },
    ],
  },
  {
    id: "creditors",
    label: "Creditors",
    pages: [
      { id: "overview", label: "Overview", description: "Claim position and variance across the register." },
      { id: "register", label: "Register", description: "Master creditor identities and estate claim data." },
      { id: "claims", label: "Claims", description: "Disclosed versus filed amounts and admission decisions." },
      { id: "proofs", label: "Proofs", description: "Proof of claim receipt, evidence and validation state." },
      { id: "meetings", label: "Meetings & Voting", description: "Meeting records and voting thresholds." },
      { id: "distributions", label: "Distributions", description: "Dividends payable to admitted creditors." },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    pages: [
      { id: "all", label: "All Documents", description: "Every document supporting estate values." },
      { id: "required", label: "Required", description: "Outstanding statutory document requirements." },
      { id: "forms", label: "Forms", description: "Compliance-gated OSB form catalogue." },
      { id: "generated", label: "Generated", description: "Forms generated or filed for this estate." },
      { id: "versions", label: "Versions", description: "Version and extraction history per document." },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    pages: [
      { id: "overview", label: "Overview", description: "Deterministic compliance score for this estate." },
      { id: "requirements", label: "Requirements", description: "Every rule evaluated against the estate record." },
      { id: "exceptions", label: "Exceptions", description: "Failing and at-risk rules requiring action." },
      { id: "audit", label: "Audit Trail", description: "Human and SAFA action history." },
    ],
  },
];

export const getModule = (id: string) => ESTATE_MODULES.find((m) => m.id === id) ?? ESTATE_MODULES[0];

export const getPage = (moduleId: string, pageId: string) => {
  const mod = getModule(moduleId);
  return mod.pages.find((p) => p.id === pageId) ?? mod.pages[0];
};