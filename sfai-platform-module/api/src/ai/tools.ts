// The CRM's AI tools, defined ONCE and shared by:
//   - "Ask your CRM" (Claude on Bedrock, ai/agent.ts)
//   - the MCP server (routes/mcp.ts) for Claude Desktop / Claude Code / other agents
// Every tool is scoped to one firm. Read tools only read. draft_email never
// sends: it saves a draft that a person must approve (routes/drafts.ts).
import { and, desc, eq, ilike, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { activities, clients, deadlines, drafts, emails } from "../db/schema.js";
import { REQUIRED_DOCS, STAGES } from "../domain/rules.js";

export interface CrmTool {
  name: string;
  description: string;
  input: z.ZodObject; // validated before run() is called
  readOnly: boolean; // MCP clients use this to decide what needs approval
  run: (input: any) => Promise<string>; // returns JSON text for the model
}

const json = (v: unknown) => JSON.stringify(v);
const DAY = 86_400_000;
const daysSince = (d: Date) => Math.floor((Date.now() - +d) / DAY);

// Compact client summary for the model (no SIN, no raw intake)
const brief = (c: typeof clients.$inferSelect) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  stage: c.stage,
  fileType: c.fileType,
  totalDebt: c.totalDebt,
  leadSource: c.leadSource,
  estateNumber: c.estateNumber,
  daysSinceContact: daysSince(c.lastContactAt),
  daysInStage: daysSince(c.stageSince),
  missingDocs: REQUIRED_DOCS.filter((d) => !c.docsReceived.includes(d)),
});

export function crmTools(
  ctx: Ctx,
  firmId: string,
  source: "assistant" | "mcp",
  onDraft: (id: string) => void = () => {},
): CrmTool[] {
  const mine = eq(clients.firmId, firmId);

  // Find clients by text and/or stage
  const searchClients: CrmTool = {
    name: "search_clients",
    description:
      "Find clients by name/email and/or pipeline stage. Returns stage, debt, " +
      "days since last contact and missing documents.",
    input: z.object({
      query: z.string().optional().describe("Part of a name or email"),
      stage: z.enum(STAGES).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),
    readOnly: true,
    run: async ({ query, stage, limit = 25 }) => {
      const text = query
        ? or(ilike(clients.name, `%${query}%`), ilike(clients.email, `%${query}%`))
        : undefined;
      const rows = await ctx.db
        .select()
        .from(clients)
        .where(and(mine, stage ? eq(clients.stage, stage) : undefined, text))
        .orderBy(desc(clients.lastContactAt))
        .limit(limit);
      return json(rows.map(brief));
    },
  };

  // Everything about one client: details, deadlines, activity, recent email
  const getClient: CrmTool = {
    name: "get_client",
    description:
      "One client's file: details, open deadlines, recent activity and emails.",
    input: z.object({ clientId: z.uuid() }),
    readOnly: true,
    run: async ({ clientId }) => {
      const [c] = await ctx.db
        .select()
        .from(clients)
        .where(and(mine, eq(clients.id, clientId)));
      if (!c) return "No client with that id.";
      // Run the three lookups in parallel
      const [open, recent, mail] = await Promise.all([
        ctx.db
          .select()
          .from(deadlines)
          .where(and(eq(deadlines.clientId, c.id), isNull(deadlines.doneAt))),
        ctx.db
          .select()
          .from(activities)
          .where(eq(activities.clientId, c.id))
          .orderBy(desc(activities.createdAt))
          .limit(15),
        ctx.db
          .select()
          .from(emails)
          .where(eq(emails.clientId, c.id))
          .orderBy(desc(emails.sentAt))
          .limit(10),
      ]);
      return json({
        ...brief(c),
        deadlines: open.map((d) => ({
          title: d.title,
          due: d.dueAt,
          statutory: d.statutory,
        })),
        activity: recent.map((a) => ({ type: a.type, text: a.text, at: a.createdAt })),
        emails: mail.map((e) => ({
          direction: e.direction,
          subject: e.subject,
          snippet: e.snippet,
          at: e.sentAt,
        })),
      });
    },
  };

  // Open deadlines due soon (overdue included)
  const listDeadlines: CrmTool = {
    name: "list_deadlines",
    description: "Open deadlines due within N days (overdue included), soonest first.",
    input: z.object({ days: z.number().int().min(1).max(365).default(7) }),
    readOnly: true,
    run: async ({ days }) => {
      const rows = await ctx.db
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
            lte(deadlines.dueAt, new Date(Date.now() + days * DAY)),
          ),
        )
        .orderBy(deadlines.dueAt)
        .limit(100);
      return json(rows);
    },
  };

  // Pipeline + marketing numbers
  const practiceOverview: CrmTool = {
    name: "practice_overview",
    description:
      "Counts and debt per stage, plus lead sources and file types with how many " +
      "filed. Use for pipeline, conversion, opportunity and marketing questions.",
    input: z.object({}),
    readOnly: true,
    run: async () => {
      const all = await ctx.db.select().from(clients).where(mine);
      const filed = ["Filed", "In administration", "Discharged"];
      // Group clients by one field, summing files, debt and filings
      const tally = (key: (c: (typeof all)[number]) => string) => {
        const out: Record<string, { files: number; debt: number; filed: number }> = {};
        for (const c of all) {
          const row = (out[key(c)] ??= { files: 0, debt: 0, filed: 0 });
          row.files++;
          row.debt += c.totalDebt;
          if (filed.includes(c.stage)) row.filed++;
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
  };

  // Save an email draft for a person to approve (never sends)
  const draftEmail: CrmTool = {
    name: "draft_email",
    description:
      "Draft an email to one or more clients. This does NOT send it: it is saved " +
      "for a staff member to review and approve in the CRM. Use plain language.",
    input: z.object({
      clientIds: z.array(z.uuid()).min(1).max(50),
      subject: z.string().min(1).max(200),
      body: z.string().min(1).max(5000),
    }),
    readOnly: false,
    run: async ({ clientIds, subject, body }) => {
      const [d] = await ctx.db
        .insert(drafts)
        .values({ firmId, clientIds, subject, body, source })
        .returning();
      onDraft(d.id);
      return json({ draftId: d.id, status: "waiting for approval in the CRM" });
    },
  };

  return [searchClients, getClient, listDeadlines, practiceOverview, draftEmail];
}
