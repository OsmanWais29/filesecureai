// Small helpers shared by every route file.
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import type { Ctx } from "../context.js";

// Who is calling. Supplied by the host's login (Cognito by default).
export interface AuthUser {
  id: string;
  firmId: string; // every query is scoped to this firm
  name?: string;
  email?: string;
  role?: string; // e.g. "trustee" | "staff"
}

// Hono typing: routes can read c.get("user")
export type Env = { Variables: { user: AuthUser } };

// A route group gets the shared context and returns a Hono router
export type RouteFactory = (ctx: Ctx) => Hono<Env>;
export const router = () => new Hono<Env>();

// Parse + validate the JSON body; 400 with the field errors if it doesn't match
export async function body<T extends z.ZodType>(
  c: Context,
  schema: T,
): Promise<z.infer<T>> {
  const parsed = schema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new HTTPException(400, { message: msg.join("; ") });
  }
  return parsed.data;
}

// The :id in the URL, checked to be a UUID (400 instead of a database error)
export function uuidParam(c: Context, name = "id") {
  const v = c.req.param(name);
  if (!v || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
    throw new HTTPException(400, { message: `${name} must be a UUID` });
  }
  return v;
}

// 404 helper: `const row = found(await query, "Client")`
export function found<T>(row: T | undefined, what = "Record"): T {
  if (!row) throw new HTTPException(404, { message: `${what} not found` });
  return row;
}

export const fail = (status: 400 | 403 | 404 | 409, message: string) =>
  new HTTPException(status, { message });
