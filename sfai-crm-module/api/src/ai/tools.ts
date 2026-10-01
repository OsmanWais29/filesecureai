// Tools the assistant can use. Read tools query this firm's data only.
// "draft_email" never sends: it returns a draft the user must confirm in the UI.
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { and, desc, eq, ilike, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { activities, clients, deadlines } from "../db/schema.js";
import { REQUIRED_DOCS, STAGES } from "../domain/rules.js";

export interface EmailDraft {
  clientIds: string[];
  subject: string;
  text: string;
}

const json = (v: unknown) => JSON.stringify(v);
const day = 86_400_000;

// Compact client summary for the model (no SIN, no full intake)
const brief = (c: typeof clients.$inferSelect) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  stage: c.stage,
  fileType: c.fileType,
  totalDebt: c.totalDebt,
  leadSource: c.leadSource,
  estateNumber: c.estateNumber,
  daysSinceContact: Math.floor((Date.now() - +c.lastContactAt) / day),
  daysInStage: Math.floor((Date.now() - +c.stageSince) / day),
  missingDocs: REQUIRED_DOCS.filter((d) => !c.docsReceived.includes(d)),
});

export function crmTools(ctx: Ctx, firmId: string, drafts: EmailDraft[]) {
  const mine = eq(clients.firmId, firmId);

  return [
    betaZodTool({
      name: "search_clients",
      description:
        "Find clients by name/email and/or pipeline stage. " +
        "Returns stage, debt, days since last contact and missing documents.",
      inputSchema: z.object({
        query: z.string().optional().describe("Part of a name or email"),
        stage: z.enum(STAGES).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
      run: async ({ query, stage, limit = 25 }) =>
        json(
          (
            await ctx.db
              .select()
              .from(clients)
              .where(
                and(
                  mine,
                  stage ? eq(clients.stage, stage) : undefined,
                  query
                    ? or(
                        ilike(clients.name, `%${query}%`),
                        ilike(clients.email, `%${query}%`),
                      )
                    : undefined,
                ),
              )
              .orderBy(desc(clients.lastContactAt))
              .limit(limit)
          ).map(brief),
        ),
    }),

    betaZodTool({
      name: "get_client",
      description:
        "Full picture of one client: details, open deadlines, recent activity.",
      inputSchema: z.object({ clientId: z.uuid() }),
      run: async ({ clientId }) => {
        const [c] = await ctx.db
          .select()
          .from(clients)
          .where(and(mine, eq(clients.id, clientId)));
        if (!c) return "No client with that id.";
        const open = await ctx.db
          .select()
          .from(deadlines)
          .where(and(eq(deadlines.clientId, c.id), isNull(deadlines.doneAt)));
        const recent = await ctx.db
          .select()
          .from(activities)
          .where(eq(activities.clientId, c.id))
          .orderBy(desc(activities.createdAt))
          .limit(15);
        return json({
          ...brief(c),
          deadlines: open.map((d) => ({
            title: d.title,
            due: d.dueAt,
            statutory: d.statutory,
          })),
          activity: recent.map((a) => ({ type: a.type, text: a.text, at: a.createdAt })),
        });
      },
    }),

    betaZodTool({
      name: "list_deadlines",
      description: "Open deadlines due within N days (overdue included), soonest first.",
      inputSchema: z.object({ days: z.number().int().min(1).max(365).default(7) }),
      run: async ({ days }) =>
        json(
          await ctx.db
            .select({
              title: deadlines.title,
              due: deadlines.dueAt,
              statutory: deadlines.statutory,
              clientId: clients.id,
              client: clients.name,
            })
            .from(deadlines)
            .innerJoin(clients, eq(clients.id, deadlines.clientId))
            .where(
              and(
                eq(deadlines.firmId, firmId),
                isNull(deadlines.doneAt),
                lte(deadlines.dueAt, new Date(Date.now() + days * day)),
              ),
            )
            .orderBy(deadlines.dueAt)
            .limit(100),
        ),
    }),

    betaZodTool({
      name: "practice_overview",
      description:
        "Counts and debt per stage, lead sources with how many filed. " +
        "Use for pipeline, conversion, opportunity and marketing questions.",
      inputSchema: z.object({}),
      run: async () => {
        const all = await ctx.db.select().from(clients).where(mine);
        const tally = (key: (c: (typeof all)[number]) => string) => {
          const out: Record<string, { files: number; debt: number; filed: number }> = {};
          for (const c of all) {
            const row = (out[key(c)] ??= { files: 0, debt: 0, filed: 0 });
            row.files++;
            row.debt += c.totalDebt;
            if (["Filed", "In administration", "Discharged"].includes(c.stage))
              row.filed++;
          }
          return out;
        };
        return json({
          total: all.length,
          byStage: tally((c) => c.stage),
          bySource: tally((c) => c.leadSource),
          byFileType: tally((c) => c.fileType),
        });
      },
    }),

    betaZodTool({
      name: "draft_email",
      description:
        "Draft an email to one or more clients. This does NOT send it: the user " +
        "reviews and confirms the draft in the app. Use first names and plain language.",
      inputSchema: z.object({
        clientIds: z.array(z.uuid()).min(1).max(50),
        subject: z.string().min(1).max(200),
        text: z.string().min(1).max(5000),
      }),
      run: async (draft) => {
        drafts.push(draft);
        return "Draft saved for the user to review. Tell them it is ready to confirm.";
      },
    }),
  ];
}
