// CRM types + demo data. Everything the CRM shows lives here, so swapping
// demo data for real API data later means touching one file.

// ---------- Types ----------

// Risk / priority levels used across the module
export type Level = "low" | "medium" | "high";

// One client in the CRM
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "lead" | "inactive";
  risk: Level;
  health: number; // 0-100 account health score
  progress: number; // 0-100 case progress
  assignedTo: string;
  tags: string[];
  lastActivity: string; // ISO date
}

// One event on a client's timeline
export interface Activity {
  id: string;
  clientId: string;
  type: "email" | "call" | "meeting" | "note" | "form";
  text: string;
  at: string; // ISO date
}

// One calendar appointment
export interface Appointment {
  id: string;
  client: string;
  title: string;
  date: Date;
  time: string;
  priority: Level;
}

// One video / phone / in-person meeting
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string; // ISO date
  client_name?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  meeting_type?: "video" | "phone" | "in_person";
  meeting_url?: string;
}

// One staff member's weekly busy blocks
export interface Staff {
  id: string;
  name: string;
  role: string;
  busy: Record<string, string[]>; // weekday -> busy ranges
}

// ---------- Helpers for building relative dates ----------

const DAY = 86_400_000; // one day in ms
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * DAY);

// ---------- Demo data ----------

export const CLIENTS: Client[] = [
  { id: "c1", name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567", company: "Smith Enterprises", status: "active", risk: "medium", health: 75, progress: 65, assignedTo: "Sarah Johnson", tags: ["Consumer Proposal", "Priority"], lastActivity: ago(1) },
  { id: "c2", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(555) 234-5678", company: "Marketing Pro Ltd.", status: "active", risk: "low", health: 88, progress: 80, assignedTo: "John Doe", tags: ["Bankruptcy"], lastActivity: ago(2) },
  { id: "c3", name: "Michael Brown", email: "m.brown@email.com", phone: "(555) 345-6789", company: "Construction Corp", status: "active", risk: "high", health: 35, progress: 20, assignedTo: "Jane Smith", tags: ["Corporate", "Complex"], lastActivity: ago(18) },
  { id: "c4", name: "Emily Davis", email: "emily.d@email.com", phone: "(555) 456-7890", company: "Retail Express", status: "lead", risk: "medium", health: 55, progress: 10, assignedTo: "Sarah Johnson", tags: ["New Lead"], lastActivity: ago(5) },
  { id: "c5", name: "David Wilson", email: "d.wilson@email.com", phone: "(555) 567-8901", company: "Financial Services Co.", status: "inactive", risk: "low", health: 90, progress: 100, assignedTo: "John Doe", tags: ["Discharged"], lastActivity: ago(40) },
];

export const ACTIVITIES: Activity[] = [
  { id: "a1", clientId: "c1", type: "email", text: "Sent document requirements email", at: ago(0.1) },
  { id: "a2", clientId: "c1", type: "call", text: "Initial consultation call completed", at: ago(1) },
  { id: "a3", clientId: "c1", type: "meeting", text: "Document review meeting booked", at: ago(3) },
  { id: "a4", clientId: "c2", type: "form", text: "Submitted contact request form", at: ago(2) },
  { id: "a5", clientId: "c2", type: "note", text: "Added budget assessment notes", at: ago(6) },
  { id: "a6", clientId: "c3", type: "call", text: "Left voicemail about missing statements", at: ago(18) },
  { id: "a7", clientId: "c4", type: "email", text: "Opened monthly newsletter", at: ago(5) },
  { id: "a8", clientId: "c5", type: "meeting", text: "Final discharge meeting", at: ago(40) },
];

export const APPOINTMENTS: Appointment[] = [
  { id: "p1", client: "John Smith", title: "Initial Consultation", date: ahead(0), time: "10:00 AM", priority: "high" },
  { id: "p2", client: "Sarah Johnson", title: "Document Review", date: ahead(0), time: "2:30 PM", priority: "medium" },
  { id: "p3", client: "Emily Davis", title: "Follow-up Meeting", date: ahead(1), time: "11:00 AM", priority: "low" },
  { id: "p4", client: "Michael Brown", title: "Case Discussion", date: ahead(3), time: "3:00 PM", priority: "high" },
];

export const MEETINGS: Meeting[] = [
  { id: "m1", title: "Initial Consultation", description: "Discuss options and financial assessment", start_time: ahead(0.1).toISOString(), client_name: "John Smith", status: "scheduled", meeting_type: "video", meeting_url: "https://zoom.us/j/123456789" },
  { id: "m2", title: "Follow-up Call", description: "Review submitted documents and next steps", start_time: ahead(1).toISOString(), client_name: "Sarah Johnson", status: "scheduled", meeting_type: "phone", meeting_url: "tel:+15552345678" },
  { id: "m3", title: "Document Signing", description: "Sign papers and finalize the process", start_time: ahead(2).toISOString(), client_name: "Michael Brown", status: "scheduled", meeting_type: "in_person" },
];

export const STAFF: Staff[] = [
  { id: "s1", name: "John Doe", role: "Licensed Insolvency Trustee", busy: { Monday: ["9:00-10:30", "2:00-3:30"], Tuesday: ["11:00-12:30"], Thursday: ["9:00-4:30"], Friday: ["1:00-2:30"] } },
  { id: "s2", name: "Jane Smith", role: "Financial Counselor", busy: { Monday: ["11:00-1:00"], Tuesday: ["9:00-11:30"], Wednesday: ["10:00-11:30"], Friday: ["2:00-4:30"] } },
];

// Hours of each kind of work per week (analytics chart)
export const TIME_ALLOCATION = [
  { name: "Client meetings", hours: 42 },
  { name: "Documentation", hours: 28 },
  { name: "Admin", hours: 18 },
  { name: "Follow-ups", hours: 8 },
];

// Meetings held per weekday (analytics chart)
export const WEEKLY_MEETINGS = [
  { day: "Mon", meetings: 8 },
  { day: "Tue", meetings: 11 },
  { day: "Wed", meetings: 6 },
  { day: "Thu", meetings: 12 },
  { day: "Fri", meetings: 5 },
];
