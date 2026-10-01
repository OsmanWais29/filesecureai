// Automation engine: "when TRIGGER happens for a client, do ACTION".
// Event triggers fire from routes; time triggers are checked by the hourly job.
// Every run is recorded once per (automation, client, occurrence): nothing sends twice.
import { and, eq, isNull, lt, sql } from "drizzle-orm";
import type { Ctx } from "../context.js";
import {
  automationRuns,
  automations,
  clients,
  deadlines,
  firms,
  templates,
  type Client,
} from "../db/schema.js";
import { fill, logActivity } from "./firm.js";
import { REQUIRED_DOCS } from "./rules.js";

export const TRIGGERS = [
  "lead.created",
  "appointment.booked", // events
  "docs.missing.3d",
  "deadline.due.5d",
  "contact.none.14d", // time-based
] as const;
export const ACTIONS = [
  "email.template",
  "sms.reminder",
  "task.callback",
  "notify.trustee",
] as const;

type Extra = Record<string, string>; // extra template values, e.g. { deadline, date }

// Run every enabled automation for this trigger + client
export async function fire(
  ctx: Ctx,
  client: Client,
  trigger: string,
  occurrence = "once",
  extra: Extra = {},
) {
  const rules = await ctx.db
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.firmId, client.firmId),
        eq(automations.trigger, trigger),
        eq(automations.enabled, true),
      ),
    );
  for (const rule of rules) {
    // Claim this run first; if it already ran, the insert does nothing
    const claimed = await ctx.db
      .insert(automationRuns)
      .values({ automationId: rule.id, clientId: client.id, occurrence })
      .onConflictDoNothing()
      .returning();
    if (!claimed.length) continue;
    try {
      await runAction(ctx, client, rule.action, rule.templateKey, extra);
      await ctx.db
        .update(automations)
        .set({ runs: sql`${automations.runs} + 1` })
        .where(eq(automations.id, rule.id));
    } catch (err) {
      // Release the claim so the next hourly run retries it
      await ctx.db
        .delete(automationRuns)
        .where(
          and(
            eq(automationRuns.automationId, rule.id),
            eq(automationRuns.clientId, client.id),
            eq(automationRuns.occurrence, occurrence),
          ),
        );
      console.error(`Automation ${rule.trigger} -> ${rule.action} failed`, err);
    }
  }
}

async function runAction(
  ctx: Ctx,
  c: Client,
  action: string,
  templateKey: string | null,
  extra: Extra,
) {
  const [tpl] = templateKey
    ? await ctx.db
        .select()
        .from(templates)
        .where(and(eq(templates.firmId, c.firmId), eq(templates.key, templateKey)))
    : [];
  const log = (type: string, text: string) =>
    logActivity(ctx, c.firmId, {
      clientId: c.id,
      type,
      text,
      source: "Automation",
      actor: "system",
    });

  if (action === "email.template" && tpl && c.email) {
    const subject = fill(tpl.subject, c, extra);
    await ctx.svc.mail(c.firmId, {
      to: c.email,
      subject,
      text: fill(tpl.body, c, extra),
    });
    return log("email", `Email sent: “${subject}”`);
  }
  if (action === "sms.reminder" && c.phone) {
    const text = tpl ? fill(tpl.subject, c, extra) : "Reminder from your trustee";
    await ctx.svc.sms(c.firmId, c.phone, text);
    return log("automation", `Text sent: “${text}”`);
  }
  if (action === "task.callback") {
    const dueAt = new Date(Date.now() + 3_600_000); // call back within the hour
    await ctx.db.insert(deadlines).values({
      firmId: c.firmId,
      clientId: c.id,
      title: "Call back new lead",
      dueAt,
    });
    return log("automation", "Call-back task created");
  }
  if (action === "notify.trustee") {
    const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, c.firmId));
    if (!firm?.notifyEmail) return;
    await ctx.svc.mail(c.firmId, {
      to: firm.notifyEmail,
      subject: `File needs attention: ${c.name}`,
      text: `${c.name} (${c.stage}) has had no contact for 14 days.`,
    });
    return log("automation", "Trustee notified: no contact in 14 days");
  }
}

// Hourly: find clients matching each time-based trigger and fire it
export async function runTimeTriggers(ctx: Ctx, firmId: string) {
  const day = 86_400_000;
  const now = Date.now();
  const open = and(eq(clients.firmId, firmId), sql`${clients.stage} <> 'Discharged'`);

  // Documents still missing 3+ days after the file was opened
  const older = await ctx.db
    .select()
    .from(clients)
    .where(and(open, lt(clients.createdAt, new Date(now - 3 * day))));
  for (const c of older.filter((c) => c.docsReceived.length < REQUIRED_DOCS.length)) {
    await fire(ctx, c, "docs.missing.3d");
  }

  // No contact for 14+ days
  const quiet = older.filter((c) => +c.lastContactAt < now - 14 * day);
  for (const c of quiet)
    await fire(ctx, c, "contact.none.14d", c.lastContactAt.toISOString());

  // Deadlines due within 5 days (once per deadline)
  const due = await ctx.db
    .select({ d: deadlines, c: clients })
    .from(deadlines)
    .innerJoin(clients, eq(clients.id, deadlines.clientId))
    .where(
      and(
        eq(deadlines.firmId, firmId),
        isNull(deadlines.doneAt),
        lt(deadlines.dueAt, new Date(now + 5 * day)),
      ),
    );
  for (const { d, c } of due.filter(({ d }) => +d.dueAt > now)) {
    await fire(ctx, c, "deadline.due.5d", d.id, {
      deadline: d.title,
      date: d.dueAt.toDateString(),
    });
  }
}
