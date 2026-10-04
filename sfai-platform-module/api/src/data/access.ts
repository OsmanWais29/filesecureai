// Applies src/data/policies.ts to one request: which rows a user may see or change,
// and what a new row is allowed to contain.
import { and, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Ctx } from "../context.js";
import { records } from "../db/schema.js";
import type { AuthUser } from "../lib/http.js";
import { policyFor, TABLES, type Policy } from "./policies.js";

export type Action = "read" | "insert" | "update" | "delete";
type Row = Record<string, unknown>;

const no = (message: string, status: 403 | 404 = 403) =>
  new HTTPException(status, { message });

const isClient = (u: AuthUser) => u.role === "client";

// The estates a portal client has active access to (old has_portal_access())
export async function portalEstates(ctx: Ctx, user: AuthUser) {
  const rows = await ctx.db
    .select({ estate: sql<string>`${records.data}->>'estate_id'` })
    .from(records)
    .where(
      and(
        eq(records.firmId, user.firmId),
        eq(records.tbl, "client_portal_access"),
        sql`${records.data}->>'user_id' = ${user.id}`,
        sql`${records.data}->>'status' = 'active'`,
      ),
    );
  return rows.map((r) => r.estate);
}

// One table, one user, one action: the policy plus a WHERE clause for existing rows
export async function access(ctx: Ctx, user: AuthUser, table: string, action: Action) {
  if (!TABLES.has(table)) throw no(`Unknown table: ${table}`, 404);
  const p = policyFor(table);
  const mine = and(eq(records.tbl, table), eq(records.firmId, user.firmId))!;

  // Portal clients: only the portal tables, only their own estate(s)
  if (isClient(user)) {
    const allowed =
      p.portal &&
      (action === "read"
        ? p.portal.read
        : action === "insert"
          ? p.portal.insert
          : action === "update"
            ? p.portal.update
            : false);
    if (!allowed) throw no("Not available in the client portal");
    const by = p.portal!.by;
    if (by === "user_id" || by === "redeemed_by") {
      return {
        p,
        where: and(mine, sql`${records.data}->>${by} = ${user.id}`)!,
        estates: [],
      };
    }
    const estates = await portalEstates(ctx, user);
    const where = estates.length
      ? and(mine, inArray(sql`${records.data}->>${by}`, estates))!
      : sql`false`;
    return { p, where, estates };
  }

  // Staff
  if (p.shared) {
    if (action !== "read") throw no("Reference data is read-only");
    return {
      p,
      where: and(
        eq(records.tbl, table),
        or(eq(records.firmId, user.firmId), eq(records.firmId, "*")),
      )!,
      estates: [],
    };
  }
  const staff = p.staff ?? "firm";
  if (action !== "read") {
    if (staff === "server") throw no("This table is managed by the server");
    if (staff === "append" && action !== "insert")
      throw no("Log entries can't be changed");
    if (staff === "trustee" && user.role !== "trustee")
      throw no("Only trustees can change this");
  }
  if (staff === "own")
    return { p, where: and(mine, eq(records.ownerId, user.id))!, estates: [] };
  return { p, where: mine, estates: [] };
}

// Prepare a row for insert: owner, firm rules, portal estate check
export function newRow(
  user: AuthUser,
  p: Policy,
  estates: string[],
  input: Row,
): { id: string; ownerId: string; data: Row } {
  const owner = p.owner ?? "user_id";
  const data: Row = { ...input };
  const now = new Date().toISOString();
  data.id = typeof data.id === "string" && data.id ? data.id : crypto.randomUUID();
  data.created_at ??= now;
  data.updated_at = now;

  if (isClient(user)) {
    const by = p.portal!.by;
    if (by === "estate_id" && !estates.includes(String(data.estate_id))) {
      throw no("That estate isn't yours");
    }
    if (by === "user_id") data.user_id = user.id;
  } else if (p.forceOwner || (p.staff === "own" && !p.othersMayCreate)) {
    data[owner] = user.id; // can't create rows for someone else
  }
  if (owner === "id" && p.staff === "own" && !isClient(user)) data.id = user.id; // profiles
  const ownerId = typeof data[owner] === "string" ? (data[owner] as string) : user.id;
  return { id: String(data.id), ownerId, data };
}

// Strip what an update may never change
export function cleanPatch(user: AuthUser, p: Policy, patch: Row): Row {
  const { id, created_at, ...rest } = patch;
  void id;
  void created_at;
  if (isClient(user)) delete rest[p.portal?.by ?? "estate_id"]; // can't move rows
  if ((p.staff === "own" || p.forceOwner) && !isClient(user))
    delete rest[p.owner ?? "user_id"];
  return { ...rest, updated_at: new Date().toISOString() };
}

export type Access = Awaited<ReturnType<typeof access>>;
export type { SQL };
