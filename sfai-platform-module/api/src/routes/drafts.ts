// /drafts: emails written by AI (assistant or MCP) wait here for a person.
// Staff can edit, send (approve) or discard. Every decision is audited.
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { drafts } from "../db/schema.js";
import { emailClient } from "../domain/email.js";
import { getClient } from "../domain/firm.js";
import { body, fail, found, router } from "../lib/http.js";

export default (ctx: Ctx) => {
  // Load a draft that is still waiting for a decision
  const pending = async (firmId: string, id: string) => {
    const [d] = await ctx.db
      .select()
      .from(drafts)
      .where(and(eq(drafts.firmId, firmId), eq(drafts.id, id)));
    if (found(d, "Draft").status !== "pending")
      throw fail(409, `Draft already ${d.status}`);
    return d;
  };

  return (
    router()
      // Drafts waiting for approval (?status=sent|discarded for history)
      .get("/", async (c) => {
        const status = c.req.query("status") ?? "pending";
        const rows = await ctx.db
          .select()
          .from(drafts)
          .where(and(eq(drafts.firmId, c.get("user").firmId), eq(drafts.status, status)))
          .orderBy(desc(drafts.createdAt));
        return c.json(rows);
      })

      // Edit before sending
      .patch("/:id", async (c) => {
        const { firmId } = c.get("user");
        const d = await pending(firmId, c.req.param("id"));
        const patch = await body(
          c,
          z.object({ subject: z.string().min(1), body: z.string().min(1) }).partial(),
        );
        const [row] = await ctx.db
          .update(drafts)
          .set(patch)
          .where(eq(drafts.id, d.id))
          .returning();
        return c.json(row);
      })

      // Approve: send to every client on the draft
      .post("/:id/send", async (c) => {
        const user = c.get("user");
        const d = await pending(user.firmId, c.req.param("id"));
        let sent = 0;
        for (const id of d.clientIds) {
          const client = await getClient(ctx, user.firmId, id);
          if (!client?.email) continue; // skip clients without an address
          await emailClient(ctx, client, {
            subject: d.subject,
            text: d.body,
            actor: user.id,
          });
          sent++;
        }
        await ctx.db
          .update(drafts)
          .set({ status: "sent", decidedBy: user.id })
          .where(eq(drafts.id, d.id));
        return c.json({ sent });
      })

      // Discard: nothing is sent
      .delete("/:id", async (c) => {
        const user = c.get("user");
        const d = await pending(user.firmId, c.req.param("id"));
        await ctx.db
          .update(drafts)
          .set({ status: "discarded", decidedBy: user.id })
          .where(eq(drafts.id, d.id));
        return c.body(null, 204);
      })
  );
};
