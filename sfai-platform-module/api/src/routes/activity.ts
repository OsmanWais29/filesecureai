// /activities (timeline) and /messages (email + SMS).
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { activities, emails } from "../db/schema.js";
import { emailClient } from "../domain/email.js";
import { pullMail } from "../integrations/mailsync.js";
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

export const messageRoutes = (ctx: Ctx) =>
  router()
    // Send the same email to one or more clients (each gets their own copy).
    // Pass replyToId (an /emails id) to answer a client inside their thread.
    .post("/email", async (c) => {
      const user = c.get("user");
      const { clientIds, subject, text, replyToId } = await body(
        c,
        z.object({
          clientIds: z.array(z.uuid()).min(1).max(200),
          subject: z.string().min(1),
          text: z.string().min(1),
          replyToId: z.uuid().optional(),
        }),
      );
      let sent = 0;
      for (const id of clientIds) {
        const client = await getClient(ctx, user.firmId, id);
        if (!client?.email) continue;
        await emailClient(ctx, client, { subject, text, replyToId, actor: user.id });
        sent++;
      }
      return c.json({ sent });
    })

    // Pull new client emails from Gmail / Outlook now (also runs every 15 minutes)
    .post("/email/sync", async (c) => {
      await pullMail(ctx, c.get("user").firmId);
      return c.json({ ok: true });
    })

    // One client's email conversation, newest first
    .get("/email/:clientId", async (c) => {
      const { firmId } = c.get("user");
      const rows = await ctx.db
        .select()
        .from(emails)
        .where(
          and(eq(emails.firmId, firmId), eq(emails.clientId, c.req.param("clientId"))),
        )
        .orderBy(desc(emails.sentAt))
        .limit(100);
      return c.json(rows);
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
