// Scheduled job (EventBridge Scheduler -> Lambda, every 15 minutes):
// time-based automations, calendar sync and inbound email sync for every firm.
import type { Ctx } from "../context.js";
import { firms } from "../db/schema.js";
import { runTimeTriggers } from "../domain/automations.js";
import { pullCalendars } from "../integrations/calendar.js";
import { pullMail } from "../integrations/mailsync.js";

const STEPS = [
  ["automations", runTimeTriggers],
  ["calendar sync", pullCalendars],
  ["email sync", pullMail],
] as const;

export async function runScheduled(ctx: Ctx) {
  const all = await ctx.db.select({ firmId: firms.firmId }).from(firms);
  for (const { firmId } of all) {
    for (const [name, step] of STEPS) {
      // One firm's (or one step's) failure must not stop the others
      await step(ctx, firmId).catch((e) => console.error(firmId, name, e));
    }
  }
  return { firms: all.length };
}
