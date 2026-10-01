// One shared store for the whole CRM: data + the actions that change it.
// Demo data by default; with Supabase configured, clients load from / save to the database.
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ACTIVITIES, APPOINTMENTS, AUTOMATIONS, Activity, Appointment, Automation, CLIENTS, Client,
  DEADLINES, Deadline, INTEGRATIONS, Integration, STAGES, Stage, TRUSTEES,
} from "./data";

interface State {
  clients: Client[];
  activities: Activity[];
  deadlines: Deadline[];
  appointments: Appointment[];
  automations: Automation[];
  integrations: Integration[];
}

// What a new client looks like when it comes out of the intake form
export interface NewClient {
  form: Record<string, string>; // all intake answers
  files: File[]; // documents uploaded in the intake
  consult?: { date: string; time: string; kind: Appointment["kind"] }; // booked consultation
}

const DEMO: State = {
  clients: CLIENTS, activities: ACTIVITIES, deadlines: DEADLINES,
  appointments: APPOINTMENTS, automations: AUTOMATIONS, integrations: INTEGRATIONS,
};

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function useCRMState() {
  const [s, setS] = useState<State>(DEMO);
  const patch = (fn: (s: State) => Partial<State>) => setS((prev) => ({ ...prev, ...fn(prev) }));

  // Load real clients when Supabase is configured (keeps demo data if the table is empty)
  useEffect(() => {
    if (!supabase) return;
    supabase.from("clients").select("*").order("name").then(({ data }) => {
      if (data?.length) patch(() => ({ clients: data.map(rowToClient) }));
    });
  }, []);

  // Add an entry to a client's timeline
  const log = (clientId: string, type: Activity["type"], text: string, source?: string) =>
    patch((s) => ({ activities: [{ id: id(), clientId, type, text, at: now(), source }, ...s.activities] }));

  // Create a client from the intake form (+ documents + consultation)
  const addClient = async ({ form, files, consult }: NewClient) => {
    let clientId = id();
    if (supabase) {
      const { data, error } = await supabase.from("clients").insert({
        name: form.fullName, email: form.email, phone: form.phone, status: form.accountStatus || "lead",
        last_interaction: now(), metadata: { intake_data: form, source: "crm_intake" },
      }).select().single();
      if (error) throw error;
      clientId = data.id;
      // Upload intake documents to Storage
      for (const f of files) await supabase.storage.from("documents").upload(`${form.fullName}/${Date.now()}_${f.name}`, f);
    }
    const client: Client = {
      id: clientId, name: form.fullName, email: form.email, phone: form.phone,
      city: form.city ?? "", province: form.province ?? "",
      status: (form.accountStatus as Client["status"]) || "lead",
      stage: consult ? "Consultation booked" : "New lead",
      fileType: "Debt consultation", leadSource: form.leadSource || "other",
      totalDebt: 0, monthlyIncome: Number(form.monthlyIncome) || 0, risk: "medium",
      assignedTo: TRUSTEES[0], createdAt: now(), stageSince: now(), lastActivity: now(),
      docsReceived: [], intake: form,
    };
    patch((s) => ({ clients: [client, ...s.clients] }));
    log(clientId, "form", "Intake form completed");
    if (files.length) log(clientId, "note", `${files.length} document(s) uploaded at intake`);
    if (consult) addAppointment({ clientId, client: client.name, title: "Free consultation", date: consult.date, time: consult.time, kind: consult.kind, source: "CRM" });
    return client;
  };

  // Book an appointment and note it on the client's timeline
  const addAppointment = (a: Omit<Appointment, "id">) => {
    patch((s) => ({ appointments: [...s.appointments, { ...a, id: id() }] }));
    if (a.clientId) log(a.clientId, "booking", `${a.title} booked for ${new Date(a.date).toLocaleDateString()} at ${a.time}`);
  };

  // Move a file to another pipeline stage
  const setStage = (clientId: string, stage: Stage) => {
    patch((s) => ({ clients: s.clients.map((c) => (c.id === clientId ? { ...c, stage, stageSince: now() } : c)) }));
    log(clientId, "note", `Moved to “${stage}”`);
  };
  const shiftStage = (c: Client, by: 1 | -1) => {
    const next = STAGES[STAGES.indexOf(c.stage) + by];
    if (next) setStage(c.id, next);
  };

  // Toggle a received document on a client's checklist
  const toggleDoc = (clientId: string, doc: string) =>
    patch((s) => ({
      clients: s.clients.map((c) => c.id !== clientId ? c : {
        ...c, docsReceived: c.docsReceived.includes(doc) ? c.docsReceived.filter((d) => d !== doc) : [...c.docsReceived, doc],
      }),
    }));

  // Tick off a deadline / task
  const completeDeadline = (deadlineId: string) =>
    patch((s) => ({ deadlines: s.deadlines.map((d) => (d.id === deadlineId ? { ...d, done: true } : d)) }));

  // "Send" an email: logged on the timeline (real sending needs the Gmail/Outlook integration)
  const sendEmail = (clientIds: string[], subject: string) =>
    clientIds.forEach((cid) => log(cid, "email", `Email sent: “${subject}”`));

  const toggleAutomation = (aid: string) =>
    patch((s) => ({ automations: s.automations.map((a) => (a.id === aid ? { ...a, enabled: !a.enabled } : a)) }));

  const toggleIntegration = (iid: string) =>
    patch((s) => ({
      integrations: s.integrations.map((i) => i.id !== iid ? i : { ...i, connected: !i.connected, detail: i.connected ? "" : "Connected just now" }),
    }));

  return { ...s, log, addClient, addAppointment, setStage, shiftStage, toggleDoc, completeDeadline, sendEmail, toggleAutomation, toggleIntegration };
}

// Map a raw Supabase `clients` row onto the CRM's Client shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToClient(row: any): Client {
  const f = row.metadata?.intake_data ?? {};
  return {
    id: row.id, name: row.name, email: row.email ?? "", phone: row.phone ?? "",
    city: f.city ?? "", province: f.province ?? "", status: row.status ?? "lead",
    stage: row.metadata?.stage ?? "New lead", fileType: row.metadata?.fileType ?? "Debt consultation",
    leadSource: f.leadSource ?? "other", totalDebt: row.metadata?.totalDebt ?? 0,
    monthlyIncome: Number(f.monthlyIncome) || 0, risk: "medium", assignedTo: TRUSTEES[0],
    createdAt: row.created_at, stageSince: row.updated_at ?? row.created_at,
    lastActivity: row.last_interaction ?? row.created_at, docsReceived: [], intake: f,
  };
}

// ---------- React context plumbing ----------

type Store = ReturnType<typeof useCRMState>;
const Ctx = createContext<Store | null>(null);

export const CRMProvider = ({ children }: { children: ReactNode }) => (
  <Ctx.Provider value={useCRMState()}>{children}</Ctx.Provider>
);

export const useCRM = () => useContext(Ctx)!;
