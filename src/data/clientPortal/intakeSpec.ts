/**
 * Guided intake questionnaire ("My information").
 *
 * Plain-language questions for the debtor that map onto the statutory record the
 * trustee has to produce (Form 79 statement of affairs, Form 65 monthly income
 * and expense reporting, counselling and asset schedules). Nothing here is a
 * legal form: the client answers questions, staff review and promote the answers
 * into the estate record.
 */

export type IntakeFieldType = "text" | "textarea" | "number" | "money" | "date" | "select" | "boolean" | "email" | "tel";

export interface IntakeField {
  key: string;
  label: string;
  type: IntakeFieldType;
  help?: string;
  options?: string[];
  required?: boolean;
  /** Repeating group key — rendered as an add/remove list of sub-fields. */
  repeatOf?: IntakeField[];
}

export interface IntakeSection {
  key: string;
  title: string;
  /** One-sentence, non-technical explanation of why we ask. */
  purpose: string;
  /** What the trustee ultimately needs it for. Shown as a quiet footnote. */
  usedFor: string;
  fields: IntakeField[];
}

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    key: "about_you",
    title: "About you",
    purpose: "Confirm who you are and how we can reach you.",
    usedFor: "Your file identity and official correspondence.",
    fields: [
      { key: "first_name", label: "First name", type: "text", required: true },
      { key: "middle_name", label: "Middle name", type: "text" },
      { key: "last_name", label: "Last name", type: "text", required: true },
      { key: "other_names", label: "Any other names you have used", type: "text", help: "Maiden name, previous legal name, or a name you trade under." },
      { key: "date_of_birth", label: "Date of birth", type: "date", required: true },
      { key: "marital_status", label: "Marital status", type: "select", options: ["Single", "Married", "Common-law", "Separated", "Divorced", "Widowed"] },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Best phone number", type: "tel", required: true },
      { key: "address", label: "Home address", type: "textarea", required: true },
      { key: "mailing_same", label: "Mail can be sent to this address", type: "boolean" },
      { key: "language", label: "Preferred language", type: "select", options: ["English", "French"] },
    ],
  },
  {
    key: "household",
    title: "Your household",
    purpose: "Tell us who lives with you and depends on your income.",
    usedFor: "Household size in the monthly income and expense calculation.",
    fields: [
      { key: "adults", label: "Adults in the household (including you)", type: "number", required: true },
      { key: "children", label: "Children or other dependants", type: "number" },
      {
        key: "dependants",
        label: "Dependants",
        type: "text",
        repeatOf: [
          { key: "name", label: "Name", type: "text" },
          { key: "relationship", label: "Relationship to you", type: "text" },
          { key: "age", label: "Age", type: "number" },
        ],
      },
      { key: "spouse_contributes", label: "Someone else in the household contributes to expenses", type: "boolean" },
    ],
  },
  {
    key: "employment_income",
    title: "Work and income",
    purpose: "Describe where your money comes from each month.",
    usedFor: "Monthly income reporting and the surplus income calculation.",
    fields: [
      { key: "employment_status", label: "Current situation", type: "select", options: ["Employed", "Self-employed", "Unemployed", "Retired", "On leave", "Student", "Other"] },
      { key: "employer_name", label: "Employer or business name", type: "text" },
      { key: "occupation", label: "Occupation", type: "text" },
      { key: "pay_frequency", label: "How often are you paid", type: "select", options: ["Weekly", "Bi-weekly", "Twice monthly", "Monthly", "Irregular"] },
      { key: "net_monthly_pay", label: "Take-home pay per month", type: "money", help: "After tax and deductions." },
      { key: "other_income", label: "Other monthly income", type: "money", help: "Benefits, pension, support payments, side work." },
      { key: "other_income_detail", label: "What is the other income", type: "textarea" },
    ],
  },
  {
    key: "assets",
    title: "What you own",
    purpose: "List the things you own so we can tell you what is protected.",
    usedFor: "The asset schedule in your statement of affairs.",
    fields: [
      { key: "owns_home", label: "You own a home or other property", type: "boolean" },
      { key: "home_value", label: "Estimated value of the property", type: "money" },
      { key: "home_mortgage", label: "Amount still owing on it", type: "money" },
      { key: "owns_vehicle", label: "You own a vehicle", type: "boolean" },
      { key: "vehicle_detail", label: "Vehicle year, make and model", type: "text" },
      { key: "vehicle_value", label: "Estimated vehicle value", type: "money" },
      { key: "vehicle_loan", label: "Amount still owing on the vehicle", type: "money" },
      { key: "bank_balances", label: "Money in bank accounts today", type: "money" },
      { key: "rrsp_value", label: "RRSP, pension or savings value", type: "money" },
      { key: "other_assets", label: "Anything else of value", type: "textarea", help: "Tools, collectibles, money owed to you, an expected inheritance or tax refund." },
    ],
  },
  {
    key: "debts",
    title: "What you owe",
    purpose: "List who you owe money to so everyone is notified correctly.",
    usedFor: "The creditor list. Missing a creditor can leave that debt out.",
    fields: [
      {
        key: "creditors",
        label: "Creditors",
        type: "text",
        repeatOf: [
          { key: "name", label: "Who you owe", type: "text" },
          { key: "kind", label: "Type of debt", type: "select", options: ["Credit card", "Loan", "Line of credit", "Taxes", "Utility or phone", "Student loan", "Support payments", "Friend or family", "Other"] },
          { key: "balance", label: "Approximate balance", type: "money" },
          { key: "secured", label: "Secured against something you own", type: "boolean" },
          { key: "account_ref", label: "Account number (if you have it)", type: "text" },
        ],
      },
      { key: "wage_garnishment", label: "Your wages are being garnished", type: "boolean" },
      { key: "legal_action", label: "Someone has started legal action against you", type: "boolean" },
      { key: "legal_action_detail", label: "Tell us about it", type: "textarea" },
    ],
  },
  {
    key: "history",
    title: "Your background",
    purpose: "A few questions we are required to ask everyone.",
    usedFor: "Statutory disclosure and prior-filing checks.",
    fields: [
      { key: "prior_insolvency", label: "You have filed for bankruptcy or a proposal before", type: "boolean" },
      { key: "prior_detail", label: "When and where", type: "text" },
      { key: "transferred_property", label: "You gave away or sold property in the last 5 years", type: "boolean" },
      { key: "transferred_detail", label: "What and to whom", type: "textarea" },
      { key: "primary_cause", label: "Main reason for your financial difficulty", type: "select", options: ["Loss of income", "Illness or injury", "Relationship breakdown", "Business failure", "Overuse of credit", "Supporting others", "Other"] },
      { key: "cause_detail", label: "Anything you want us to understand", type: "textarea" },
    ],
  },
  {
    key: "consents",
    title: "Confirm and consent",
    purpose: "Confirm your answers are true and how we may use them.",
    usedFor: "Recorded with your file as part of the audit trail.",
    fields: [
      { key: "accuracy_confirmed", label: "The information I have given is true and complete to the best of my knowledge", type: "boolean", required: true },
      { key: "contact_consent", label: "My trustee's office may contact me by email and portal message", type: "boolean", required: true },
      { key: "document_consent", label: "I understand documents I upload are shared with my trustee's office", type: "boolean", required: true },
      { key: "signature_name", label: "Type your full name to confirm", type: "text", required: true },
    ],
  },
];

export const sectionByKey = (key: string) => INTAKE_SECTIONS.find((s) => s.key === key);

/** Percentage of required fields answered in a section payload. */
export const sectionCompletion = (section: IntakeSection, data: Record<string, unknown>) => {
  const required = section.fields.filter((f) => f.required);
  const pool = required.length ? required : section.fields;
  const answered = pool.filter((f) => {
    const v = data?.[f.key];
    return v !== undefined && v !== null && v !== "" && v !== false;
  }).length;
  return pool.length === 0 ? 0 : Math.round((answered / pool.length) * 100);
};

/** Look up a section definition by its stored key. */
export const sectionByKey = (key: string): IntakeSection | undefined =>
  INTAKE_SECTIONS.find((s) => s.key === key);
