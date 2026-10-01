// /settings: firm settings, email templates and automation on/off switches.
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { automations, firms, templates } from "../db/schema.js";
import { body, fail, found, router } from "../lib/http.js";

const trusteeOnly = (role?: string) => {
  if (role !== "trustee") throw fail(403, "Only trustees can change settings");
};

export default (ctx: Ctx) =>
  router()
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, firmId));
      return c.json(found(firm, "Firm"));
    })

    .patch("/", async (c) => {
      const user = c.get("user");
      trusteeOnly(user.role);
      const patch = await body(
        c,
        z
          .object({
            name: z.string().min(1),
            timezone: z.string(),
            emailFrom: z.email(), // must be verified in SES
            notifyEmail: z.email(),
            hours: z.object({
              start: z.number().int().min(0).max(23),
              end: z.number().int().min(1).max(24),
              days: z.array(z.number().int().min(0).max(6)), // 0 = Sunday
            }),
            slotMinutes: z.number().int().min(10).max(120),
          })
          .partial(),
      );
      const [firm] = await ctx.db
        .update(firms)
        .set(patch)
        .where(eq(firms.firmId, user.firmId))
        .returning();
      return c.json(firm);
    })

    // Email templates
    .get("/templates", async (c) =>
      c.json(
        await ctx.db
          .select()
          .from(templates)
          .where(eq(templates.firmId, c.get("user").firmId)),
      ),
    )

    .patch("/templates/:id", async (c) => {
      const { firmId } = c.get("user");
      const patch = await body(
        c,
        z
          .object({
            name: z.string().min(1),
            subject: z.string().min(1),
            body: z.string().min(1),
          })
          .partial(),
      );
      const [row] = await ctx.db
        .update(templates)
        .set(patch)
        .where(and(eq(templates.firmId, firmId), eq(templates.id, c.req.param("id"))))
        .returning();
      return c.json(found(row, "Template"));
    })

    // Automations (turn on/off)
    .get("/automations", async (c) =>
      c.json(
        await ctx.db
          .select()
          .from(automations)
          .where(eq(automations.firmId, c.get("user").firmId)),
      ),
    )

    .patch("/automations/:id", async (c) => {
      const user = c.get("user");
      trusteeOnly(user.role);
      const { enabled } = await body(c, z.object({ enabled: z.boolean() }));
      const [row] = await ctx.db
        .update(automations)
        .set({ enabled })
        .where(
          and(eq(automations.firmId, user.firmId), eq(automations.id, c.req.param("id"))),
        )
        .returning();
      return c.json(found(row, "Automation"));
    });
