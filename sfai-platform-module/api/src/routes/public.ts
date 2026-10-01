// Public endpoints (no login): website lead form, its embed script, and the booking page.
// The firm is identified by its random public key, never by an internal id.
// Abuse protection: API Gateway throttling (see infra) + a hidden "honeypot" field.
import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { appointments, clients, firms } from "../db/schema.js";
import { fire } from "../domain/automations.js";
import { logActivity, when } from "../domain/firm.js";
import { pushAppointment } from "../integrations/calendar.js";
import { body, fail, found, router } from "../lib/http.js";

const Person = {
  name: z.string().min(1).max(200),
  email: z.email(),
  phone: z.string().max(40).optional(),
  // Honeypot: a hidden field that real people leave empty
  company_website: z.string().optional(),
};

// How far `tz` is ahead of UTC at a given instant (ms), e.g. Toronto = -4h in summer
function tzOffset(instant: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(instant);
  const p = Object.fromEntries(parts.map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - instant;
}

// Wall-clock time in `tz` (date + minutes after midnight) -> real instant
function atZone(date: string, minutes: number, tz: string) {
  const asUtc = Date.parse(`${date}T00:00:00Z`) + minutes * 60_000;
  return new Date(asUtc - tzOffset(asUtc, tz));
}

// Free slots on a day: working hours minus existing appointments, future only
async function freeSlots(ctx: Ctx, firm: typeof firms.$inferSelect, date: string) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (!firm.hours.days.includes(weekday)) return [];
  const step = firm.slotMinutes;
  const starts: Date[] = [];
  for (let m = firm.hours.start * 60; m + step <= firm.hours.end * 60; m += step) {
    starts.push(atZone(date, m, firm.timezone));
  }
  const taken = await ctx.db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.firmId, firm.firmId),
        gte(appointments.startsAt, new Date(+starts[0] - 86_400_000)),
        lt(appointments.startsAt, new Date(+starts[starts.length - 1] + 86_400_000)),
      ),
    );
  const overlaps = (s: Date) =>
    taken.some(
      (a) => +s < +a.startsAt + a.minutes * 60_000 && +a.startsAt < +s + step * 60_000,
    );
  return starts.filter((s) => +s > Date.now() && !overlaps(s));
}

// Find the client by email, or create a new lead
async function findOrCreateLead(
  ctx: Ctx,
  firmId: string,
  p: z.infer<z.ZodObject<typeof Person>>,
) {
  const [existing] = await ctx.db
    .select()
    .from(clients)
    .where(and(eq(clients.firmId, firmId), eq(clients.email, p.email)));
  if (existing) return { client: existing, isNew: false };
  const [client] = await ctx.db
    .insert(clients)
    .values({
      firmId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      leadSource: "website",
    })
    .returning();
  return { client, isNew: true };
}

// Tiny script for the trustee's website: renders a form that posts leads here.
// Usage: <script src=".../public/embed.js" data-key="FIRM_PUBLIC_KEY" async></script>
const FORM_HTML = [
  '<input name="name" placeholder="Full name" required>',
  '<input name="email" type="email" placeholder="Email" required>',
  '<input name="phone" placeholder="Phone">',
  '<textarea name="message" placeholder="How can we help?"></textarea>',
  '<input name="company_website" style="display:none" tabindex="-1">',
  "<button>Request a free consultation</button>",
].join("");

const embedJs = (api: string) => `(() => {
  const s = document.currentScript, f = document.createElement("form");
  f.innerHTML = ${JSON.stringify(FORM_HTML)};
  f.onsubmit = async (e) => {
    e.preventDefault();
    const r = await fetch("${api}/" + s.dataset.key + "/leads", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(f))),
    });
    f.innerHTML = r.ok ? "<p>Thanks! A trustee will contact you shortly.</p>"
      : "<p>Sorry, something went wrong. Please call us.</p>";
  };
  s.after(f);
})();`;

export default (ctx: Ctx) => {
  // Look up the firm from the public key in the URL
  const firmFor = async (key: string) =>
    found((await ctx.db.select().from(firms).where(eq(firms.publicKey, key)))[0], "Firm");

  return (
    router()
      .get("/embed.js", (c) => {
        c.header("content-type", "application/javascript");
        c.header("cache-control", "public, max-age=3600");
        return c.body(embedJs(`${ctx.cfg.publicApiUrl}${ctx.cfg.basePath}/public`));
      })

      // Website lead form
      .post("/:key/leads", async (c) => {
        const firm = await firmFor(c.req.param("key"));
        const data = await body(
          c,
          z.object({ ...Person, message: z.string().max(2000).optional() }),
        );
        // Bot filled the hidden field: pretend it worked, save nothing
        if (data.company_website) return c.json({ ok: true }, 201);
        const { client, isNew } = await findOrCreateLead(ctx, firm.firmId, data);
        await logActivity(ctx, firm.firmId, {
          clientId: client.id,
          type: "form",
          source: "Website form",
          text: data.message
            ? `Website enquiry: ${data.message}`
            : "Submitted the website form",
        });
        if (isNew) await fire(ctx, client, "lead.created");
        return c.json({ ok: true }, 201);
      })

      // Booking page: free slots for ?date=YYYY-MM-DD
      .get("/:key/slots", async (c) => {
        const firm = await firmFor(c.req.param("key"));
        const date = c.req.query("date") ?? "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw fail(400, "date must be YYYY-MM-DD");
        return c.json({
          slots: await freeSlots(ctx, firm, date),
          minutes: firm.slotMinutes,
        });
      })

      // Booking page: book a free slot
      .post("/:key/bookings", async (c) => {
        const firm = await firmFor(c.req.param("key"));
        const data = await body(
          c,
          z.object({
            ...Person,
            startsAt: z.iso.datetime(),
            kind: z.enum(["video", "phone", "in_person"]),
          }),
        );
        // Bot filled the hidden field: pretend it worked, save nothing
        if (data.company_website) return c.json({ ok: true }, 201);
        const start = new Date(data.startsAt);
        const free = await freeSlots(ctx, firm, data.startsAt.slice(0, 10));
        if (!free.some((s) => +s === +start))
          throw fail(409, "That time is no longer available");

        const { client, isNew } = await findOrCreateLead(ctx, firm.firmId, data);
        const [appt] = await ctx.db
          .insert(appointments)
          .values({
            firmId: firm.firmId,
            clientId: client.id,
            title: "Free consultation",
            startsAt: start,
            minutes: firm.slotMinutes,
            kind: data.kind,
            source: "Website booking",
          })
          .returning();
        await ctx.db
          .update(clients)
          .set({ stage: "Consultation booked", stageSince: new Date() })
          .where(and(eq(clients.id, client.id), eq(clients.stage, "New lead")));
        await pushAppointment(ctx, appt).catch((e) =>
          console.error("Calendar push failed", e),
        );
        const date = await when(ctx, firm.firmId, start);
        await logActivity(ctx, firm.firmId, {
          clientId: client.id,
          type: "booking",
          source: "Website booking",
          text: `Booked a free consultation for ${date}`,
        });
        if (isNew) await fire(ctx, client, "lead.created");
        await fire(ctx, client, "appointment.booked", appt.id, { date });
        return c.json({ ok: true, startsAt: start }, 201);
      })
  );
};
