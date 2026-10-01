// One shared store for the whole CRM: data, derived lookups and the actions that change it.
// Demo data by default; with Supabase configured, clients load from / save to the database.
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ACTIVITIES, APPOINTMENTS, AUTOMATIONS, Activity, Appointment, CLIENTS, Client,
  DEADLINES, INTEGRATIONS, STAGES, Stage, TRUSTEES,
} from "./data";

const DEMO = { clients: CLIENTS, activities: ACTIVITIES, deadlines: DEADLINES, appointments: APPOINTMENTS, automations: AUTOMATIONS, integrations: INTEGRATIONS };
type State = typeof DEMO;

// What the intake form hands over
export interface NewClient {
  form: Record<string, string>;
  files: File[];
  consult?: { date: string; time: string; kind: Appointment["kind"] };
}

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const flip = <T extends { id: string }>(list: T[], id: string, fn: (x: T) => T) => list.map((x) => (x.id === id ? fn(x) : x));

// Raw Supabase `clients` row -> Client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToClient = (row: any): Client => {
  const f = row.metadata?.intake_data ?? {};
  return {
    id: row.id, name: row.name, email: row.email ?? "", phone: row.phone ?? "", city: f.city ?? "", province: f.province ?? "",
    status: row.status ?? "lead", stage: row.metadata?.stage ?? "New lead", fileType: row.metadata?.fileType ?? "Debt consultation",
    leadSource: f.leadSource ?? "other", totalDebt: row.metadata?.totalDebt ?? 0, monthlyIncome: Number(f.monthlyIncome) || 0,
    risk: "medium", assignedTo: TRUSTEES[0], createdAt: row.created_at, stageSince: row.updated_at ?? row.created_at,
    lastActivity: row.last_interaction ?? row.created_at, docsReceived: [], intake: f,
  };
};

function useCRMState() {
  const [s, setS] = useState<State>(DEMO);

  // Actions only use functional updates, so they are created once and never change
  const actions = useMemo(() => {
    const patch = (fn: (s: State) => Partial<State>) => setS((p) => ({ ...p, ...fn(p) }));

    const log = (clientId: string, type: Activity["type"], text: string, source?: string) =>
      patch((s) => ({ activities: [{ id: uid(), clientId, type, text, at: now(), source }, ...s.activities] }));

    const addAppointment = (a: Omit<Appointment, "id">) => {
      patch((s) => ({ appointments: [...s.appointments, { ...a, id: uid() }] }));
      if (a.clientId) log(a.clientId, "booking", `${a.title} booked for ${new Date(a.date).toLocaleDateString()} at ${a.time}`);
    };

    const setStage = (id: string, stage: Stage) => {
      patch((s) => ({ clients: flip(s.clients, id, (c) => ({ ...c, stage, stageSince: now() })) }));
      log(id, "note", `Moved to “${stage}”`);
    };

    return {
      log, addAppointment, setStage,

      // Intake form -> client (+ Supabase row, documents, consultation)
      addClient: async ({ form, files, consult }: NewClient) => {
        let id = uid();
        if (supabase) {
          const { data, error } = await supabase.from("clients").insert({
            name: form.fullName, email: form.email, phone: form.phone, status: form.accountStatus || "lead",
            last_interaction: now(), metadata: { intake_data: form, source: "crm_intake" },
          }).select().single();
          if (error) throw error;
          id = data.id;
          await Promise.all(files.map((f) => supabase!.storage.from("documents").upload(`${id}/${Date.now()}_${f.name}`, f)));
        }
        const client: Client = {
          id, name: form.fullName, email: form.email, phone: form.phone, city: form.city ?? "", province: form.province ?? "",
          status: (form.accountStatus as Client["status"]) || "lead", stage: consult ? "Consultation booked" : "New lead",
          fileType: "Debt consultation", leadSource: form.leadSource || "other", totalDebt: 0, monthlyIncome: Number(form.monthlyIncome) || 0,
          risk: "medium", assignedTo: TRUSTEES[0], createdAt: now(), stageSince: now(), lastActivity: now(), docsReceived: [], intake: form,
        };
        patch((s) => ({ clients: [client, ...s.clients] }));
        log(id, "form", files.length ? `Intake completed with ${files.length} document(s)` : "Intake completed");
        if (consult) addAppointment({ clientId: id, client: client.name, title: "Free consultation", ...consult, source: "CRM" });
      },

      shiftStage: (c: Client, by: 1 | -1) => { const next = STAGES[STAGES.indexOf(c.stage) + by]; if (next) setStage(c.id, next); },

      toggleDoc: (id: string, doc: string) => patch((s) => ({
        clients: flip(s.clients, id, (c) => ({ ...c, docsReceived: c.docsReceived.includes(doc) ? c.docsReceived.filter((d) => d !== doc) : [...c.docsReceived, doc] })),
      })),

      completeDeadline: (id: string) => patch((s) => ({ deadlines: flip(s.deadlines, id, (d) => ({ ...d, done: true })) })),

      // Logged on the timeline (real sending needs a mailbox integration)
      sendEmail: (ids: string[], subject: string) => ids.forEach((id) => log(id, "email", `Email sent: “${subject}”`)),

      toggleAutomation: (id: string) => patch((s) => ({ automations: flip(s.automations, id, (a) => ({ ...a, enabled: !a.enabled })) })),

      toggleIntegration: (id: string) => patch((s) => ({
        integrations: flip(s.integrations, id, (i) => ({ ...i, connected: !i.connected, detail: i.connected ? "" : "Connected just now" })),
      })),

      loadClients: (rows: Client[]) => patch(() => ({ clients: rows })),
    };
  }, []);

  // Load real clients when Supabase is configured (keeps demo data if the table is empty)
  useEffect(() => {
    supabase?.from("clients").select("*").order("name").then(({ data, error }) => {
      if (error) console.error("Could not load clients:", error.message);
      else if (data?.length) actions.loadClients(data.map(rowToClient));
    });
  }, [actions]);

  // Derived lookups, recomputed only when the data changes
  return useMemo(() => {
    const byId = new Map(s.clients.map((c) => [c.id, c]));
    return {
      ...s, ...actions,
      byId,
      nameOf: (id?: string) => (id && byId.get(id)?.name) || "",
      openDeadlines: s.deadlines.filter((d) => !d.done).sort((a, b) => a.due.localeCompare(b.due)), // soonest first
    };
  }, [s, actions]);
}

// ---------- React context plumbing ----------

type Store = ReturnType<typeof useCRMState>;
const Ctx = createContext<Store | null>(null);
export const CRMProvider = ({ children }: { children: ReactNode }) => <Ctx.Provider value={useCRMState()}>{children}</Ctx.Provider>;
export const useCRM = () => useContext(Ctx)!;
