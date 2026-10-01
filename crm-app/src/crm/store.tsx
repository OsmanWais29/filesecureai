// One shared store for the CRM screens. Data comes from the backend (api.ts);
// every action calls the API, then reloads, so the screens always show the server's truth.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, type Draft, type Integrations } from "./api";
import {
  INTEGRATION_CATALOG, STAGES,
  type Activity, type Appointment, type Automation, type Client, type Deadline,
  type Integration, type Stage, type Template,
} from "./data";

interface Data {
  clients: Client[];
  activities: Activity[];
  deadlines: Deadline[];
  appointments: Appointment[];
  automations: Automation[];
  templates: Template[];
  integrations: Integrations;
  drafts: Draft[];
}

// What the intake form hands over
export interface NewClient {
  form: Record<string, string>;
  files: File[];
  consult?: { date: string; time: string; kind: Appointment["kind"] };
}

// "2026-10-04T04:00:00.000Z" + "2:00 PM" -> the real instant (local time)
function at(dateIso: string, time: string) {
  const d = new Date(dateIso);
  const [, h, m, pm] = time.match(/(\d+):(\d+)\s*(AM|PM)/i) ?? [];
  d.setHours((Number(h) % 12) + (/pm/i.test(pm ?? "") ? 12 : 0), Number(m), 0, 0);
  return d.toISOString();
}

function useCRMState() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  // (Re)load everything from the backend
  const refresh = useCallback(async () => {
    try {
      setData(await api.loadAll());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => void refresh(), [refresh]);

  // Run an API call, then reload; show the server's error message if it fails
  const run = useCallback(
    async <T,>(work: () => Promise<T>, done?: string): Promise<T | undefined> => {
      try {
        const out = await work();
        await refresh();
        if (done) toast.success(done);
        return out;
      } catch (e) {
        toast.error((e as Error).message);
        return undefined;
      }
    },
    [refresh],
  );

  const actions = useMemo(() => ({
    refresh,

    // Intake form -> client, then documents, then the booked consultation
    addClient: async ({ form, files, consult }: NewClient) => {
      const { fullName, email, phone, city, province, accountStatus, leadSource, monthlyIncome, sin, ...rest } = form;
      const created = await api.createClient({
        name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        city: city || undefined,
        province: province || undefined,
        status: accountStatus || undefined,
        leadSource: leadSource || undefined,
        monthlyIncome: Number(monthlyIncome) || undefined,
        sin: sin || undefined, // encrypted by the backend, never stored in plain text
        intake: Object.fromEntries(Object.entries(rest).filter(([, v]) => v)),
      });
      for (const f of files) await api.uploadDocument(created.id, f);
      if (consult) {
        await api.createAppointment({
          clientId: created.id, title: "Free consultation",
          startsAt: at(consult.date, consult.time), kind: consult.kind,
        });
        await api.updateClient(created.id, { stage: "Consultation booked" });
      }
      await refresh();
    },

    addAppointment: (a: { clientId: string; title: string; date: string; time: string; kind: string }) =>
      run(() => api.createAppointment({ ...a, startsAt: at(a.date, a.time) }), `${a.title} booked`),

    setStage: (id: string, stage: Stage) => run(() => api.updateClient(id, { stage })),
    shiftStage: (c: Client, by: 1 | -1) => {
      const next = STAGES[STAGES.indexOf(c.stage) + by];
      return next && run(() => api.updateClient(c.id, { stage: next }), `Moved to ${next}`);
    },
    toggleDoc: (id: string, doc: string, received: boolean) => run(() => api.setDoc(id, doc, received)),
    completeDeadline: (id: string) => run(() => api.completeDeadline(id), "Marked done"),

    sendEmail: (ids: string[], subject: string, text: string, replyToId?: string) =>
      run(() => api.sendEmail(ids, subject, text, replyToId)),
    sendDraft: (id: string) => run(() => api.sendDraft(id), "Draft sent"),
    discardDraft: (id: string) => run(() => api.discardDraft(id), "Draft discarded"),

    toggleAutomation: (a: Automation) => run(() => api.toggleAutomation(a.id, !a.enabled)),

    // Google / Microsoft: go to their sign-in page; they send the user back to the CRM
    connect: async (provider: string) => {
      try {
        window.location.href = (await api.connectUrl(provider)).url;
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    connectTwilio: (body: { accountSid: string; authToken: string; from: string }) =>
      run(() => api.connectTwilio(body), "Twilio connected"),
    disconnect: (provider: string) => run(() => api.disconnect(provider), "Disconnected"),
    syncNow: () => run(async () => { await api.syncEmail(); await api.syncCalendar(); }, "Synced"),
    uploadDocuments: (clientId: string, files: File[]) =>
      run(async () => { for (const f of files) await api.uploadDocument(clientId, f); }),
  }), [refresh, run]);

  // Derived lookups, recomputed only when the data changes
  const derived = useMemo(() => {
    const d = data;
    const byId = new Map((d?.clients ?? []).map((c) => [c.id, c]));
    const connected = new Map((d?.integrations.connected ?? []).map((i) => [i.provider, i]));
    // Catalog card + live status from the backend
    const integrations: (Integration & { provider: string })[] = INTEGRATION_CATALOG.map((i) => {
      const row = connected.get(i.provider);
      const builtin = i.provider === "builtin";
      const detail = row ? [row.account, row.lastSyncAt && `synced ${new Date(row.lastSyncAt).toLocaleString()}`]
        .filter(Boolean).join(" · ") : builtin ? "Built in" : "";
      return { ...i, connected: builtin || !!row, detail };
    });
    return {
      byId,
      integrations,
      nameOf: (id?: string) => (id && byId.get(id)?.name) || "",
      openDeadlines: (d?.deadlines ?? []).filter((x) => !x.done).sort((a, b) => a.due.localeCompare(b.due)),
    };
  }, [data]);

  return {
    ready: !!data,
    error,
    clients: data?.clients ?? [],
    activities: data?.activities ?? [],
    deadlines: data?.deadlines ?? [],
    appointments: data?.appointments ?? [],
    automations: data?.automations ?? [],
    templates: data?.templates ?? [],
    drafts: data?.drafts ?? [],
    website: data?.integrations.website,
    available: data?.integrations.available ?? {},
    ...derived,
    ...actions,
  };
}

// ---------- React context plumbing ----------

type Store = ReturnType<typeof useCRMState>;
const Ctx = createContext<Store | null>(null);
export const CRMProvider = ({ children }: { children: ReactNode }) => (
  <Ctx.Provider value={useCRMState()}>{children}</Ctx.Provider>
);
export const useCRM = () => useContext(Ctx)!;
