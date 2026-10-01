// /activities (timeline), /documents (S3 uploads) and /messages (email + SMS).
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { activities, documents } from "../db/schema.js";
import { getClient, logActivity } from "../domain/firm.js";
import { body, fail, found, router } from "../lib/http.js";

export const activityRoutes = (ctx: Ctx) =>
  router()
    // Firm-wide feed, or one client's (?clientId=)
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const clientId = c.req.query("clientId");
      const rows = await ctx.db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.firmId, firmId),
            clientId ? eq(activities.clientId, clientId) : undefined,
          ),
        )
        .orderBy(desc(activities.createdAt))
        .limit(Number(c.req.query("limit") ?? 50));
      return c.json(rows);
    })

    // Log a call or note by hand
    .post("/", async (c) => {
      const user = c.get("user");
      const data = await body(
        c,
        z.object({
          clientId: z.uuid(),
          type: z.enum(["call", "note", "meeting"]),
          text: z.string().min(1),
        }),
      );
      found(await getClient(ctx, user.firmId, data.clientId), "Client");
      await logActivity(ctx, user.firmId, { ...data, actor: user.id });
      return c.json({ ok: true }, 201);
    });

const MAX_UPLOAD = 25 * 1024 * 1024; // 25 MB per file

export const documentRoutes = (ctx: Ctx) =>
  router()
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const clientId = c.req.query("clientId");
      const rows = await ctx.db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.firmId, firmId),
            clientId ? eq(documents.clientId, clientId) : undefined,
          ),
        )
        .orderBy(desc(documents.createdAt));
      return c.json(rows);
    })

    // Step 1: get a presigned link; the browser PUTs the file straight to S3
    .post("/upload-url", async (c) => {
      const { firmId } = c.get("user");
      const data = await body(
        c,
        z.object({
          clientId: z.uuid(),
          name: z.string().min(1).max(200),
          contentType: z.string().min(1),
          size: z.number().int().positive().max(MAX_UPLOAD),
        }),
      );
      found(await getClient(ctx, firmId, data.clientId), "Client");
      const s3Key = `${firmId}/${data.clientId}/${randomUUID()}`;
      const [doc] = await ctx.db
        .insert(documents)
        .values({ ...data, firmId, s3Key })
        .returning();
      const url = await ctx.svc.storage.uploadUrl(s3Key, data.contentType);
      return c.json({ id: doc.id, url }, 201);
    })

    // Step 2: browser confirms the upload finished
    .post("/:id/complete", async (c) => {
      const user = c.get("user");
      const [doc] = await ctx.db
        .update(documents)
        .set({ status: "uploaded" })
        .where(
          and(eq(documents.firmId, user.firmId), eq(documents.id, c.req.param("id"))),
        )
        .returning();
      found(doc, "Document");
      await logActivity(ctx, user.firmId, {
        clientId: doc.clientId,
        type: "note",
        text: `Document uploaded: ${doc.name}`,
        actor: user.id,
      });
      return c.json(doc);
    })

    .get("/:id/download-url", async (c) => {
      const { firmId } = c.get("user");
      const [doc] = await ctx.db
        .select()
        .from(documents)
        .where(and(eq(documents.firmId, firmId), eq(documents.id, c.req.param("id"))));
      if (found(doc, "Document").status !== "uploaded")
        throw fail(409, "Upload not finished");
      return c.json({ url: await ctx.svc.storage.downloadUrl(doc.s3Key, doc.name) });
    });

export const messageRoutes = (ctx: Ctx) =>
  router()
    // Send the same email to one or more clients (each gets their own copy)
    .post("/email", async (c) => {
      const user = c.get("user");
      const { clientIds, subject, text } = await body(
        c,
        z.object({
          clientIds: z.array(z.uuid()).min(1).max(200),
          subject: z.string().min(1),
          text: z.string().min(1),
        }),
      );
      let sent = 0;
      for (const id of clientIds) {
        const client = await getClient(ctx, user.firmId, id);
        if (!client?.email) continue;
        await ctx.svc.mail(user.firmId, { to: client.email, subject, text });
        await logActivity(ctx, user.firmId, {
          clientId: id,
          type: "email",
          text: `Email sent: “${subject}”`,
          actor: user.id,
        });
        sent++;
      }
      return c.json({ sent });
    })

    .post("/sms", async (c) => {
      const user = c.get("user");
      const { clientId, text } = await body(
        c,
        z.object({
          clientId: z.uuid(),
          text: z.string().min(1).max(600),
        }),
      );
      const client = found(await getClient(ctx, user.firmId, clientId), "Client");
      if (!client.phone) throw fail(400, "Client has no phone number");
      await ctx.svc.sms(user.firmId, client.phone, text);
      await logActivity(ctx, user.firmId, {
        clientId,
        type: "automation",
        text: `Text sent: “${text}”`,
        actor: user.id,
      });
      return c.json({ sent: 1 });
    });
