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
      { id: "record", label: "Estate Record", description: "Debtor identity and estate classification." },
      { id: "statutory", label: "Statutory Information", description: "OSB, court and filing identifiers." },
      { id: "dates", label: "Significant Dates", description: "Canonical statutory date register with provenance." },
      { id: "additional", label: "Additional Info", description: "Dependants, prior insolvencies and related records." },
    ],
  },
  {
    id: "office",
    label: "Office & Team",
    pages: [
      { id: "office", label: "Office", description: "Administering office for this estate." },
      { id: "trustee", label: "Trustee", description: "Licensed insolvency trustee of record." },
      { id: "manager", label: "Office Manager", description: "Operational oversight for this estate." },
      { id: "administrator", label: "Administrator", description: "Day-to-day estate administrator." },
      { id: "counsellor", label: "Counsellor", description: "BIA s.157.1 counselling assignment." },
      { id: "staff", label: "Other Staff", description: "Additional people with a role on this estate." },
      { id: "history", label: "Assignment History", description: "Immutable record of every responsibility change." },
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
      { id: "income", label: "Income & Expenses", description: "Form 65 monthly income and expense administration." },
      { id: "assets", label: "Assets", description: "Realization values, costs and ranked security interests." },
      { id: "trust", label: "Trust Accounting", description: "Banking, receipts, disbursements and reconciliation." },
      { id: "tax", label: "Tax", description: "Return tracking and refund administration." },
      { id: "distributions", label: "Distributions", description: "Dividend eligibility derived from admitted claims." },
    ],
  },
  {
    id: "creditors",
    label: "Creditors",
    pages: [
      { id: "overview", label: "Overview", description: "Claim position and variance across the register." },
      { id: "register", label: "Register", description: "Master creditor identities and estate claim data." },
      { id: "claims", label: "Claims & Proofs", description: "Proofs of claim, admitted amounts and status." },
      { id: "meetings", label: "Meetings & Voting", description: "Meeting records and voting thresholds." },
      { id: "distributions", label: "Distributions", description: "Dividends payable to admitted creditors." },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    pages: [
      { id: "all", label: "All Documents", description: "Every document supporting estate values." },
      { id: "required", label: "Required Documents", description: "Outstanding statutory document requirements." },
      { id: "forms", label: "Forms", description: "Compliance-gated OSB form catalogue." },
      { id: "generated", label: "Generated Documents", description: "Forms generated or filed for this estate." },
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
      { id: "deadlines", label: "Deadlines", description: "Statutory dates and their dependent obligations." },
      { id: "discharge", label: "Discharge / s.170", description: "Section 170 report and discharge position." },
      { id: "audit", label: "Audit Trail", description: "Human and SAFA action history." },
    ],
  },
];

export const getModule = (id: string) => ESTATE_MODULES.find((m) => m.id === id) ?? ESTATE_MODULES[0];

export const getPage = (moduleId: string, pageId: string) => {
  const mod = getModule(moduleId);
  return mod.pages.find((p) => p.id === pageId) ?? mod.pages[0];
};