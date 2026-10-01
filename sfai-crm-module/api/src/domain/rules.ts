// Trustee-specific rules in one place: stages, file types, documents, deadlines,
// and the starter templates/automations every new firm gets.

export const STAGES = [
  "New lead",
  "Consultation booked",
  "Assessment",
  "Filed",
  "In administration",
  "Discharged",
] as const;

export const FILE_TYPES = [
  "Consumer proposal",
  "Bankruptcy",
  "Division I proposal",
  "Debt consultation",
] as const;

export const REQUIRED_DOCS = [
  "Bank statements (last 3 months)",
  "Pay stubs or income verification",
  "Tax returns (last 2 years)",
  "Debt statements or notices",
  "Any court documents or legal notices",
];

// ---------- Statutory deadlines ----------
// STARTER RULE SET: confirm each rule with your compliance lead / current OSB
// directives before relying on it. Days are counted from the filing date.

interface Rule {
  key: string;
  title: string;
  days: number;
  statutory: boolean;
}

// Shorthand: a statutory rule due `days` after filing
const rule = (key: string, title: string, days: number): Rule => ({
  key,
  title,
  days,
  statutory: true,
});

const monthlyReports = (count: number): Rule[] =>
  Array.from({ length: count }, (_, i) =>
    rule(
      `monthly_ie_${i + 1}`,
      `Monthly income & expense report #${i + 1}`,
      30 * (i + 1),
    ),
  );

export const DEADLINE_RULES: Record<string, Rule[]> = {
  Bankruptcy: [
    rule("first_meeting", "First meeting of creditors (if called)", 21),
    rule("counselling_1", "1st counselling session (day 10–60)", 60),
    rule("counselling_2", "2nd counselling session (day 30–210)", 210),
    rule("discharge_9m", "Earliest automatic discharge (first, no surplus)", 274),
    ...monthlyReports(9),
  ],
  "Consumer proposal": [
    rule("meeting_window", "Creditors' 45-day window to request a meeting", 45),
    rule("counselling_1", "1st counselling session", 60),
    rule("counselling_2", "2nd counselling session", 210),
  ],
  "Division I proposal": [
    rule("cash_flow", "Cash-flow statement (10 days after NOI)", 10),
    rule("proposal_due", "File proposal (30 days after NOI, extendable)", 30),
  ],
};

// Deadlines to create when a file is filed
export function deadlinesFor(fileType: string, filedAt: Date) {
  return (DEADLINE_RULES[fileType] ?? []).map((r) => ({
    rule: r.key,
    title: r.title,
    statutory: r.statutory,
    dueAt: new Date(filedAt.getTime() + r.days * 86_400_000),
  }));
}

// ---------- Starter templates + automations for a new firm ----------

export const DEFAULT_TEMPLATES = [
  {
    key: "welcome",
    name: "Welcome / first contact",
    subject: "Thanks for reaching out, {{name}}",
    body:
      "Hi {{name}},\n\nThank you for contacting us about your debt situation. " +
      "A Licensed " +
      "Insolvency Trustee will call you shortly. Your first consultation is free and " +
      "confidential.\n\n{{trustee}}",
  },
  {
    key: "booking_confirmed",
    name: "Consultation confirmation",
    subject: "Your consultation is booked",
    body:
      "Hi {{name}},\n\nYour consultation is " +
      "confirmed for {{date}}. Please bring:\n{{missingDocs}}\n\n{{trustee}}",
  },
  {
    key: "documents",
    name: "Document reminder",
    subject: "Documents needed for your file",
    body:
      "Hi {{name}},\n\nTo keep your file moving, we still need:\n{{missingDocs}}\n\n" +
      "You can reply to this email with attachments.\n\n{{trustee}}",
  },
  {
    key: "deadline",
    name: "Deadline reminder",
    subject: "Reminder: {{deadline}}",
    body:
      "Hi {{name}},\n\nThis is a reminder that “{{deadline}}” is due by {{date}}. " +
      "Reply to this email or call us to arrange it.\n\n{{trustee}}",
  },
  {
    key: "check_in",
    name: "Check-in",
    subject: "Checking in on your file",
    body:
      "Hi {{name}},\n\nWe haven't spoken in a while and wanted to check in. " +
      "Reply or call us any time.\n\n{{trustee}}",
  },
];

export const DEFAULT_AUTOMATIONS = [
  { trigger: "lead.created", action: "email.template", templateKey: "welcome" },
  { trigger: "lead.created", action: "task.callback", templateKey: null },
  {
    trigger: "appointment.booked",
    action: "email.template",
    templateKey: "booking_confirmed",
  },
  { trigger: "docs.missing.3d", action: "email.template", templateKey: "documents" },
  { trigger: "deadline.due.5d", action: "email.template", templateKey: "deadline" },
  { trigger: "deadline.due.5d", action: "sms.reminder", templateKey: "deadline" },
  { trigger: "contact.none.14d", action: "notify.trustee", templateKey: null },
];
