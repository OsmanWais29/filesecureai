// CRM types, fixed lists and display labels for a Licensed Insolvency Trustee practice.
// No records live here: all client data comes from the backend (see api.ts).

// ---------- Fixed lists ----------

// Where a file sits, from first contact to discharge
export const STAGES = ["New lead", "Consultation booked", "Assessment", "Filed", "In administration", "Discharged"] as const;
export type Stage = (typeof STAGES)[number];

export const FILE_TYPES = ["Consumer proposal", "Bankruptcy", "Division I proposal", "Debt consultation"] as const;
export type FileType = (typeof FILE_TYPES)[number];

export const LEAD_SOURCES = ["referral", "google", "social_media", "advertisement", "website", "yellow_pages", "word_of_mouth", "other"];

export const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

// Documents every new file should collect (also shown in the intake form)
export const REQUIRED_DOCS = [
  "Bank statements (last 3 months)",
  "Pay stubs or income verification",
  "Tax returns (last 2 years)",
  "Debt statements or notices",
  "Any court documents or legal notices",
];


// ---------- Types ----------

export type Level = "low" | "medium" | "high";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  status: "lead" | "prospect" | "client" | "former_client";
  stage: Stage;
  fileType: FileType;
  leadSource: string;
  totalDebt: number; // unsecured + secured + tax, in CAD
  monthlyIncome: number;
  estateNumber?: string; // assigned once filed with the OSB
  risk: Level;
  assignedTo: string;
  createdAt: string; // ISO date
  stageSince: string; // ISO date the file entered its current stage
  lastActivity: string; // ISO date
  docsReceived: string[]; // subset of REQUIRED_DOCS
  intake?: Record<string, string>; // raw intake answers
}

export interface Activity {
  id: string;
  clientId: string;
  type: "email" | "call" | "meeting" | "note" | "form" | "booking" | "automation";
  text: string;
  at: string; // ISO date
  source?: string; // e.g. "Website booking", "Automation"
}

export interface Deadline {
  id: string;
  clientId: string;
  title: string;
  due: string; // ISO date
  statutory: boolean; // set by the BIA vs. an internal task
  done: boolean;
}

export interface Appointment {
  id: string;
  clientId?: string;
  client: string;
  title: string;
  date: string; // ISO date
  time: string; // "10:00 AM"
  kind: "video" | "phone" | "in_person";
  source: "CRM" | "Website booking" | "Google Calendar" | "Outlook";
  url?: string;
}

export interface Automation {
  id: string;
  trigger: string; // readable label
  action: string; // readable label
  templateKey: string | null;
  enabled: boolean;
  runs: number; // times fired this month
}

export interface Template {
  id: string;
  key: string; // stable name used by automations
  name: string;
  subject: string;
  body: string; // uses {{name}}, {{trustee}}, {{missingDocs}}, {{date}}
}

export interface Integration {
  id: string;
  name: string;
  category: "Lead capture" | "Calendar" | "Email & SMS" | "Filing";
  description: string;
  connected: boolean;
  detail: string; // status line once connected
}

// ---------- Integrations shown on the Integrations tab (labels only) ----------
// `provider` matches the backend; built-in ones need no connection.

export const INTEGRATION_CATALOG: (Omit<Integration, "connected" | "detail"> & {
  provider: "google" | "microsoft" | "twilio" | "builtin";
})[] = [
  { id: "website", provider: "builtin", name: "Website lead form", category: "Lead capture", description: "Embed a debt-help form on your website. Submissions create a lead and start the welcome automation." },
  { id: "booking", provider: "builtin", name: "Online booking page", category: "Lead capture", description: "People book a free consultation from your site. Bookings appear in Schedule." },
  { id: "google", provider: "google", name: "Google (Calendar + Gmail)", category: "Calendar", description: "Two-way calendar sync, send email from your Gmail and pull client replies into the CRM." },
  { id: "microsoft", provider: "microsoft", name: "Microsoft 365 (Outlook)", category: "Calendar", description: "Two-way calendar sync, send from Outlook and pull client replies into the CRM." },
  { id: "twilio", provider: "twilio", name: "SMS (Twilio)", category: "Email & SMS", description: "Text reminders for appointments, documents and deadlines. Without it, texts go through Amazon SNS." },
  { id: "osb", provider: "builtin", name: "OSB filing export", category: "Filing", description: "Download filed estates as a CSV for your OSB filing software." },
];

// Backend automation keys -> plain English
export const TRIGGER_LABEL: Record<string, string> = {
  "lead.created": "New lead (website form, booking or intake)",
  "appointment.booked": "Consultation booked",
  "docs.missing.3d": "Documents missing after 3 days",
  "deadline.due.5d": "A deadline is due in 5 days",
  "contact.none.14d": "No contact for 14 days",
};
export const ACTION_LABEL: Record<string, string> = {
  "email.template": "Send an email from a template",
  "sms.reminder": "Send a text reminder",
  "task.callback": "Create a call-back task within the hour",
  "notify.trustee": "Email the trustee",
};

const DAY = 86_400_000;

// "self_employed" -> "Self employed"
export const pretty = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

// 68400 -> "$68,400"
export const money = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

// Whole days between an ISO date and now (positive = in the past)
export const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / DAY);

// ---------- Shared rules (one definition, used everywhere) ----------

export const isActive = (c: Client) => c.stage === "Filed" || c.stage === "In administration"; // open estate/proposal
export const isConverted = (c: Client) => isActive(c) || c.stage === "Discharged"; // lead became a filing
export const isLate = (d: Deadline) => !d.done && daysAgo(d.due) > 0;
export const sumDebt = (cs: Client[]) => cs.reduce((s, c) => s + c.totalDebt, 0);
