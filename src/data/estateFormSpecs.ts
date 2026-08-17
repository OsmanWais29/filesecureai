import type { SectionSpec, RecordValues } from "@/components/estate/forms/RecordForm";

// ---------------------------------------------------------------------------
// Controlled vocabularies
// ---------------------------------------------------------------------------
export const OPTIONS = {
  estateStatus: ["Open", "Active", "In Realization", "In Distribution", "Discharged", "Annulled", "Closed"],
  fileStatus: ["Intake", "Pre-filing", "Filed", "Administration", "Discharge pending", "Closing", "Archived"],
  estateType: ["Consumer", "Corporate"],
  proceedingType: ["Bankruptcy", "Consumer Proposal", "Division I Proposal", "Receivership", "CCAA"],
  administrationType: ["Summary", "Ordinary"],
  maritalStatus: ["Single", "Married", "Common-law", "Separated", "Divorced", "Widowed"],
  language: ["English", "French"],
  gender: ["Female", "Male", "Non-binary", "Prefer not to say"],
  office: ["Ottawa Office", "Toronto Office", "Montréal Office"],
  staff: ["Jane Doe", "Michael Brown", "Mark Lee", "Sarah Lee", "Nancy McJones"],
  court: ["Ontario Superior Court of Justice", "Court of Queen's Bench", "Superior Court of Québec"],
  division: ["Division I", "Division II"],
  accountType: ["Trust", "Operating", "Savings"],
  currency: ["CAD", "USD"],
  bankExport: ["BAI2", "OFX", "CSV", "MT940"],
  paymentMethod: ["Cash", "Cheque", "EFT", "PAD", "Interac e-Transfer", "Credit card", "Money order"],
  allocationAccount: ["Surplus Income", "Proposal Payment", "Asset Repurchase", "Counselling Fee", "Suspense / Unallocated"],
  disbursementType: ["Counselling", "Administrative disbursement", "OSB levy", "OR fee", "Court fee", "Interim draw", "Trustee fee", "Legal fee"],
  taxTreatment: ["GST/HST taxable", "Exempt", "Zero-rated"],
  scheduleType: ["Surplus income", "Proposal payments", "Asset repurchase", "Voluntary payment"],
  periodType: ["Weekly", "Bi-weekly", "Semi-monthly", "Monthly", "Quarterly"],
  creditorType: ["Unsecured", "Secured", "Preferred"],
  claimStatus: ["Admitted", "Contingent", "Disallowed", "Not proved", "Secured asset released", "Withdrawn"],
  claimClass: ["Class A", "Class B", "Class C"],
  province: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
  country: ["Canada", "United States", "Other"],
  assetType: ["Real property", "Vehicle", "Registered savings", "Non-registered investment", "Household goods", "Tax refund", "Receivable", "Other"],
  disposition: ["Sold", "Surrendered", "Redeemed by debtor", "Released to secured creditor", "Exempt", "Abandoned"],
  exemptionStatus: ["Fully exempt", "Partially exempt", "Not exempt"],
  taxReturnType: ["Pre-bankruptcy", "In-bankruptcy", "Post-bankruptcy", "Prior year", "Final"],
  taxJurisdiction: ["Federal", "Québec (Revenu Québec)"],
  taxStatus: ["Not started", "Information requested", "In preparation", "Filed", "Assessed", "Completed"],
  requiredDocType: ["T4", "T4A", "T5", "T5007", "RL-1", "Notice of Assessment", "Paystub", "Bank statement"],
  dischargeType: ["Automatic", "Conditional", "Suspended", "Absolute by court", "Refused", "Deemed"],
  counsellingSession: ["First session (Stage 1)", "Second session (Stage 2)"],
  causeOfBankruptcy: [
    "Loss of income / unemployment",
    "Marital or relationship breakdown",
    "Medical reasons / illness",
    "Business failure",
    "Excessive use of credit",
    "Tax liabilities",
    "Garnishee / legal action",
    "Gambling",
    "Supporting others",
    "Other",
  ],
  milestoneSeverity: ["Informational", "Warning", "Exception", "Critical"],
  reconciliationStatus: ["Draft", "In review", "Approved", "Reopened"],
  closingStatus: ["Blocked", "Ready", "Closed"],
  yesNo: ["Yes", "No"],
};

const sel = (key: string, label: string, options: string[], extra: Partial<SectionSpec["fields"][number]> = {}) => ({
  key,
  label,
  type: "select" as const,
  options,
  ...extra,
});

// ---------------------------------------------------------------------------
// Estate record
// ---------------------------------------------------------------------------
export const estateClassificationSection: SectionSpec = {
  title: "Classification",
  description: "Statutory estate status is tracked separately from the firm's internal file status.",
  fields: [
    sel("estateType", "Estate Type", OPTIONS.estateType),
    sel("proceedingType", "Proceeding Type", OPTIONS.proceedingType),
    sel("administrationType", "Administration Type", OPTIONS.administrationType),
    { key: "osbEstateNumber", label: "OSB Estate Number" },
    sel("estateStatus", "Estate Status (statutory)", OPTIONS.estateStatus),
    sel("fileStatus", "Internal File Status", OPTIONS.fileStatus),
    { key: "fileName", label: "File Name", span: 2 },
    { key: "eFileEnabled", label: "E-File enabled", type: "checkbox" },
  ],
};

export const consumerIdentitySection: SectionSpec = {
  title: "Consumer Identity",
  fields: [
    { key: "firstName", label: "First Name" },
    { key: "middleName", label: "Middle Name" },
    { key: "lastName", label: "Last Name" },
    { key: "aka", label: "AKA / Also Known As", span: 2 },
    { key: "jointFiling", label: "Filing jointly", type: "checkbox" },
  ],
};

export const corporateIdentitySection: SectionSpec = {
  title: "Corporate Identity",
  fields: [
    { key: "corporateName", label: "Corporate Name", span: 2 },
    { key: "operatingAs", label: "Operating As" },
    { key: "businessNumber", label: "Business Number" },
    { key: "federalCharterNumber", label: "Federal Charter Number" },
    { key: "incorporationDate", label: "Incorporation Date", type: "date" },
    { key: "incorporationPlace", label: "Incorporation Place" },
    { key: "natureOfBusiness", label: "Nature of Business" },
    { key: "dateStarted", label: "Date Started", type: "date" },
  ],
};

export const estateDatesSection: SectionSpec = {
  title: "Important Dates",
  fields: [
    { key: "signupDate", label: "Signup Date", type: "date", provenance: "Manual" },
    { key: "initialContactDate", label: "Initial Contact Date", type: "date", provenance: "Manual" },
    { key: "appointmentDate", label: "Appointment Date", type: "date", provenance: "Manual" },
    { key: "insolvencyDate", label: "Insolvency Date", type: "date", provenance: "SAFA · Form 1 p.2" },
  ],
};

export const estateResponsibilitySection: SectionSpec = {
  title: "Responsibility",
  description: "Assignments are effective-dated so reassignment preserves history.",
  fields: [
    sel("trusteeOffice", "Trustee Office", OPTIONS.office),
    { key: "serviceLocation", label: "Service Location" },
    { key: "processingCentre", label: "Processing Centre" },
    { key: "localOR", label: "Local OR" },
    sel("trustee", "Trustee / Administrator", OPTIONS.staff),
    sel("estateAdministrator", "Estate Administrator", OPTIONS.staff),
    sel("technician", "Technician", OPTIONS.staff),
    sel("initialInterviewer", "Initial Interviewer", OPTIONS.staff),
    sel("officeManager", "Office Manager", OPTIONS.staff),
    { key: "effectiveFrom", label: "Effective From", type: "date" },
    { key: "effectiveTo", label: "Effective To", type: "date" },
    { key: "reassignmentReason", label: "Reassignment Reason", span: 3, type: "textarea" },
  ],
};

export const estateCourtSection: SectionSpec = {
  title: "Court",
  fields: [
    sel("courtName", "Court Name", OPTIONS.court, { span: 2 }),
    { key: "courtNumber", label: "Court Number" },
    sel("division", "Division", OPTIONS.division),
    { key: "divisionNumber", label: "Division Number" },
    { key: "district", label: "District" },
  ],
};

export const estateContactSection: SectionSpec = {
  title: "Contact & Preferences",
  fields: [
    { key: "homePhone", label: "Home Phone" },
    { key: "workPhone", label: "Work Phone" },
    { key: "cellPhone", label: "Cell Phone" },
    sel("language", "Language Preference", OPTIONS.language),
    sel("maritalStatus", "Marital Status", OPTIONS.maritalStatus),
  ],
};

export const estateArchiveSection: SectionSpec = {
  title: "Archival",
  fields: [
    { key: "archiveBoxNumber", label: "Archives Box Number" },
    { key: "archiveSentDate", label: "Date Sent to Archives", type: "date" },
  ],
};

export const statutoryInformationSections: SectionSpec[] = [
  {
    title: "Debtor Statutory Information",
    fields: [
      { key: "sin", label: "SIN", hint: "Masked in list views" },
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      sel("gender", "Gender", OPTIONS.gender),
      sel("gstRefundChoice", "GST refund retained by estate", OPTIONS.yesNo),
      { key: "pstExempt", label: "PST exempt", type: "checkbox" },
      { key: "gstExempt", label: "GST exempt", type: "checkbox" },
      { key: "hstExempt", label: "HST exempt", type: "checkbox" },
      { key: "householdAdults", label: "Household Adults", type: "number" },
      { key: "householdMinors", label: "Household Minors", type: "number" },
    ],
  },
  {
    title: "Cause of Bankruptcy",
    description: "Controlled vocabulary plus the free-text detail used in the s.170 report.",
    fields: [
      sel("primaryCause", "Primary Cause", OPTIONS.causeOfBankruptcy, { span: 2 }),
      sel("secondaryCause", "Secondary Cause", OPTIONS.causeOfBankruptcy),
      { key: "causeDetails", label: "170 Details", type: "textarea", span: 3 },
    ],
  },
];

export const estateRecordDefaults: RecordValues = {
  estateType: "Consumer",
  proceedingType: "Consumer Proposal",
  administrationType: "Summary",
  osbEstateNumber: "33-123456",
  estateStatus: "Active",
  fileStatus: "Administration",
  fileName: "Smith, John",
  eFileEnabled: true,
  firstName: "John",
  lastName: "Smith",
  signupDate: "2026-05-02",
  insolvencyDate: "2026-05-12",
  initialContactDate: "2026-04-28",
  appointmentDate: "2026-05-03",
  trusteeOffice: "Ottawa Office",
  trustee: "Jane Doe",
  estateAdministrator: "Mark Lee",
  division: "Division II",
  language: "English",
  maritalStatus: "Married",
};

// ---------------------------------------------------------------------------
// Significant dates register
// ---------------------------------------------------------------------------
export interface StatutoryDate {
  key: string;
  group: string;
  label: string;
  value: string;
  type?: "date" | "time";
  source: "Manual" | "Imported" | "SAFA extraction" | "Rule engine";
  document?: string;
  page?: string;
  confirmedBy?: string;
}

export const statutoryDates: StatutoryDate[] = [
  { key: "sd1", group: "Bankruptcy", label: "Signup Date", value: "2026-05-02", source: "Manual", confirmedBy: "Mark Lee" },
  { key: "sd2", group: "Bankruptcy", label: "Insolvency Date", value: "2026-05-12", source: "SAFA extraction", document: "Form 1.pdf", page: "2", confirmedBy: "Nancy McJones" },
  { key: "sd3", group: "Bankruptcy", label: "Date Assignment Filed", value: "2026-05-12", source: "Imported", document: "OSB filing receipt" },
  { key: "sd4", group: "Bankruptcy", label: "Date Bankruptcy Order Made Against Debtor", value: "", source: "Manual" },
  { key: "sd5", group: "Bankruptcy", label: "Date Bankruptcy Petition Filed", value: "", source: "Manual" },
  { key: "sd6", group: "Bankruptcy", label: "Notice of Bankruptcy Mailed to Creditors", value: "2026-05-14", source: "Rule engine" },
  { key: "sd7", group: "Bankruptcy", label: "Petition Heard by Court — Date", value: "", source: "Manual" },
  { key: "sd8", group: "Bankruptcy", label: "Petition Heard by Court — Time", value: "", type: "time", source: "Manual" },
  { key: "sd9", group: "Bankruptcy", label: "Final Proof of Claim Required by Creditor", value: "2026-08-24", source: "Rule engine" },
  { key: "sd10", group: "Bankruptcy", label: "30-Day Notice Sent to Creditors", value: "2026-06-11", source: "Rule engine" },
  { key: "sd11", group: "Proposal", label: "Proposal Filing Date", value: "2026-05-12", source: "Imported", document: "Form 47" },
  { key: "sd12", group: "Proposal", label: "Deemed Approval Date", value: "2026-06-26", source: "Rule engine" },
  { key: "sd13", group: "Proposal", label: "Court Approval Date", value: "", source: "Manual" },
  { key: "sd14", group: "Trustee's Discharge", label: "Notice of Trustee's Discharge", value: "", source: "Manual" },
  { key: "sd15", group: "Trustee's Discharge", label: "Trustee Discharge Date", value: "", source: "Manual" },
  { key: "sd16", group: "Bankrupt's Discharge", label: "Automatic Discharge Eligible", value: "2027-02-12", source: "Rule engine" },
  { key: "sd17", group: "Bankrupt's Discharge", label: "Discharge Hearing Date", value: "", source: "Manual" },
  { key: "sd18", group: "Substitute Trustee", label: "Date of Substitution", value: "", source: "Manual" },
];

export const dateProvenanceSection: SectionSpec = {
  title: "Provenance",
  fields: [
    { key: "value", label: "Value", type: "date" },
    sel("source", "Source", ["Manual", "Imported", "SAFA extraction", "Rule engine"]),
    { key: "document", label: "Source Document" },
    { key: "page", label: "Page" },
    sel("confirmedBy", "Confirmed By", OPTIONS.staff),
    { key: "effectiveDate", label: "Effective Date", type: "date" },
    { key: "changeReason", label: "Reason for Change", type: "textarea", span: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Financials
// ---------------------------------------------------------------------------
export const bankAccountSections: SectionSpec[] = [
  {
    title: "Bank",
    fields: [
      sel("institution", "Institution", ["RBC", "TD", "BMO", "Scotiabank", "CIBC", "Desjardins"], { span: 2 }),
      { key: "branchName", label: "Branch Name" },
      { key: "transitNumber", label: "Transit Number" },
      { key: "accountNumber", label: "Account Number", hint: "Masked in list views" },
      sel("accountType", "Account Type", OPTIONS.accountType),
      sel("currency", "Currency", OPTIONS.currency),
      { key: "defaultAccount", label: "Default account", type: "checkbox" },
    ],
  },
  {
    title: "Dates",
    fields: [
      { key: "openedDate", label: "Opened Date", type: "date" },
      { key: "asOfDate", label: "As-of Date", type: "date" },
      { key: "closedDate", label: "Closed Date", type: "date" },
    ],
  },
  {
    title: "Accounting & Integration",
    fields: [
      { key: "openingBalance", label: "Opening Balance", type: "money" },
      sel("glBankAccount", "GL Bank Account", ["10000 · Trust Bank", "10100 · Operating Bank"]),
      sel("bankExportFormat", "Bank export format", OPTIONS.bankExport),
      { key: "padEnabled", label: "PAD enabled", type: "checkbox" },
      { key: "eftEnabled", label: "EFT enabled", type: "checkbox" },
    ],
  },
];

export const receiptSections: SectionSpec[] = [
  {
    title: "Receipt",
    fields: [
      { key: "receiptDate", label: "Receipt Date", type: "date" },
      sel("receivedFrom", "Received From", ["John Smith", "Spouse", "Employer", "CRA", "Third party"]),
      sel("paymentMethod", "Payment Method", OPTIONS.paymentMethod),
      { key: "amount", label: "Amount", type: "money" },
      { key: "chequeNumber", label: "Cheque / Transaction #" },
      { key: "receiptNumber", label: "Receipt #" },
      { key: "depositDate", label: "Deposit Date", type: "date" },
      sel("bankAccount", "Bank Account", ["RBC Estate Trust ****2331"], { span: 2 }),
    ],
  },
  {
    title: "Optional Links",
    fields: [
      sel("creditor", "Creditor", ["CRA", "RBC Auto Finance", "Capital One"]),
      sel("asset", "Asset", ["2022 Ford F-150", "TFSA — Wealthsimple"]),
      sel("disposition", "Disposition", OPTIONS.disposition),
    ],
  },
];

export const disbursementSections: SectionSpec[] = [
  {
    title: "Disbursement",
    fields: [
      sel("disbursementType", "Disbursement Type", OPTIONS.disbursementType),
      { key: "dueDate", label: "Due Date", type: "date" },
      sel("payee", "Payee", ["Counsellor Inc.", "Office of the Superintendent", "Court Registry", "Trustee"]),
      { key: "amount", label: "Amount", type: "money" },
      sel("bankAccount", "Bank Account", ["RBC Estate Trust ****2331"], { span: 2 }),
    ],
  },
  {
    title: "Accounting",
    fields: [
      sel("glAccount", "GL Account", ["21000 · Counselling", "22000 · Admin disbursements", "23000 · OSB levy"]),
      sel("asset", "Asset (optional)", ["2022 Ford F-150", "TFSA — Wealthsimple"]),
      sel("creditor", "Creditor (optional)", ["CRA", "RBC Auto Finance", "Capital One"]),
      sel("taxTreatment", "Tax Treatment", OPTIONS.taxTreatment),
    ],
  },
  {
    title: "Payment",
    fields: [
      sel("paymentMethod", "Payment Method", OPTIONS.paymentMethod),
      { key: "paymentReference", label: "Cheque / EFT #" },
      { key: "paymentDate", label: "Payment Date", type: "date" },
      { key: "cleared", label: "Cleared", type: "checkbox" },
      { key: "unclaimedToOSB", label: "Unclaimed payment to OSB", type: "checkbox" },
    ],
  },
];

export const scheduleSections: SectionSpec[] = [
  {
    title: "Schedule",
    fields: [
      sel("scheduleType", "Schedule Type", OPTIONS.scheduleType),
      sel("paymentCategory", "Payment Category", OPTIONS.allocationAccount),
      sel("periodType", "Period Type", OPTIONS.periodType),
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "numberOfPeriods", label: "Number of Periods", type: "number" },
      { key: "amountPerPayment", label: "Amount per Payment", type: "money" },
      { key: "incrementalMonthly", label: "Incremental Monthly Amount", type: "money" },
      sel("asset", "Linked Asset", ["—", "2022 Ford F-150", "TFSA — Wealthsimple"]),
      sel("glAccount", "Linked GL Account", ["21000 · Counselling", "31000 · Surplus income"]),
    ],
  },
  {
    title: "Pre-authorized Debit",
    fields: [
      { key: "padEnabled", label: "PAD enabled", type: "checkbox" },
      { key: "mandateReference", label: "Mandate Reference" },
      { key: "firstDebitDate", label: "First Debit Date", type: "date" },
      { key: "gracePeriodDays", label: "Grace Period (days)", type: "number" },
      { key: "comments", label: "Comments", type: "textarea", span: 3 },
    ],
  },
];

export const reconciliationSections: SectionSpec[] = [
  {
    title: "Statement",
    description: "SecureFiles extension — not field-for-field prescribed by the source system.",
    fields: [
      { key: "statementStart", label: "Statement Start", type: "date" },
      { key: "statementEnd", label: "Statement End", type: "date" },
      sel("bankAccount", "Bank Account", ["RBC Estate Trust ****2331"]),
      { key: "openingStatementBalance", label: "Opening Statement Balance", type: "money" },
      { key: "closingStatementBalance", label: "Closing Statement Balance", type: "money" },
      { key: "ledgerBalance", label: "Ledger Balance", type: "money" },
    ],
  },
  {
    title: "Adjustments",
    fields: [
      { key: "depositsInTransit", label: "Deposits in Transit", type: "money" },
      { key: "outstandingWithdrawals", label: "Outstanding Withdrawals", type: "money" },
      { key: "bankCharges", label: "Bank Charges", type: "money" },
      { key: "interest", label: "Interest", type: "money" },
      { key: "reconciledBalance", label: "Reconciled Balance", type: "money" },
      { key: "difference", label: "Difference", type: "money", readOnly: true },
    ],
  },
  {
    title: "Approval",
    fields: [
      sel("preparer", "Preparer", OPTIONS.staff),
      sel("reviewer", "Reviewer", OPTIONS.staff),
      { key: "approvalDate", label: "Approval Date", type: "date" },
      sel("status", "Reconciliation Status", OPTIONS.reconciliationStatus),
    ],
  },
];

export const journalHeaderSection: SectionSpec = {
  title: "Journal Entry",
  fields: [
    { key: "glDate", label: "GL Date", type: "date" },
    sel("bankAccount", "Bank Account", ["RBC Estate Trust ****2331"]),
    { key: "group", label: "Group" },
    { key: "memo", label: "Memo", type: "textarea", span: 3 },
  ],
};

export const glAccounts = [
  "10000 · Trust Bank",
  "21000 · Counselling",
  "22000 · Admin disbursements",
  "23000 · OSB levy",
  "31000 · Surplus income",
  "41000 · Dividends payable",
];

// ---------------------------------------------------------------------------
// Creditors
// ---------------------------------------------------------------------------
export const creditorSections: SectionSpec[] = [
  {
    title: "Identity",
    description: "Address references the master creditor record; sent communications keep their address snapshot.",
    fields: [
      sel("masterCreditor", "Master Creditor", ["CRA", "RBC Auto Finance", "Capital One", "Create new…"], { span: 2 }),
      { key: "legalName", label: "Legal Name" },
      { key: "accountNumber", label: "Account Number" },
      { key: "headOffice", label: "Head office", type: "checkbox" },
    ],
  },
  {
    title: "Address",
    fields: [
      { key: "address1", label: "Address 1", span: 2 },
      { key: "address2", label: "Address 2" },
      { key: "city", label: "City" },
      sel("province", "Province", OPTIONS.province),
      { key: "postalCode", label: "Postal Code" },
      sel("country", "Country", OPTIONS.country),
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
    ],
  },
  {
    title: "Liability",
    fields: [
      sel("creditorType", "Creditor Type", OPTIONS.creditorType),
      { key: "soaAmount", label: "SOA Amount", type: "money" },
      { key: "contingentAmount", label: "Contingent Amount", type: "money" },
      { key: "deferredAmount", label: "Deferred Amount", type: "money" },
      { key: "otherAmount", label: "Other Amount", type: "money" },
    ],
  },
  {
    title: "Proof of Claim",
    fields: [
      { key: "pocFiled", label: "POC filed", type: "checkbox" },
      { key: "receivedDate", label: "Received Date", type: "date" },
      sel("claimStatus", "Claim Status", OPTIONS.claimStatus),
      { key: "filedAmount", label: "Filed Amount", type: "money" },
      { key: "admittedVoting", label: "Admitted for Voting", type: "money" },
      { key: "admittedDividend", label: "Admitted for Dividend", type: "money" },
      sel("claimClass", "Class", OPTIONS.claimClass),
      { key: "rank", label: "Rank", type: "number" },
      { key: "reasons", label: "Reasons", type: "textarea", span: 3 },
      { key: "completed", label: "Completed", type: "checkbox" },
    ],
  },
  {
    title: "Communication Requests",
    fields: [
      { key: "meetingRequested", label: "Meeting requested", type: "checkbox" },
      { key: "report170Requested", label: "170 report requested", type: "checkbox" },
      { key: "materialChangeRequested", label: "Material change requested", type: "checkbox" },
      { key: "amendedPaymentsRequested", label: "Amended payments requested", type: "checkbox" },
    ],
  },
];

export const meetingSections: SectionSpec[] = [
  {
    title: "Creditor Meeting",
    fields: [
      { key: "votingRound", label: "Voting Round #", type: "number" },
      { key: "noticeSentDate", label: "Date Notice Sent", type: "date" },
      { key: "meetingDate", label: "Meeting Date", type: "date" },
      { key: "meetingTime", label: "Meeting Time", type: "time" },
      { key: "location", label: "Location", span: 2 },
      sel("chairperson", "Chairperson", OPTIONS.staff),
      sel("amendmentMadeBy", "Amendment Made By", OPTIONS.staff),
      { key: "deemedApproval", label: "Deemed approval", type: "checkbox" },
      { key: "deemedApprovalDate", label: "Deemed Approval Date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea", span: 3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export const assetSections: SectionSpec[] = [
  {
    title: "Asset",
    fields: [
      sel("assetType", "Asset Type", OPTIONS.assetType),
      { key: "description", label: "Description", span: 2 },
    ],
  },
  {
    title: "Statement of Affairs",
    description: "Sworn SOA value is locked by default and requires a deliberate unlock.",
    fields: [
      { key: "soaValue", label: "Original / SOA Value", type: "money", readOnly: true },
      { key: "originalCost", label: "Original Cost", type: "money" },
      { key: "soaUnlocked", label: "Unlock SOA value", type: "checkbox" },
    ],
  },
  {
    title: "Realization",
    fields: [
      { key: "estimated", label: "Estimated", type: "money" },
      { key: "amountToRealize", label: "Amount to Realize", type: "money" },
      { key: "amountDeposited", label: "Amount Deposited", type: "money" },
      sel("disposition", "Disposition", OPTIONS.disposition),
      { key: "dispositionDate", label: "Disposition Date", type: "date" },
      { key: "completed", label: "Completed", type: "checkbox" },
      { key: "exempt", label: "Exempt", type: "checkbox" },
      sel("exemptionStatus", "Exemption Status", OPTIONS.exemptionStatus),
      { key: "buyBack", label: "Buy-back", type: "checkbox" },
      { key: "notSold", label: "Asset not sold", type: "checkbox" },
      { key: "notSoldReason", label: "Reason", type: "textarea", span: 3 },
      { key: "rdNotes", label: "R&D Notes", type: "textarea", span: 2 },
      { key: "printOnRD", label: "Print on R&D", type: "checkbox" },
    ],
  },
  {
    title: "Encumbrance",
    fields: [
      { key: "encumbered", label: "Encumbered", type: "checkbox" },
      { key: "sellingCosts", label: "Selling Costs", type: "money" },
      { key: "exemptAmount", label: "Exempt Amount", type: "money" },
      { key: "thirdPartyInterest", label: "Third Party Interest", type: "money" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Additional information (Other list)
// ---------------------------------------------------------------------------
export const additionalInfoGroups: { id: string; label: string; sections: SectionSpec[]; rows: string[] }[] = [
  {
    id: "alternateNames",
    label: "Alternate Names",
    rows: ["John A. Smith — AKA", "Johnny Smith — Nickname"],
    sections: [{ title: "Alternate Name", fields: [
      { key: "firstName", label: "First Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "lastName", label: "Last Name" },
      sel("nameType", "Type", ["AKA", "Maiden", "Former legal", "Nickname"]),
      { key: "usedFrom", label: "Used From", type: "date" },
      { key: "usedTo", label: "Used To", type: "date" },
    ]}],
  },
  {
    id: "addresses",
    label: "Addresses",
    rows: ["120 Bank St, Ottawa ON — Current", "44 Elm Ave, Ottawa ON — Prior"],
    sections: [{ title: "Address", fields: [
      sel("addressType", "Type", ["Current", "Prior", "Mailing", "Business"]),
      { key: "address1", label: "Address 1", span: 2 },
      { key: "city", label: "City" },
      sel("province", "Province", OPTIONS.province),
      { key: "postalCode", label: "Postal Code" },
      { key: "from", label: "From", type: "date" },
      { key: "to", label: "To", type: "date" },
    ]}],
  },
  {
    id: "businesses",
    label: "Businesses",
    rows: ["Smith Contracting — Sole proprietorship"],
    sections: [{ title: "Business", fields: [
      { key: "name", label: "Business Name", span: 2 },
      sel("structure", "Structure", ["Sole proprietorship", "Partnership", "Corporation"]),
      { key: "businessNumber", label: "Business Number" },
      { key: "natureOfBusiness", label: "Nature of Business" },
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "stillOperating", label: "Still operating", type: "checkbox" },
    ]}],
  },
  {
    id: "contacts",
    label: "Contacts",
    rows: ["Lisa Smith — Spouse", "Paul Ng — Legal counsel"],
    sections: [{ title: "Contact", fields: [
      { key: "name", label: "Name", span: 2 },
      sel("relationship", "Relationship", ["Spouse", "Family", "Legal counsel", "Accountant", "Employer", "Other"]),
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "authorized", label: "Authorized to discuss file", type: "checkbox" },
    ]}],
  },
  {
    id: "dependants",
    label: "Dependants",
    rows: ["Ava Smith — 9", "Noah Smith — 6"],
    sections: [{ title: "Dependant", fields: [
      { key: "name", label: "Name", span: 2 },
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      sel("relationship", "Relationship", ["Child", "Parent", "Other"]),
      { key: "livesWithDebtor", label: "Lives with debtor", type: "checkbox" },
      { key: "supportAmount", label: "Monthly Support", type: "money" },
    ]}],
  },
  {
    id: "employment",
    label: "Employment",
    rows: ["Bell Canada — Technician — Current"],
    sections: [{ title: "Employment", fields: [
      { key: "employer", label: "Employer", span: 2 },
      { key: "occupation", label: "Occupation" },
      sel("status", "Status", ["Full-time", "Part-time", "Self-employed", "Unemployed", "Retired"]),
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "grossMonthly", label: "Gross Monthly Income", type: "money" },
      sel("payFrequency", "Pay Frequency", OPTIONS.periodType),
    ]}],
  },
  {
    id: "spouse",
    label: "Spouse / Family",
    rows: ["Lisa Smith — Spouse — Income $2,900"],
    sections: [{ title: "Spouse / Family", fields: [
      { key: "name", label: "Name", span: 2 },
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      { key: "sin", label: "SIN" },
      { key: "monthlyIncome", label: "Monthly Income", type: "money" },
      { key: "isFilingJointly", label: "Filing jointly", type: "checkbox" },
    ]}],
  },
  {
    id: "jointDebtor",
    label: "Joint Debtor",
    rows: ["No joint debtor recorded"],
    sections: [{ title: "Joint Debtor", fields: [
      { key: "name", label: "Name", span: 2 },
      { key: "estateNumber", label: "Estate Number" },
      sel("proceedingType", "Proceeding Type", OPTIONS.proceedingType),
      { key: "filingDate", label: "Filing Date", type: "date" },
    ]}],
  },
  {
    id: "guaranteedDebts",
    label: "Guaranteed Debts",
    rows: ["RBC line of credit — guarantor Lisa Smith"],
    sections: [{ title: "Guaranteed Debt", fields: [
      sel("creditor", "Creditor", ["CRA", "RBC Auto Finance", "Capital One"]),
      { key: "guarantorName", label: "Guarantor Name" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "notes", label: "Notes", type: "textarea", span: 3 },
    ]}],
  },
  {
    id: "priorInsolvencies",
    label: "Prior Insolvencies",
    rows: ["2014 Bankruptcy — discharged 2015 — 33-098111"],
    sections: [{ title: "Prior Insolvency", fields: [
      sel("insolvencyType", "Insolvency Type", OPTIONS.proceedingType),
      { key: "filingDate", label: "Filing Date", type: "date" },
      { key: "trustee", label: "Trustee" },
      sel("dischargeType", "Discharge Type", OPTIONS.dischargeType),
      { key: "osbNumber", label: "OSB Number" },
      { key: "jointDebtor", label: "Joint debtor", type: "checkbox" },
      { key: "name", label: "Name" },
      { key: "locationFiled", label: "Location Filed" },
      { key: "outsideCanada", label: "Outside Canada", type: "checkbox" },
      { key: "successful", label: "Successful", type: "checkbox" },
      { key: "dischargeDate", label: "Discharge Date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea", span: 3 },
    ]}],
  },
  {
    id: "relatedEstates",
    label: "Related Estates",
    rows: ["33-123457 — ABC Corp Ltd. — Director"],
    sections: [{ title: "Related Estate", fields: [
      { key: "estateNumber", label: "Estate Number" },
      { key: "name", label: "Name", span: 2 },
      sel("relationship", "Relationship", ["Spouse", "Director", "Guarantor", "Affiliate", "Other"]),
    ]}],
  },
  {
    id: "inspectors",
    label: "Inspectors",
    rows: ["Alice Roy — Creditor inspector"],
    sections: [{ title: "Inspector", fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      sel("inspectorType", "Type", ["Creditor inspector", "Independent", "Court appointed"]),
      { key: "address", label: "Address", span: 2 },
      { key: "city", label: "City" },
      sel("province", "Province", OPTIONS.province),
      { key: "postalCode", label: "Postal Code" },
      sel("country", "Country", OPTIONS.country),
      { key: "phone", label: "Phone" },
      { key: "ext", label: "Ext" },
      { key: "fax", label: "Fax" },
      { key: "email", label: "Email" },
      { key: "resolution", label: "Inspector Resolution", type: "textarea", span: 3 },
    ]}],
  },
  {
    id: "examinations",
    label: "Examinations",
    rows: ["No examinations recorded"],
    sections: [{ title: "Examination", fields: [
      sel("examinationType", "Type", ["Official Receiver", "Court", "Creditor"]),
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "location", label: "Location", span: 2 },
      { key: "examiner", label: "Examiner" },
      { key: "outcome", label: "Outcome", type: "textarea", span: 3 },
    ]}],
  },
  {
    id: "otherInformation",
    label: "Other Information",
    rows: ["Debtor requests French correspondence"],
    sections: [{ title: "Other Information", fields: [
      sel("infoType", "Type", ["Note", "Disclosure", "Restriction", "Other"]),
      { key: "subject", label: "Subject", span: 2 },
      { key: "details", label: "Details", type: "textarea", span: 3 },
      { key: "recordedDate", label: "Recorded Date", type: "date" },
    ]}],
  },
];

// ---------------------------------------------------------------------------
// Counselling
// ---------------------------------------------------------------------------
export const counsellingSections: SectionSpec[] = [
  {
    title: "Session",
    fields: [
      sel("sessionNumber", "Session Number", OPTIONS.counsellingSession),
      { key: "appointmentDate", label: "Appointment Date", type: "date" },
      { key: "appointmentTime", label: "Time", type: "time" },
      { key: "location", label: "Location", span: 2 },
      sel("counsellor", "Counsellor", OPTIONS.staff),
      { key: "thirdPartyFirm", label: "Third Party Firm" },
      { key: "address", label: "Address", span: 2 },
    ],
  },
  {
    title: "Status",
    fields: [
      { key: "completed", label: "Completed", type: "checkbox" },
      { key: "dateInvoiced", label: "Date Invoiced", type: "date" },
      { key: "refused", label: "Bankrupt refused counselling", type: "checkbox" },
      { key: "neglected", label: "Bankrupt neglected counselling", type: "checkbox" },
      { key: "details", label: "Details", type: "textarea", span: 3 },
      { key: "comments", label: "Comments", type: "textarea", span: 3 },
      sel("sourceDocument", "Source Documentation", ["Counselling certificate.pdf", "Session notes.pdf", "None"]),
      { key: "generateCertificate", label: "Generate certificate on save", type: "checkbox" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Income & expenses (Form 65)
// ---------------------------------------------------------------------------
export const incomePeriodSections: SectionSpec[] = [
  {
    title: "Period",
    fields: [
      { key: "statementNumber", label: "Statement Number", type: "number" },
      { key: "year", label: "Year", type: "number" },
      sel("month", "Month", ["January","February","March","April","May","June","July","August","September","October","November","December"]),
      { key: "householdMembers", label: "Household Members (this period)", type: "number", hint: "Stored per period — household size can change mid-bankruptcy." },
      sel("incomeBasis", "Monthly Income Basis", ["Pay Period", "Specific Cheques"]),
      { key: "comments", label: "Comments", type: "textarea", span: 3 },
    ],
  },
  {
    title: "Amounts",
    fields: [
      { key: "monthlyIncome", label: "Monthly Income", type: "money" },
      { key: "discretionaryExpenses", label: "Discretionary Expenses", type: "money" },
      { key: "nonDiscretionaryExpenses", label: "Non-discretionary Expenses", type: "money" },
      { key: "payment", label: "Payment", type: "money" },
    ],
  },
  {
    title: "Surplus Income Calculation",
    description: "Computed by the deterministic rule engine — SAFA may prefill inputs but never the result.",
    fields: [
      { key: "bankruptIncome", label: "Bankrupt Income", type: "money" },
      { key: "spouseIncome", label: "Spouse Income", type: "money" },
      { key: "otherFamilyIncome", label: "Other Family Income", type: "money" },
      { key: "permittedNonDiscretionary", label: "Permitted Non-discretionary Expenses", type: "money" },
      { key: "availableFamilyIncome", label: "Available Family Income", type: "money", readOnly: true },
      { key: "householdMembers", label: "Household Members", type: "number" },
      sel("standardVersion", "Superintendent Standard Version", ["2024", "2025", "2026"]),
      { key: "bankruptPortion", label: "Bankrupt's Portion", type: "money", readOnly: true },
      { key: "surplusOrDeficit", label: "Surplus / (Deficit)", type: "money", readOnly: true },
      { key: "requiredPercentage", label: "Required Percentage", type: "number", readOnly: true },
      { key: "amountRequired", label: "Amount Required by Directive", type: "money", readOnly: true },
      { key: "amountAgreed", label: "Amount Agreed", type: "money" },
      { key: "paymentsMade", label: "Payments Made", type: "money", readOnly: true },
      { key: "outstanding", label: "Outstanding", type: "money", readOnly: true },
      { key: "disagreement", label: "Disagreement / mediation required", type: "checkbox" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Tax
// ---------------------------------------------------------------------------
export const taxReturnSections: SectionSpec[] = [
  {
    title: "Return",
    fields: [
      sel("returnType", "Return Type", OPTIONS.taxReturnType),
      { key: "year", label: "Year", type: "number" },
      sel("jurisdiction", "Jurisdiction", OPTIONS.taxJurisdiction),
      { key: "source", label: "Source" },
      { key: "dateOfBankruptcy", label: "Date of Bankruptcy", type: "date", readOnly: true },
      sel("status", "Status", OPTIONS.taxStatus),
      { key: "dateFiled", label: "Date Filed", type: "date" },
      { key: "assessmentDate", label: "Assessment Date", type: "date" },
      { key: "followUpMonths", label: "Follow-up (months)", type: "number" },
      { key: "reminderDate", label: "Reminder Date", type: "date" },
      { key: "completed", label: "Completed", type: "checkbox" },
    ],
  },
  {
    title: "Amounts & Disposition",
    fields: [
      { key: "estimatedAmount", label: "Estimated Amount", type: "money" },
      { key: "amountDeposited", label: "Amount Deposited", type: "money" },
      sel("disposition", "Disposition", OPTIONS.disposition),
      { key: "dispositionDate", label: "Disposition Date", type: "date" },
    ],
  },
  {
    title: "Preparer",
    fields: [
      { key: "preparerName", label: "Preparer Name", span: 2 },
      { key: "dateForwarded", label: "Date Forwarded", type: "date" },
      { key: "datePrepared", label: "Date Returned / Prepared", type: "date" },
      { key: "datePaid", label: "Date Paid", type: "date" },
      { key: "preparationCharge", label: "Preparation Charge", type: "money" },
    ],
  },
];

export const requiredTaxDocSections: SectionSpec[] = [
  {
    title: "Required Document",
    fields: [
      sel("docType", "Document", OPTIONS.requiredDocType),
      { key: "taxYear", label: "Tax Year", type: "number" },
      { key: "required", label: "Required", type: "checkbox" },
      { key: "received", label: "Received", type: "checkbox" },
      { key: "verified", label: "Verified", type: "checkbox" },
      sel("linkedDocument", "Linked SecureFiles Document", ["T4 2025.pdf", "Notice of Assessment.pdf", "None"], { span: 2 }),
      { key: "requestedDate", label: "Requested Date", type: "date" },
      { key: "receivedDate", label: "Received Date", type: "date" },
      { key: "reminderDate", label: "Reminder Date", type: "date" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Discharge / s.170 (Form 82)
// ---------------------------------------------------------------------------
export const form82Sections: SectionSpec[] = [
  {
    title: "Financial Position",
    description: "Auto-populated from the estate ledger; only judgement fields require review.",
    fields: [
      sel("causeOfBankruptcy", "Cause of Bankruptcy", OPTIONS.causeOfBankruptcy, { span: 2 }),
      { key: "incomeAtBankruptcy", label: "Income at Bankruptcy", type: "money", readOnly: true },
      { key: "incomeAtReportDate", label: "Income at Report Date", type: "money", readOnly: true },
      { key: "familyIncome", label: "Family Income", type: "money", readOnly: true },
      { key: "preferredDividendRate", label: "Anticipated Preferred Dividend %", type: "number" },
      { key: "unsecuredDividendRate", label: "Anticipated Unsecured Dividend %", type: "number" },
      { key: "surplusRequired", label: "Surplus Income Required", type: "money", readOnly: true },
      { key: "amountAgreed", label: "Amount Agreed", type: "money", readOnly: true },
      { key: "repurchaseAmount", label: "Repurchase Amount", type: "money" },
      { key: "repurchaseDetails", label: "Repurchase Details", type: "textarea", span: 3 },
    ],
  },
  {
    title: "Compliance",
    fields: [
      { key: "allPaymentsMade", label: "All required payments made", type: "checkbox" },
      { key: "correspondsWithDirective", label: "Amount corresponds with directive", type: "checkbox" },
      { key: "mediationAwareness", label: "Bankrupt aware of mediation", type: "checkbox" },
      { key: "materialChange", label: "Material change occurred", type: "checkbox" },
      { key: "mediationRequired", label: "Mediation required", type: "checkbox" },
      { key: "counsellingCompleted", label: "Counselling completed", type: "checkbox" },
      { key: "counsellingRefused", label: "Counselling refused", type: "checkbox" },
    ],
  },
  {
    title: "Opposition & Recommendation",
    fields: [
      { key: "trusteeOpposition", label: "Trustee opposes discharge", type: "checkbox" },
      { key: "superintendentOpposition", label: "Superintendent opposes", type: "checkbox" },
      { key: "creditorOpposition", label: "Creditor opposes", type: "checkbox" },
      { key: "bankruptAgrees", label: "Bankrupt agrees with recommendation", type: "checkbox" },
      { key: "viableProposal", label: "Viable proposal assessment", type: "textarea", span: 3 },
      { key: "section173Facts", label: "Section 173 facts", type: "textarea", span: 3 },
      { key: "offenceQuestions", label: "Offence-related questions", type: "textarea", span: 3 },
      { key: "otherCircumstances", label: "Other discharge circumstances", type: "textarea", span: 3 },
      { key: "otherPertinentInformation", label: "Other pertinent information", type: "textarea", span: 3 },
    ],
  },
  {
    title: "Court / Discharge Document",
    fields: [
      { key: "courtOfficial", label: "Court Official", span: 2 },
      { key: "courtOfficialDate", label: "Court Official Date", type: "date" },
      { key: "orderParagraph1", label: "Order Paragraph 1", type: "textarea", span: 3 },
      { key: "orderParagraph2", label: "Order Paragraph 2", type: "textarea", span: 3 },
      { key: "orderParagraph3", label: "Order Paragraph 3", type: "textarea", span: 3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Forms catalogue parameters
// ---------------------------------------------------------------------------
export const formParameterSections: SectionSpec[] = [
  {
    title: "Form",
    fields: [
      { key: "formNumber", label: "Form Number", readOnly: true },
      { key: "formName", label: "Form Name", readOnly: true, span: 2 },
      { key: "eFile", label: "E-File", type: "checkbox" },
      sel("bundle", "Bundle", ["Filing package", "Creditor package", "Discharge package", "None"]),
      sel("paperLayout", "Paper Layout", ["Letter", "Legal", "A4"]),
    ],
  },
  {
    title: "Parameters",
    fields: [
      { key: "signingDate", label: "Signing Date", type: "date" },
      { key: "period", label: "Period" },
      { key: "city", label: "City" },
      sel("provinceParam", "Province", OPTIONS.province),
      sel("rdType", "R&D Type", ["Interim", "Final"]),
      { key: "dateFrom", label: "Date Range From", type: "date" },
      { key: "dateTo", label: "Date Range To", type: "date" },
      { key: "inspectorsToSign", label: "Inspectors to Sign" },
      { key: "printDividendSheet", label: "Print dividend sheet", type: "checkbox" },
      { key: "showZeroPayments", label: "Show zero payments", type: "checkbox" },
      { key: "showCreditorAddress", label: "Show creditor address", type: "checkbox" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------
export const milestoneDefinitionSections: SectionSpec[] = [
  {
    title: "Milestone Definition",
    fields: [
      { key: "name", label: "Milestone Name", span: 2 },
      { key: "category", label: "Category" },
      { key: "applicableCriteria", label: "Applicable Criteria", type: "textarea", span: 3 },
      { key: "numberOfDays", label: "Number of Days", type: "number" },
      sel("anchorDateField", "Anchor Date Field", statutoryDates.map((d) => d.label)),
      sel("severity", "Severity", OPTIONS.milestoneSeverity),
      { key: "version", label: "Rule Version" },
      { key: "effectiveFrom", label: "Effective From", type: "date" },
      { key: "effectiveTo", label: "Effective To", type: "date" },
      { key: "explanation", label: "Human-readable Explanation", type: "textarea", span: 3 },
      { key: "remediationTemplate", label: "Remediation Template", type: "textarea", span: 3 },
    ],
  },
];

export const milestoneInstances = [
  { id: "mi1", name: "170 Report Not Completed", due: "2027-01-12", completed: "", status: "Open", assigned: "Jane Doe", ruleVersion: "v3", severity: "Exception" },
  { id: "mi2", name: "First Counselling Not Scheduled", due: "2026-08-21", completed: "", status: "Open", assigned: "Mark Lee", ruleVersion: "v2", severity: "Warning" },
  { id: "mi3", name: "Notice of First Meeting", due: "2026-05-22", completed: "2026-05-14", status: "Complete", assigned: "System", ruleVersion: "v2", severity: "Informational" },
  { id: "mi4", name: "Receipts Not Deposited", due: "2026-08-15", completed: "", status: "Open", assigned: "Mark Lee", ruleVersion: "v1", severity: "Warning" },
  { id: "mi5", name: "Non-Zero Estate Balance", due: "—", completed: "", status: "Monitoring", assigned: "Jane Doe", ruleVersion: "v1", severity: "Informational" },
  { id: "mi6", name: "Assets Fully Realized", due: "2026-11-30", completed: "", status: "Open", assigned: "Sarah Lee", ruleVersion: "v1", severity: "Warning" },
];

// ---------------------------------------------------------------------------
// Closing
// ---------------------------------------------------------------------------
export const closingSections: SectionSpec[] = [
  {
    title: "Final Reporting",
    fields: [
      { key: "finalRDDate", label: "Date of Final R&D", type: "date" },
      { key: "finalRDApproved", label: "Final R&D approved", type: "checkbox" },
      sel("dischargeType", "Discharge Type", OPTIONS.dischargeType),
      { key: "certificateDate", label: "Discharge Certificate Date", type: "date" },
      { key: "daysFromFinalRD", label: "Days from Final R&D", type: "number", readOnly: true },
    ],
  },
  {
    title: "Closing Checklist",
    fields: [
      { key: "assetsRealized", label: "All assets realized", type: "checkbox" },
      { key: "claimsResolved", label: "All claims resolved", type: "checkbox" },
      { key: "finalDividend", label: "Final dividend complete", type: "checkbox" },
      { key: "commentLetter", label: "Comment letter complete", type: "checkbox" },
      { key: "finalReconciliation", label: "Final bank reconciliation complete", type: "checkbox" },
      { key: "chequesCleared", label: "Outstanding cheques cleared", type: "checkbox" },
      { key: "trustBalanceZero", label: "Trust balance = $0", type: "checkbox" },
      { key: "formsCompleted", label: "Required forms completed", type: "checkbox" },
      { key: "recordsArchived", label: "Required records archived", type: "checkbox" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Notes & communications
// ---------------------------------------------------------------------------
export const noteSections: SectionSpec[] = [
  {
    title: "Entry",
    fields: [
      sel("entryType", "Entry Type", ["Billing note", "Conversation", "Reminder", "Email", "Call", "SMS", "Letter", "SAFA correspondence"]),
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      sel("user", "User", OPTIONS.staff),
      { key: "noteCode", label: "Note Type / Code" },
      { key: "contact", label: "Contact" },
      { key: "text", label: "Text", type: "textarea", span: 3 },
    ],
  },
  {
    title: "Reminder",
    fields: [
      { key: "done", label: "Done", type: "checkbox" },
      sel("priority", "Priority", ["Low", "Normal", "High", "Urgent"]),
      { key: "dueDate", label: "Due Date", type: "date" },
      sel("from", "From", OPTIONS.staff),
      sel("to", "To", OPTIONS.staff),
      { key: "reminderText", label: "Reminder Text", type: "textarea", span: 3 },
    ],
  },
];