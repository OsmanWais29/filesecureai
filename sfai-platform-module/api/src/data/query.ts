// Turns Supabase-style filters ("status eq active", "metadata->client_id eq 5",
// or-strings like "title.ilike.%x%,status.eq.open") into SQL on crm.records.data.
// Column names are checked against a strict pattern and every value is a bound
// parameter, so nothing the browser sends ever becomes raw SQL.
import { sql, type SQL } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { records } from "../db/schema.js";

export const OPS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "in",
  "is",
  "contains",
] as const;
export type Op = (typeof OPS)[number];
export interface Filter {
  col: string;
  op: Op;
  value?: unknown;
  not?: boolean;
}

// "status", "metadata->client_id", "metadata->>formType"
const COLUMN = /^[a-z_][a-z0-9_]*(->>?[a-zA-Z0-9_]+)*$/;
const bad = (msg: string) => new HTTPException(400, { message: msg });

export function column(col: string) {
  if (!COLUMN.test(col)) throw bad(`Invalid column: ${col}`);
  const parts = col.split(/->>?/);
  const path = sql.join(
    parts.map((p) => sql`${p}`),
    sql`, `,
  );
  return {
    json: sql`(${records.data} #> array[${path}]::text[])`, // the value as jsonb
    text: sql`(${records.data} #>> array[${path}]::text[])`, // the value as text
  };
}

// How a JSON value compares with what the browser sent (as text, like PostgREST)
const asText = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));
const isNumber = (v: unknown) =>
  typeof v === "number" || (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v));

export function condition(f: Filter): SQL {
  const { json, text } = column(f.col);
  const v = f.value;
  // Numbers compare as numbers when the stored value is a number, else as text
  const order = (cmp: SQL) =>
    isNumber(v)
      ? sql`(case when jsonb_typeof(${json}) = 'number' then (${text})::numeric end) ${cmp} ${Number(v)}`
      : sql`${text} ${cmp} ${asText(v)}`;

  const c: SQL = (() => {
    switch (f.op) {
      case "eq":
        return sql`${text} = ${asText(v)}`;
      case "neq":
        return sql`${text} <> ${asText(v)}`;
      case "gt":
        return order(sql.raw(">"));
      case "gte":
        return order(sql.raw(">="));
      case "lt":
        return order(sql.raw("<"));
      case "lte":
        return order(sql.raw("<="));
      case "like":
        return sql`${text} like ${asText(v).replaceAll("*", "%")}`;
      case "ilike":
        return sql`${text} ilike ${asText(v).replaceAll("*", "%")}`;
      case "in": {
        if (!Array.isArray(v)) throw bad("in() needs a list");
        if (!v.length) return sql`false`;
        if (v.length > 1000) throw bad("in() list too long");
        return sql`${text} in (${sql.join(
          v.map((x) => sql`${asText(x)}`),
          sql`, `,
        )})`;
      }
      case "is":
        return v === null
          ? sql`(${json} is null or ${json} = 'null'::jsonb)`
          : sql`${json} = ${JSON.stringify(v)}::jsonb`;
      case "contains":
        return sql`${json} @> ${JSON.stringify(v)}::jsonb`;
    }
  })();
  return f.not ? sql`not coalesce(${c}, false)` : c;
}

// PostgREST or-string -> one OR condition. "a.eq.1, b.not.is.null, c.in.(x,y)"
export function parseOr(expr: string): SQL {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of expr) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);

  const conds = parts.map((p) => {
    const m = p.trim().match(/^([^.]+)\.(not\.)?([a-z]+)\.(.*)$/s);
    if (!m) throw bad(`Invalid or() filter: ${p}`);
    const [, col, not, op, raw] = m;
    if (!(OPS as readonly string[]).includes(op))
      throw bad(`Unsupported operator: ${op}`);
    const value =
      op === "in"
        ? raw
            .replace(/^\(|\)$/g, "")
            .split(",")
            .map((s) => s.trim().replace(/^"|"$/g, ""))
        : op === "is"
          ? raw === "null"
            ? null
            : raw === "true"
          : raw;
    return condition({ col, op: op as Op, value, not: !!not });
  });
  return sql`(${sql.join(conds, sql` or `)})`;
}

// "id, title, clients(name)" -> plain columns + embedded child tables
export function parseSelect(select = "*") {
  const items: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of select) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      items.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) items.push(cur.trim());

  const columns: string[] = [];
  const embeds: { table: string; columns: string[] }[] = [];
  for (const item of items) {
    const m = item.match(/^([a-z_0-9]+)(?:![a-z_]+)?\((.*)\)$/s);
    if (m) {
      embeds.push({ table: m[1], columns: parseSelect(m[2]).columns });
    } else if (item !== "*") {
      const name = item.split(":").pop()!.trim(); // "alias:col" -> col
      if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw bad(`Invalid select: ${item}`);
      columns.push(name);
    }
  }
  return { columns, embeds }; // columns empty = all
}

// Keep only the asked-for columns
export function pick(row: Record<string, unknown>, columns: string[]) {
  if (!columns.length) return row;
  return Object.fromEntries(columns.map((c) => [c, row[c] ?? null]));
}
