// /notifications: in-app alerts (replaces handle-notifications).
// A user only ever reads or clears their OWN notifications. Anyone in the firm can
// notify a colleague (e.g. "@mention", "client needs help"), never another firm.
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { notifications } from "../db/schema.js";
import { body, router } from "../lib/http.js";

export default (ctx: Ctx) => {
  const mine = (u: { firmId: string; id: string }) =>
    and(eq(notifications.firmId, u.firmId), eq(notifications.userId, u.id));

  return (
    router()
      // My notifications, newest first (?unread=true for unread only)
      .get("/", async (c) => {
        const user = c.get("user");
        const unread = c.req.query("unread") === "true";
        const rows = await ctx.db
          .select()
          .from(notifications)
          .where(and(mine(user), unread ? isNull(notifications.readAt) : undefined))
          .orderBy(desc(notifications.createdAt))
          .limit(100);
        return c.json(rows);
      })

      // Notify someone in my firm (defaults to myself)
      .post("/", async (c) => {
        const user = c.get("user");
        const n = await body(
          c,
          z.object({
            userId: z.string().min(1).max(100).optional(),
            title: z.string().min(1).max(200),
            message: z.string().min(1).max(2000),
            type: z.enum(["info", "warning", "success", "support", "task"]).optional(),
            priority: z.enum(["normal", "high"]).optional(),
            // An in-app path only, so a notification can't link to a phishing site
            actionUrl: z
              .string()
              .regex(/^\/(?!\/)/, "Must start with /")
              .max(500)
              .optional(),
            metadata: z.record(z.string(), z.unknown()).optional(),
          }),
        );
        const [row] = await ctx.db
          .insert(notifications)
          .values({
            ...n,
            userId: n.userId ?? user.id,
            firmId: user.firmId,
            metadata: { ...n.metadata, from: user.id },
          })
          .returning();
        return c.json(row, 201);
      })

      // Mark some (or all, with no ids) of my notifications read
      .post("/read", async (c) => {
        const user = c.get("user");
        const { ids } = await body(
          c,
          z.object({ ids: z.array(z.uuid()).max(500).optional() }),
        );
        await ctx.db
          .update(notifications)
          .set({ readAt: new Date() })
          .where(and(mine(user), ids ? inArray(notifications.id, ids) : undefined));
        return c.json({ ok: true });
      })

      // Clear all of mine
      .delete("/", async (c) => {
        await ctx.db.delete(notifications).where(mine(c.get("user")));
        return c.body(null, 204);
      })
  );
};
