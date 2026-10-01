// /clients: list, create (intake), profile, update, document checklist, SIN reveal.
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { activities, auditLog, clients, deadlines, type Client } from "../db/schema.js";
import { getClient, logActivity } from "../domain/firm.js";
import { fire } from "../domain/automations.js";
import { FILE_TYPES, REQUIRED_DOCS, STAGES, deadlinesFor } from "../domain/rules.js";
import { body, fail, found, router } from "../lib/http.js";

// Fields a user may set (shared by create + update)
const fields = {
  name: z.string().min(1).max(200),
  email: z.email().optional(),
  phone: z.string().max(40).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(2).optional(),
  status: z.enum(["lead", "prospect", "client", "former_client"]).optional(),
  fileType: z.enum(FILE_TYPES).optional(),
  leadSource: z.string().max(50).optional(),
  totalDebt: z.number().int().min(0).optional(),
  monthlyIncome: z.number().int().min(0).optional(),
  estateNumber: z.string().max(40).optional(),
  risk: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().optional(),
};
const Create = z.object({
  ...fields,
  intake: z.record(z.string(), z.string()).optional(), // all other intake answers
  sin: z
    .string()
    .regex(/^\d{3}-?\d{3}-?\d{3}$/)
    .optional(), // encrypted, never stored plain
});
const Update = z
  .object({
    ...fields,
    stage: z.enum(STAGES).optional(),
    filedAt: z.iso.datetime().optional(),
  })
  .partial();

// Never send the encrypted SIN to the browser
const view = ({ sinEncrypted, ...c }: Client) => c;

export default (ctx: Ctx) =>
  router()
    // List with optional search (?q=) and stage filter (?stage=)
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const q = c.req.query("q");
      const stage = c.req.query("stage");
      const rows = await ctx.db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.firmId, firmId),
            stage ? eq(clients.stage, stage) : undefined,
            q
              ? or(ilike(clients.name, `%${q}%`), ilike(clients.email, `%${q}%`))
              : undefined,
          ),
        )
        .orderBy(desc(clients.lastContactAt))
        .limit(500);
      return c.json(rows.map(view));
    })

    // Create from the intake form
    .post("/", async (c) => {
      const user = c.get("user");
      const { sin, intake = {}, ...data } = await body(c, Create);
      const sinEncrypted = sin ? await ctx.svc.crypto.encrypt(sin, user.firmId) : null;
      const [row] = await ctx.db
        .insert(clients)
        .values({
          ...data,
          firmId: user.firmId,
          intake,
          sinEncrypted,
          sinLast3: sin?.slice(-3),
        })
        .returning();
      await logActivity(ctx, user.firmId, {
        clientId: row.id,
        type: "form",
        text: "Intake completed",
        actor: user.id,
      });
      await fire(ctx, row, "lead.created");
      return c.json(view(row), 201);
    })

    // Profile: client + open deadlines + recent timeline
    .get("/:id", async (c) => {
      const { firmId } = c.get("user");
      const row = found(await getClient(ctx, firmId, c.req.param("id")), "Client");
      const open = await ctx.db
        .select()
        .from(deadlines)
        .where(and(eq(deadlines.clientId, row.id), isNull(deadlines.doneAt)))
        .orderBy(deadlines.dueAt);
      const timeline = await ctx.db
        .select()
        .from(activities)
        .where(eq(activities.clientId, row.id))
        .orderBy(desc(activities.createdAt))
        .limit(50);
      return c.json({ client: view(row), deadlines: open, activities: timeline });
    })

    // Update. Moving to "Filed" stamps the filing date and creates statutory deadlines.
    .patch("/:id", async (c) => {
      const user = c.get("user");
      const before = found(
        await getClient(ctx, user.firmId, c.req.param("id")),
        "Client",
      );
      const { filedAt, ...patch } = await body(c, Update);
      const stageChanged = patch.stage && patch.stage !== before.stage;
      const filed = filedAt
        ? new Date(filedAt)
        : patch.stage === "Filed" && !before.filedAt
          ? new Date()
          : undefined;

      const [row] = await ctx.db
        .update(clients)
        .set({
          ...patch,
          filedAt: filed,
          stageSince: stageChanged ? new Date() : undefined,
        })
        .where(eq(clients.id, before.id))
        .returning();

      if (filed) {
        const rules = deadlinesFor(row.fileType, filed);
        if (rules.length) {
          await ctx.db
            .insert(deadlines)
            .values(rules.map((d) => ({ ...d, firmId: user.firmId, clientId: row.id })))
            .onConflictDoNothing(); // already generated -> keep existing
        }
      }
      if (stageChanged) {
        await logActivity(ctx, user.firmId, {
          clientId: row.id,
          type: "note",
          text: `Moved to “${row.stage}”`,
          actor: user.id,
        });
      }
      return c.json(view(row));
    })

    // Tick / untick a required document
    .post("/:id/docs", async (c) => {
      const { firmId } = c.get("user");
      const row = found(await getClient(ctx, firmId, c.req.param("id")), "Client");
      const { doc, received } = await body(
        c,
        z.object({
          doc: z.enum(REQUIRED_DOCS as [string, ...string[]]),
          received: z.boolean(),
        }),
      );
      const docs = new Set(row.docsReceived);
      received ? docs.add(doc) : docs.delete(doc);
      await ctx.db
        .update(clients)
        .set({ docsReceived: [...docs] })
        .where(eq(clients.id, row.id));
      return c.json({ docsReceived: [...docs] });
    })

    // Reveal the SIN: trustees only, always written to the audit log
    .get("/:id/sin", async (c) => {
      const user = c.get("user");
      if (user.role !== "trustee") throw fail(403, "Only trustees can view a SIN");
      const row = found(await getClient(ctx, user.firmId, c.req.param("id")), "Client");
      if (!row.sinEncrypted) throw fail(404, "No SIN on file");
      await ctx.db.insert(auditLog).values({
        firmId: user.firmId,
        actor: user.id,
        action: "sin.reveal",
        entityId: row.id,
      });
      return c.json({ sin: await ctx.svc.crypto.decrypt(row.sinEncrypted, user.firmId) });
    });
