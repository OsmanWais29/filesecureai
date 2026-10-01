// /deadlines and /appointments: what's due and who's booked.
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { appointments, deadlines } from "../db/schema.js";
import { fire } from "../domain/automations.js";
import { getClient, logActivity, when } from "../domain/firm.js";
import { pushAppointment } from "../integrations/calendar.js";
import { body, found, router } from "../lib/http.js";

const day = 86_400_000;

export const deadlineRoutes = (ctx: Ctx) =>
  router()
    // Open deadlines due within ?days= (default 14, overdue included)
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const days = Number(c.req.query("days") ?? 14);
      const rows = await ctx.db
        .select()
        .from(deadlines)
        .where(
          and(
            eq(deadlines.firmId, firmId),
            isNull(deadlines.doneAt),
            lte(deadlines.dueAt, new Date(Date.now() + days * day)),
          ),
        )
        .orderBy(deadlines.dueAt);
      return c.json(rows);
    })

    // Add an internal task
    .post("/", async (c) => {
      const { firmId } = c.get("user");
      const data = await body(
        c,
        z.object({
          clientId: z.uuid(),
          title: z.string().min(1),
          dueAt: z.iso.datetime(),
        }),
      );
      found(await getClient(ctx, firmId, data.clientId), "Client");
      const [row] = await ctx.db
        .insert(deadlines)
        .values({ ...data, firmId, dueAt: new Date(data.dueAt) })
        .returning();
      return c.json(row, 201);
    })

    // Mark done
    .post("/:id/done", async (c) => {
      const { firmId } = c.get("user");
      const [row] = await ctx.db
        .update(deadlines)
        .set({ doneAt: new Date() })
        .where(and(eq(deadlines.firmId, firmId), eq(deadlines.id, c.req.param("id"))))
        .returning();
      return c.json(found(row, "Deadline"));
    });

export const appointmentRoutes = (ctx: Ctx) =>
  router()
    // Appointments between ?from= and ?to= (ISO dates; default: next 30 days)
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const from = new Date(c.req.query("from") ?? Date.now());
      const to = new Date(c.req.query("to") ?? Date.now() + 30 * day);
      const rows = await ctx.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.firmId, firmId),
            gte(appointments.startsAt, from),
            lte(appointments.startsAt, to),
          ),
        )
        .orderBy(appointments.startsAt);
      return c.json(rows);
    })

    // Book: save, push to the connected calendar, log,
    // then run "appointment.booked" automations
    .post("/", async (c) => {
      const user = c.get("user");
      const data = await body(
        c,
        z.object({
          clientId: z.uuid(),
          title: z.string().min(1),
          startsAt: z.iso.datetime(),
          minutes: z.number().int().min(5).max(480).default(30),
          kind: z.enum(["video", "phone", "in_person"]).default("video"),
          meetingUrl: z.url().optional(),
        }),
      );
      const client = found(await getClient(ctx, user.firmId, data.clientId), "Client");
      const [row] = await ctx.db
        .insert(appointments)
        .values({
          ...data,
          firmId: user.firmId,
          startsAt: new Date(data.startsAt),
        })
        .returning();
      await pushAppointment(ctx, row).catch((e) =>
        console.error("Calendar push failed", e),
      );
      const date = await when(ctx, user.firmId, row.startsAt);
      await logActivity(ctx, user.firmId, {
        clientId: client.id,
        type: "booking",
        actor: user.id,
        text: `${row.title} booked for ${date}`,
      });
      await fire(ctx, client, "appointment.booked", row.id, { date });
      return c.json(row, 201);
    })

    .delete("/:id", async (c) => {
      const { firmId } = c.get("user");
      await ctx.db
        .delete(appointments)
        .where(
          and(eq(appointments.firmId, firmId), eq(appointments.id, c.req.param("id"))),
        );
      return c.body(null, 204);
    });
