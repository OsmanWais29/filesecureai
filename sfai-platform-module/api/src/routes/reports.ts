// /reports: every number on the Reports and Dashboard screens, computed in SQL.
import { and, count, eq, gte, isNull, lt, sql } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { appointments, clients, deadlines, firms } from "../db/schema.js";
import { router } from "../lib/http.js";

const ACTIVE = sql`${clients.stage} in ('Filed', 'In administration')`;
const CONVERTED = sql`${clients.stage} in ('Filed', 'In administration', 'Discharged')`;
const countIf = (cond: ReturnType<typeof sql>) =>
  sql<number>`count(*) filter (where ${cond})`.mapWith(Number);
const debtIf = (cond: ReturnType<typeof sql>) =>
  sql<number>`coalesce(sum(${clients.totalDebt}) filter (where ${cond}), 0)`.mapWith(
    Number,
  );

// Shared "group clients by X" query: leads + how many converted to a filing
type GroupCol =
  typeof clients.leadSource | typeof clients.stage | typeof clients.fileType;
async function groupBy(ctx: Ctx, firmId: string, col: GroupCol) {
  return ctx.db
    .select({ key: col, leads: count(), filed: countIf(CONVERTED) })
    .from(clients)
    .where(eq(clients.firmId, firmId))
    .groupBy(col);
}

export default (ctx: Ctx) =>
  router().get("/summary", async (c) => {
    const { firmId } = c.get("user");
    const mine = eq(clients.firmId, firmId);
    const monthAgo = new Date(Date.now() - 30 * 86_400_000);
    const sixMonths = new Date(Date.now() - 183 * 86_400_000);

    // Headline numbers
    const [totals] = await ctx.db
      .select({
        clients: count(),
        newLeads: countIf(gte(clients.createdAt, monthAgo)!),
        active: countIf(ACTIVE),
        converted: countIf(CONVERTED),
        debtUnderAdmin: debtIf(ACTIVE),
        convertedDebt: debtIf(CONVERTED),
      })
      .from(clients)
      .where(mine);

    const [{ overdue }] = await ctx.db
      .select({ overdue: count() })
      .from(deadlines)
      .where(
        and(
          eq(deadlines.firmId, firmId),
          isNull(deadlines.doneAt),
          lt(deadlines.dueAt, new Date()),
        ),
      );

    // "Today" in the firm's own timezone (Lambda runs in UTC)
    const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, firmId));
    const tz = firm?.timezone ?? "America/Toronto";
    const isToday = sql`(${appointments.startsAt} at time zone ${tz})::date
      = (now() at time zone ${tz})::date`;
    const [{ appointmentsToday }] = await ctx.db
      .select({ appointmentsToday: count() })
      .from(appointments)
      .where(and(eq(appointments.firmId, firmId), isToday));

    // Leads and filings per month (last 6 months)
    const month = sql<string>`to_char(${clients.createdAt}, 'YYYY-MM')`;
    const byMonth = await ctx.db
      .select({ month, leads: count(), filed: countIf(CONVERTED) })
      .from(clients)
      .where(and(mine, gte(clients.createdAt, sixMonths)))
      .groupBy(month)
      .orderBy(month);

    return c.json({
      ...totals,
      conversionRate: totals.clients ? totals.converted / totals.clients : 0,
      avgDebtPerFiling: totals.converted
        ? Math.round(totals.convertedDebt / totals.converted)
        : 0,
      overdue,
      appointmentsToday,
      byMonth,
      bySource: await groupBy(ctx, firmId, clients.leadSource),
      byStage: await groupBy(ctx, firmId, clients.stage),
      byFileType: await groupBy(ctx, firmId, clients.fileType),
    });
  });
