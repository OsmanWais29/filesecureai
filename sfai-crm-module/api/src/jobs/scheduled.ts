// Hourly job (EventBridge Scheduler -> Lambda): time-based automations + calendar sync.
import type { Ctx } from "../context.js";
import { firms } from "../db/schema.js";
import { runTimeTriggers } from "../domain/automations.js";
import { pullCalendars } from "../integrations/calendar.js";

export async function runScheduled(ctx: Ctx) {
  const all = await ctx.db.select({ firmId: firms.firmId }).from(firms);
  for (const { firmId } of all) {
    // One firm's failure must not stop the others
    await runTimeTriggers(ctx, firmId).catch((e) =>
      console.error(firmId, "automations", e),
    );
    await pullCalendars(ctx, firmId).catch((e) =>
      console.error(firmId, "calendar sync", e),
    );
  }
  return { firms: all.length };
}
