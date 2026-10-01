// Two-way calendar sync with Google Calendar and Outlook (Microsoft 365).
// Push: CRM appointments become calendar events.
// Pull: events in the next 30 days show up in the CRM schedule.
import { and, eq, isNotNull } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { appointments, integrations, type Appointment } from "../db/schema.js";
import { accessToken, type OAuthProvider } from "./oauth.js";

interface CalEvent {
  id: string;
  title: string;
  start: Date;
  minutes: number;
}

const GOOGLE = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Provider-specific URLs and JSON shapes, side by side
const API = {
  google: {
    source: "Google Calendar",
    base: GOOGLE,
    body: (a: Appointment, end: Date) => ({
      summary: a.title,
      start: { dateTime: a.startsAt.toISOString() },
      end: { dateTime: end.toISOString() },
    }),
    list: (from: Date, to: Date) =>
      GOOGLE +
      "?singleEvents=true&orderBy=startTime" +
      `&timeMin=${from.toISOString()}&timeMax=${to.toISOString()}`,
    parse: (json: any): CalEvent[] =>
      (json.items ?? [])
        .filter((e: any) => e.start?.dateTime)
        .map((e: any) => toEvent(e.id, e.summary, e.start.dateTime, e.end.dateTime)),
  },
  microsoft: {
    source: "Outlook",
    base: "https://graph.microsoft.com/v1.0/me/events",
    body: (a: Appointment, end: Date) => ({
      subject: a.title,
      start: { dateTime: a.startsAt.toISOString(), timeZone: "UTC" },
      end: { dateTime: end.toISOString(), timeZone: "UTC" },
    }),
    list: (from: Date, to: Date) =>
      "https://graph.microsoft.com/v1.0/me/calendarView" +
      `?$select=id,subject,start,end` +
      `&startDateTime=${from.toISOString()}&endDateTime=${to.toISOString()}`,
    parse: (json: any): CalEvent[] =>
      (json.value ?? []).map((e: any) =>
        toEvent(e.id, e.subject, e.start.dateTime + "Z", e.end.dateTime + "Z"),
      ),
  },
};

function toEvent(id: string, title: string, start: string, end: string): CalEvent {
  const s = new Date(start);
  return {
    id,
    title: title || "Busy",
    start: s,
    minutes: Math.round((+new Date(end) - +s) / 60_000),
  };
}

// Which calendars the firm has connected
async function connected(ctx: Ctx, firmId: string) {
  const rows = await ctx.db
    .select({ p: integrations.provider })
    .from(integrations)
    .where(eq(integrations.firmId, firmId));
  return rows.map((r) => r.p).filter((p): p is OAuthProvider => p in API);
}

const authed = (token: string) => ({
  authorization: `Bearer ${token}`,
  "content-type": "application/json",
  prefer: 'outlook.timezone="UTC"', // Graph: return times in UTC (ignored by Google)
});

// Push one appointment to the first connected calendar; remember the event id
export async function pushAppointment(ctx: Ctx, a: Appointment) {
  const [p] = await connected(ctx, a.firmId);
  const token = p && (await accessToken(ctx, a.firmId, p));
  if (!p || !token) return;
  const end = new Date(a.startsAt.getTime() + a.minutes * 60_000);
  const res = await ctx.svc.fetch(API[p].base, {
    method: "POST",
    headers: authed(token),
    body: JSON.stringify(API[p].body(a, end)),
  });
  if (!res.ok) throw new Error(`${p} calendar push failed (${res.status})`);
  const { id } = (await res.json()) as { id: string };
  await ctx.db
    .update(appointments)
    .set({ externalId: id })
    .where(eq(appointments.id, a.id));
}

// Pull the next 30 days from every connected calendar into the CRM
export async function pullCalendars(ctx: Ctx, firmId: string) {
  const from = new Date();
  const to = new Date(from.getTime() + 30 * 86_400_000);
  // Event ids we already know about (including ones we pushed ourselves)
  const known = new Set(
    (
      await ctx.db
        .select({ id: appointments.externalId })
        .from(appointments)
        .where(and(eq(appointments.firmId, firmId), isNotNull(appointments.externalId)))
    ).map((r) => r.id),
  );

  for (const p of await connected(ctx, firmId)) {
    const token = await accessToken(ctx, firmId, p);
    if (!token) continue;
    const res = await ctx.svc.fetch(API[p].list(from, to), { headers: authed(token) });
    if (!res.ok) throw new Error(`${p} calendar pull failed (${res.status})`);
    const fresh = API[p].parse(await res.json()).filter((e) => !known.has(e.id));
    if (fresh.length) {
      await ctx.db
        .insert(appointments)
        .values(
          fresh.map((e) => ({
            firmId,
            title: e.title,
            startsAt: e.start,
            minutes: e.minutes,
            source: API[p].source,
            externalId: e.id,
          })),
        )
        .onConflictDoNothing();
    }
    await ctx.db
      .update(integrations)
      .set({ lastSyncAt: new Date() })
      .where(and(eq(integrations.firmId, firmId), eq(integrations.provider, p)));
  }
}
