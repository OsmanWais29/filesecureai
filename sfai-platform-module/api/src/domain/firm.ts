// Firm setup + small shared helpers used by routes, automations and the AI agent.
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { activities, automations, clients, firms, templates } from "../db/schema.js";
import { DEFAULT_AUTOMATIONS, DEFAULT_TEMPLATES, REQUIRED_DOCS } from "./rules.js";

// First time a firm uses the CRM: create its settings, templates and automations.
// Safe to call repeatedly (everything uses "insert if missing").
// Remember which firms are set up (per database, per Lambda instance)
const ready = new WeakMap<object, Set<string>>();

export async function ensureFirm(ctx: Ctx, firmId: string, name = "My firm") {
  const seen = ready.get(ctx.db) ?? new Set<string>();
  ready.set(ctx.db, seen);
  if (seen.has(firmId)) return;
  const publicKey = randomBytes(12).toString("base64url"); // used in public URLs
  await ctx.db.insert(firms).values({ firmId, name, publicKey }).onConflictDoNothing();
  await ctx.db
    .insert(templates)
    .values(DEFAULT_TEMPLATES.map((t) => ({ ...t, firmId })))
    .onConflictDoNothing();
  await ctx.db
    .insert(automations)
    .values(DEFAULT_AUTOMATIONS.map((a) => ({ ...a, firmId })))
    .onConflictDoNothing();
  seen.add(firmId);
}

// Load one client, scoped to the firm
export async function getClient(ctx: Ctx, firmId: string, id: string) {
  const [row] = await ctx.db
    .select()
    .from(clients)
    .where(and(eq(clients.firmId, firmId), eq(clients.id, id)));
  return row;
}

const CONTACT = new Set(["email", "call", "meeting", "booking"]); // counts as contact

// Add a timeline entry (and bump "last contact" for real contact)
export async function logActivity(
  ctx: Ctx,
  firmId: string,
  a: {
    clientId: string | null;
    type: string;
    text: string;
    source?: string;
    actor?: string;
  },
) {
  await ctx.db.insert(activities).values({ firmId, ...a });
  if (a.clientId && CONTACT.has(a.type)) {
    await ctx.db
      .update(clients)
      .set({ lastContactAt: new Date() })
      .where(eq(clients.id, a.clientId));
  }
}

// A time as people read it, in the firm's timezone: "Thursday, October 15, 2026 at 9:00 a.m."
export async function when(ctx: Ctx, firmId: string, at: Date) {
  const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, firmId));
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: firm?.timezone ?? "America/Toronto",
  }).format(at);
}

// Replace {{placeholders}} in a template with a client's details
export function fill(
  text: string,
  client: { name: string; docsReceived: string[] },
  extra: Record<string, string> = {},
) {
  const missing = REQUIRED_DOCS.filter((d) => !client.docsReceived.includes(d));
  const vars: Record<string, string> = {
    name: client.name.split(" ")[0],
    trustee: "Your trustee",
    missingDocs: missing.map((d) => `• ${d}`).join("\n") || "• Nothing outstanding",
    date: new Date(Date.now() + 7 * 86_400_000).toDateString(),
    ...extra,
  };
  return text.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m);
}
