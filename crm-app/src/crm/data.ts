// CRM types + demo data for a Licensed Insolvency Trustee (LIT) practice.
// All demo records live here, so swapping in real data means touching one file.

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

export const TRUSTEES = ["Sarah Johnson, LIT", "John Doe, LIT", "Jane Smith (Counsellor)"];

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
  trigger: string;
  action: string;
  enabled: boolean;
  runs: number; // times fired this month
}

export interface Template {
  id: string;
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

// ---------- Date helpers ----------

const DAY = 86_400_000;
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();
const ahead = (d: number) => new Date(Date.now() + d * DAY).toISOString();

// ---------- Demo clients (one or more per stage) ----------

const base = { status: "client" as const, risk: "medium" as Level, monthlyIncome: 3800, province: "ON", docsReceived: [] as string[] };

export const CLIENTS: Client[] = [
  { ...base, id: "c1", name: "John Smith", email: "john.smith@email.com", phone: "(416) 555-0141", city: "Toronto", stage: "Filed", fileType: "Consumer proposal", leadSource: "google", totalDebt: 68400, estateNumber: "31-2984417", assignedTo: TRUSTEES[0], createdAt: ago(48), stageSince: ago(6), lastActivity: ago(1), docsReceived: REQUIRED_DOCS.slice(0, 4) },
  { ...base, id: "c2", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(905) 555-0172", city: "Mississauga", stage: "In administration", fileType: "Bankruptcy", leadSource: "referral", totalDebt: 41200, estateNumber: "31-2971150", risk: "low", assignedTo: TRUSTEES[1], createdAt: ago(130), stageSince: ago(95), lastActivity: ago(2), docsReceived: REQUIRED_DOCS },
  { ...base, id: "c3", name: "Michael Brown", email: "m.brown@email.com", phone: "(613) 555-0119", city: "Ottawa", stage: "Assessment", fileType: "Division I proposal", leadSource: "advertisement", totalDebt: 212000, risk: "high", monthlyIncome: 9100, assignedTo: TRUSTEES[0], createdAt: ago(30), stageSince: ago(19), lastActivity: ago(17), docsReceived: REQUIRED_DOCS.slice(0, 1) },
  { ...base, id: "c4", name: "Emily Davis", email: "emily.d@email.com", phone: "(519) 555-0188", city: "London", status: "prospect", stage: "Consultation booked", fileType: "Debt consultation", leadSource: "website", totalDebt: 27900, assignedTo: TRUSTEES[2], createdAt: ago(4), stageSince: ago(2), lastActivity: ago(2) },
  { ...base, id: "c5", name: "David Wilson", email: "d.wilson@email.com", phone: "(416) 555-0133", city: "Toronto", status: "former_client", stage: "Discharged", fileType: "Bankruptcy", leadSource: "word_of_mouth", totalDebt: 35500, estateNumber: "31-2810034", risk: "low", assignedTo: TRUSTEES[1], createdAt: ago(320), stageSince: ago(20), lastActivity: ago(20), docsReceived: REQUIRED_DOCS },
  { ...base, id: "c6", name: "Priya Patel", email: "priya.p@email.com", phone: "(647) 555-0164", city: "Brampton", status: "lead", stage: "New lead", fileType: "Debt consultation", leadSource: "website", totalDebt: 0, assignedTo: TRUSTEES[2], createdAt: ago(0.3), stageSince: ago(0.3), lastActivity: ago(0.3) },
  { ...base, id: "c7", name: "Luc Tremblay", email: "luc.t@email.com", phone: "(819) 555-0102", city: "Gatineau", province: "QC", status: "lead", stage: "New lead", fileType: "Debt consultation", leadSource: "social_media", totalDebt: 0, assignedTo: TRUSTEES[2], createdAt: ago(9), stageSince: ago(9), lastActivity: ago(9) },
  { ...base, id: "c8", name: "Angela Chen", email: "angela.c@email.com", phone: "(905) 555-0157", city: "Markham", stage: "In administration", fileType: "Consumer proposal", leadSource: "google", totalDebt: 54300, estateNumber: "31-2950772", risk: "low", assignedTo: TRUSTEES[0], createdAt: ago(210), stageSince: ago(170), lastActivity: ago(5), docsReceived: REQUIRED_DOCS },
];

export const ACTIVITIES: Activity[] = [
  { id: "a1", clientId: "c6", type: "form", text: "Submitted the website debt-help form", at: ago(0.3), source: "Website form" },
  { id: "a2", clientId: "c1", type: "email", text: "Sent proposal documents for review", at: ago(1) },
  { id: "a3", clientId: "c4", type: "booking", text: "Booked a free consultation online", at: ago(2), source: "Website booking" },
  { id: "a4", clientId: "c2", type: "automation", text: "Monthly income & expense reminder sent", at: ago(2), source: "Automation" },
  { id: "a5", clientId: "c8", type: "call", text: "Confirmed proposal payment schedule", at: ago(5) },
  { id: "a6", clientId: "c1", type: "meeting", text: "Assessment meeting completed", at: ago(8) },
  { id: "a7", clientId: "c3", type: "call", text: "Left voicemail about missing tax returns", at: ago(17) },
  { id: "a8", clientId: "c5", type: "note", text: "Certificate of discharge issued", at: ago(20) },
];

export const DEADLINES: Deadline[] = [
  { id: "d1", clientId: "c1", title: "Meeting of creditors request window closes (45 days)", due: ahead(39), statutory: true, done: false },
  { id: "d2", clientId: "c1", title: "1st counselling session", due: ahead(4), statutory: true, done: false },
  { id: "d3", clientId: "c2", title: "Monthly income & expense report", due: ahead(2), statutory: true, done: false },
  { id: "d4", clientId: "c2", title: "2nd counselling session", due: ahead(11), statutory: true, done: false },
  { id: "d5", clientId: "c3", title: "Collect outstanding tax returns", due: ahead(-2), statutory: false, done: false },
  { id: "d6", clientId: "c8", title: "Proposal payment #7 due", due: ahead(6), statutory: false, done: false },
  { id: "d7", clientId: "c4", title: "Prepare consultation budget", due: ahead(1), statutory: false, done: false },
];

export const APPOINTMENTS: Appointment[] = [
  { id: "p1", clientId: "c4", client: "Emily Davis", title: "Free consultation", date: ahead(0), time: "10:00 AM", kind: "video", source: "Website booking", url: "https://meet.example.com/emily-davis" },
  { id: "p2", clientId: "c1", client: "John Smith", title: "1st counselling session", date: ahead(0), time: "2:30 PM", kind: "in_person", source: "CRM" },
  { id: "p3", clientId: "c3", client: "Michael Brown", title: "Assessment follow-up", date: ahead(1), time: "11:00 AM", kind: "phone", source: "Google Calendar" },
  { id: "p4", clientId: "c2", client: "Sarah Johnson", title: "2nd counselling session", date: ahead(3), time: "3:00 PM", kind: "video", source: "Outlook", url: "https://meet.example.com/sarah-johnson" },
];

export const AUTOMATIONS: Automation[] = [
  { id: "au1", trigger: "New website lead", action: "Send welcome email and create a call-back task within 1 hour", enabled: true, runs: 14 },
  { id: "au2", trigger: "Consultation booked", action: "Send confirmation with the document checklist", enabled: true, runs: 9 },
  { id: "au3", trigger: "Documents missing after 3 days", action: "Send document reminder email + SMS", enabled: true, runs: 6 },
  { id: "au4", trigger: "Counselling session due in 5 days", action: "Send session reminder and booking link", enabled: true, runs: 4 },
  { id: "au5", trigger: "Monthly income & expense report due", action: "Send report reminder to bankrupts", enabled: false, runs: 0 },
  { id: "au6", trigger: "No contact for 14 days", action: "Flag file and notify the assigned trustee", enabled: true, runs: 3 },
];

export const TEMPLATES: Template[] = [
  { id: "t1", name: "Welcome / first contact", subject: "Thanks for reaching out, {{name}}", body: "Hi {{name}},\n\nThank you for contacting us about your debt situation. A Licensed Insolvency Trustee will call you shortly. Your first consultation is free and confidential.\n\n{{trustee}}" },
  { id: "t2", name: "Document reminder", subject: "Documents needed for your file", body: "Hi {{name}},\n\nTo keep your file moving, we still need:\n{{missingDocs}}\n\nYou can reply to this email with attachments.\n\n{{trustee}}" },
  { id: "t3", name: "Counselling session reminder", subject: "Your counselling session is coming up", body: "Hi {{name}},\n\nThis is a reminder that your counselling session is due by {{date}}. It's a required part of your file. Reply to book a time.\n\n{{trustee}}" },
  { id: "t4", name: "Income & expense report", subject: "Monthly income & expense report due", body: "Hi {{name}},\n\nYour monthly income and expense report is due by {{date}}. Please send this month's pay stubs with it.\n\n{{trustee}}" },
];

export const INTEGRATIONS: Integration[] = [
  { id: "i1", name: "Website lead form", category: "Lead capture", description: "Embed a debt-help form on your website. Submissions create a lead and start the welcome automation.", connected: true, detail: "14 leads this month" },
  { id: "i2", name: "Online booking page", category: "Lead capture", description: "Let people book a free consultation from your site. Bookings appear in Schedule.", connected: true, detail: "9 bookings this month" },
  { id: "i3", name: "Google Calendar", category: "Calendar", description: "Two-way sync of appointments with your Google Calendar.", connected: true, detail: "Synced 4 minutes ago" },
  { id: "i4", name: "Microsoft Outlook", category: "Calendar", description: "Two-way sync of appointments and email with Outlook / Microsoft 365.", connected: false, detail: "" },
  { id: "i5", name: "Gmail", category: "Email & SMS", description: "Send automations from your own address and log replies to the client timeline.", connected: false, detail: "" },
  { id: "i6", name: "SMS (Twilio)", category: "Email & SMS", description: "Text reminders for appointments, documents and payments.", connected: false, detail: "" },
  { id: "i7", name: "OSB e-filing export", category: "Filing", description: "Prepare estate data for filing with the Office of the Superintendent of Bankruptcy.", connected: false, detail: "" },
];

// Leads per month for the last six months (reporting history)
export const LEADS_BY_MONTH = [
  { month: "May", leads: 31, filed: 9 },
  { month: "Jun", leads: 36, filed: 11 },
  { month: "Jul", leads: 28, filed: 8 },
  { month: "Aug", leads: 42, filed: 13 },
  { month: "Sep", leads: 47, filed: 15 },
  { month: "Oct", leads: 12, filed: 3 },
];

// "self_employed" -> "Self employed"
export const pretty = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

// 68400 -> "$68,400"
export const money = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

// Whole days between an ISO date and now (positive = in the past)
export const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
