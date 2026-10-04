// /data/:table: the FileSecure app's database API (replaces Supabase's PostgREST).
// The app's drop-in client (src/integrations/supabase/client.ts) sends one JSON
// request per query: { action, filters, order, limit, values, ... }.
// Firm + table rules are applied by src/data/access.ts on every call.
import { and, desc, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { records } from "../db/schema.js";
import { access, cleanPatch, newRow } from "../data/access.js";
import { RELATIONS } from "../data/policies.js";
import { column, condition, OPS, parseOr, parseSelect, pick } from "../data/query.js";
import { body, fail, router } from "../lib/http.js";
import type { AuthUser } from "../lib/http.js";

type Row = Record<string, unknown>;
const MAX = 1000; // rows per request, like Supabase

const FilterSchema = z.object({
  col: z.string().max(100),
  op: z.enum(OPS),
  value: z.unknown().optional(),
  not: z.boolean().optional(),
});
const Request = z.object({
  action: z.enum(["select", "insert", "update", "upsert", "delete"]),
  select: z.string().max(2000).optional(),
  filters: z.array(FilterSchema).max(50).default([]),
  or: z.array(z.string().max(2000)).max(10).default([]),
  order: z
    .array(
      z.object({ col: z.string(), asc: z.boolean(), nullsFirst: z.boolean().optional() }),
    )
    .max(5)
    .default([]),
  limit: z.number().int().min(0).max(MAX).optional(),
  offset: z.number().int().min(0).optional(),
  count: z.boolean().optional(), // count: "exact"
  head: z.boolean().optional(), // count only, no rows
  values: z
    .union([
      z.record(z.string(), z.unknown()),
      z.array(z.record(z.string(), z.unknown())),
    ])
    .optional(),
  onConflict: z.string().max(200).optional(),
  ignoreDuplicates: z.boolean().optional(),
});
type Req = z.infer<typeof Request>;

export default (ctx: Ctx) => {
  // WHERE for this request's filters, on top of the access rule
  const where = (base: SQL, r: Req) =>
    and(base, ...r.filters.map(condition), ...r.or.map(parseOr))!;

  // SELECT, with optional count and embedded child tables
  async function select(user: AuthUser, table: string, r: Req) {
    const a = await access(ctx, user, table, "read");
    const w = where(a.where, r);
    const { columns, embeds } = parseSelect(r.select);
    let count: number | undefined;
    if (r.count) {
      const [c] = await ctx.db
        .select({ n: sql<number>`count(*)`.mapWith(Number) })
        .from(records)
        .where(w);
      count = c.n;
    }
    if (r.head) return { data: null, count };

    const order = r.order.map(
      (o) =>
        sql`${column(o.col).json} ${sql.raw(o.asc ? "asc" : "desc")} ${sql.raw(o.nullsFirst ? "nulls first" : "nulls last")}`,
    );
    const rows = await ctx.db
      .select({ data: records.data })
      .from(records)
      .where(w)
      .orderBy(...(order.length ? order : [desc(records.createdAt)]))
      .limit(r.limit ?? MAX)
      .offset(r.offset ?? 0);
    const data = rows.map((x) => x.data as Row);

    // "*, estate_asset_securities(...)": fetch each child table in one query
    for (const e of embeds) {
      const fk = RELATIONS[e.table] ?? `${table.replace(/s$/, "")}_id`;
      const ca = await access(ctx, user, e.table, "read");
      const ids = data.map((d) => String(d.id));
      const kids = ids.length
        ? await ctx.db
            .select({ data: records.data })
            .from(records)
            .where(and(ca.where, condition({ col: fk, op: "in", value: ids })))
        : [];
      for (const d of data) {
        d[e.table] = kids
          .map((k) => k.data as Row)
          .filter((k) => String(k[fk]) === String(d.id))
          .map((k) => pick(k, e.columns));
      }
    }
    const keep = [...columns, ...embeds.map((e) => e.table)];
    return { data: data.map((d) => pick(d, columns.length ? keep : [])), count };
  }

  async function insert(user: AuthUser, table: string, values: Row[], r: Req) {
    const a = await access(ctx, user, table, "insert");
    const rows = values.map((v) => newRow(user, a.p, a.estates, v));
    try {
      await ctx.db.insert(records).values(
        rows.map((x) => ({
          firmId: user.firmId,
          tbl: table,
          id: x.id,
          ownerId: x.ownerId,
          data: x.data,
        })),
      );
    } catch (e) {
      if (String((e as Error).message).includes("duplicate"))
        throw fail(409, "A row with this id already exists");
      throw e;
    }
    const { columns } = parseSelect(r.select);
    return { data: rows.map((x) => pick(x.data, columns)) };
  }

  async function update(user: AuthUser, table: string, r: Req, patchIn: Row) {
    if (!r.filters.length && !r.or.length) throw fail(400, "update() needs a filter");
    const a = await access(ctx, user, table, "update");
    const patch = cleanPatch(user, a.p, patchIn);
    const rows = await ctx.db
      .update(records)
      .set({
        data: sql`${records.data} || ${JSON.stringify(patch)}::jsonb`,
        updatedAt: new Date(),
      })
      .where(where(a.where, r))
      .returning({ data: records.data });
    const { columns } = parseSelect(r.select);
    return { data: rows.map((x) => pick(x.data as Row, columns)) };
  }

  // Insert, or update the row that matches on the conflict columns
  async function upsert(user: AuthUser, table: string, values: Row[], r: Req) {
    const cols = (r.onConflict ?? "id").split(",").map((c) => c.trim());
    const a = await access(ctx, user, table, "update");
    const out: Row[] = [];
    for (const v of values) {
      const match = cols.map((c) => condition({ col: c, op: "eq", value: v[c] }));
      const [existing] = cols.every((c) => v[c] !== undefined)
        ? await ctx.db
            .select({ data: records.data })
            .from(records)
            .where(and(a.where, ...match))
            .limit(1)
        : [];
      if (existing && r.ignoreDuplicates) continue;
      if (existing) {
        const id = String((existing.data as Row).id);
        const res = await update(
          user,
          table,
          { ...r, filters: [{ col: "id", op: "eq", value: id }], or: [] },
          v,
        );
        out.push(...res.data);
      } else {
        out.push(...(await insert(user, table, [v], r)).data);
      }
    }
    return { data: out };
  }

  async function remove(user: AuthUser, table: string, r: Req) {
    if (!r.filters.length && !r.or.length) throw fail(400, "delete() needs a filter");
    const a = await access(ctx, user, table, "delete");
    const rows = await ctx.db
      .delete(records)
      .where(where(a.where, r))
      .returning({ data: records.data });
    return { data: rows.map((x) => x.data as Row) };
  }

  return (
    router()
      .post("/:table", async (c) => {
        const user = c.get("user");
        const table = c.req.param("table");
        const r = await body(c, Request);
        const list =
          r.values === undefined ? [] : Array.isArray(r.values) ? r.values : [r.values];
        if (list.length > MAX) throw fail(400, `At most ${MAX} rows per request`);
        switch (r.action) {
          case "select":
            return c.json(await select(user, table, r));
          case "insert":
            return c.json(await insert(user, table, list, r), 201);
          case "update":
            return c.json(await update(user, table, r, (r.values as Row) ?? {}));
          case "upsert":
            return c.json(await upsert(user, table, list, r));
          case "delete":
            return c.json(await remove(user, table, r));
        }
      })

      // Run the AI analysis on one of the app's documents (in the background)
      .post("/documents/:id/analyze", async (c) => {
        const user = c.get("user");
        const id = c.req.param("id");
        const a = await access(ctx, user, "documents", "update");
        const [doc] = await ctx.db
          .select({ id: records.id })
          .from(records)
          .where(and(a.where, sql`${records.id} = ${id}`));
        if (!doc) throw fail(404, "Document not found");
        await ctx.svc.queue({
          type: "analyze-record",
          firmId: user.firmId,
          documentId: id,
        });
        return c.json({ status: "queued" }, 202);
      })

      // Live updates (polling): rows changed since a time, plus the server's time now
      .post("/:table/changes", async (c) => {
        const user = c.get("user");
        const { since, filters } = await body(
          c,
          z.object({
            since: z.iso.datetime(),
            filters: z.array(FilterSchema).max(10).default([]),
          }),
        );
        const a = await access(ctx, user, c.req.param("table"), "read");
        const now = new Date();
        const rows = await ctx.db
          .select({ data: records.data })
          .from(records)
          .where(
            and(
              a.where,
              sql`${records.updatedAt} > ${new Date(since)}`,
              ...filters.map(condition),
            ),
          )
          .limit(200);
        return c.json({ rows: rows.map((r) => r.data), at: now.toISOString() });
      })
  );
};
