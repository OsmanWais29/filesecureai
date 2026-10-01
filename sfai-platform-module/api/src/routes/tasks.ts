// /tasks: the firm's to-do list. The AI adds tasks from document risks
// (ai/analyze.ts, replaces ai-task-generator); staff add and close their own.
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { documents, tasks } from "../db/schema.js";
import { getClient } from "../domain/firm.js";
import { body, fail, found, router, uuidParam } from "../lib/http.js";

const Fields = {
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueAt: z.iso.datetime().optional(),
  assignedTo: z.string().max(100).optional(),
};

export default (ctx: Ctx) =>
  router()
    // ?status=open|done (default open), optional ?clientId= / ?documentId=
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const q = z
        .object({
          status: z.enum(["open", "done"]).default("open"),
          clientId: z.uuid().optional(),
          documentId: z.uuid().optional(),
        })
        .safeParse(c.req.query());
      if (!q.success) throw fail(400, "Invalid filter");
      const { status, clientId, documentId } = q.data;
      const rows = await ctx.db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.firmId, firmId),
            eq(tasks.status, status),
            clientId ? eq(tasks.clientId, clientId) : undefined,
            documentId ? eq(tasks.documentId, documentId) : undefined,
          ),
        )
        .orderBy(asc(tasks.dueAt))
        .limit(500);
      return c.json(rows);
    })

    .post("/", async (c) => {
      const user = c.get("user");
      const data = await body(
        c,
        z.object({
          ...Fields,
          clientId: z.uuid().optional(),
          documentId: z.uuid().optional(),
        }),
      );
      if (data.clientId)
        found(await getClient(ctx, user.firmId, data.clientId), "Client");
      if (data.documentId) {
        const [d] = await ctx.db
          .select({ id: documents.id })
          .from(documents)
          .where(
            and(eq(documents.firmId, user.firmId), eq(documents.id, data.documentId)),
          );
        found(d, "Document");
      }
      const [row] = await ctx.db
        .insert(tasks)
        .values({
          ...data,
          firmId: user.firmId,
          dueAt: data.dueAt ? new Date(data.dueAt) : null,
          createdBy: user.id,
        })
        .returning();
      return c.json(row, 201);
    })

    // Edit, assign, or close ({"status": "done"})
    .patch("/:id", async (c) => {
      const { firmId } = c.get("user");
      const id = uuidParam(c);
      const { dueAt, status, ...patch } = await body(
        c,
        z
          .object({ ...Fields, status: z.enum(["open", "done"]) })
          .partial()
          .refine((p) => Object.keys(p).length, "Nothing to change"),
      );
      const [row] = await ctx.db
        .update(tasks)
        .set({
          ...patch,
          ...(dueAt !== undefined && { dueAt: new Date(dueAt) }),
          ...(status && { status, doneAt: status === "done" ? new Date() : null }),
        })
        .where(and(eq(tasks.firmId, firmId), eq(tasks.id, id)))
        .returning();
      return c.json(found(row, "Task"));
    });
