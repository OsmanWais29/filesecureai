// SFAI CRM Module: one function builds the whole backend.
//
//   const crm = await createCrmModule();            // reads env vars
//   export const handler = crm.lambda;              // AWS Lambda (API Gateway)
//   app.use(toNodeHandler(crm));                    // Express / Fastify / node:http
//
// Everything is mounted under cfg.basePath ("/crm" by default).
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/aws-lambda";
import { getRequestListener } from "@hono/node-server";
import type { IncomingMessage, ServerResponse } from "node:http";
import { cognitoAuth, type Authenticate } from "./auth.js";
import { loadConfig, loadSecretsIntoEnv, type Config } from "./config.js";
import { createContext, type Services } from "./context.js";
import { connect, type Db } from "./db/client.js";
import { auditLog } from "./db/schema.js";
import { ensureFirm } from "./domain/firm.js";
import { ask as bedrockAsk } from "./ai/agent.js";
import { runScheduled } from "./jobs/scheduled.js";
import type { Env } from "./lib/http.js";
import clients from "./routes/clients.js";
import { appointmentRoutes, deadlineRoutes } from "./routes/schedule.js";
import { activityRoutes, documentRoutes, messageRoutes } from "./routes/activity.js";
import reports from "./routes/reports.js";
import settings from "./routes/settings.js";
import { integrationRoutes, oauthCallback } from "./routes/integrations.js";
import publicRoutes from "./routes/public.js";
import assistant, { type Ask } from "./routes/assistant.js";

export interface CrmOptions {
  config?: Partial<Config>; // override any env-based setting
  db?: Db; // reuse the host's Drizzle/Postgres connection
  authenticate?: Authenticate; // reuse the host's login (default: Cognito)
  services?: Partial<Services>; // swap email/SMS/storage/crypto (tests, custom providers)
  ask?: Ask; // swap the AI agent (tests)
}

export async function createCrmModule(opts: CrmOptions = {}) {
  await loadSecretsIntoEnv();
  const cfg = { ...loadConfig(), ...opts.config };
  const ctx = createContext(opts.db ?? (await connect()), cfg, opts.services);
  const authenticate = opts.authenticate ?? (cfg.cognito && cognitoAuth(cfg.cognito));
  if (!authenticate) throw new Error("Pass `authenticate` or set COGNITO_USER_POOL_ID");

  const app = new Hono<Env>().basePath(cfg.basePath);
  // CORS: public routes are embedded on trustee websites (any origin);
  // everything else only answers the SFAI app
  app.use(
    "*",
    cors({
      origin: (origin, c) => (c.req.path.includes("/public/") ? origin : cfg.appUrl),
    }),
  );

  // Errors -> JSON. Expected errors keep their status; anything else is a 500.
  app.onError((err, c) => {
    if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: "Something went wrong" }, 500);
  });

  // Public (no login): website form, booking page, OAuth callbacks, health check
  app.get("/health", (c) => c.json({ ok: true }));
  app.route("/public", publicRoutes(ctx));
  app.route("/integrations", oauthCallback(ctx));

  // Everything below needs a logged-in user
  app.use("*", async (c, next) => {
    const user = await authenticate(c.req.raw);
    if (!user) return c.json({ error: "Please sign in" }, 401);
    await ensureFirm(ctx, user.firmId); // first visit sets up templates/automations
    c.set("user", user);
    await next();
    // Audit every successful change (who, what, which record)
    if (c.req.method !== "GET" && c.res.status < 400) {
      const path = c.req.path.slice(cfg.basePath.length); // e.g. /clients/<uuid>
      await ctx.db.insert(auditLog).values({
        firmId: user.firmId,
        actor: user.id,
        action: `${c.req.method} ${path}`,
        entityId: path.match(/[0-9a-f]{8}-[0-9a-f-]{27}/)?.[0] ?? null,
      });
    }
  });

  app.route("/clients", clients(ctx));
  app.route("/deadlines", deadlineRoutes(ctx));
  app.route("/appointments", appointmentRoutes(ctx));
  app.route("/activities", activityRoutes(ctx));
  app.route("/documents", documentRoutes(ctx));
  app.route("/messages", messageRoutes(ctx));
  app.route("/reports", reports(ctx));
  app.route("/settings", settings(ctx));
  app.route("/integrations", integrationRoutes(ctx));
  app.route("/assistant", assistant(ctx, opts.ask ?? bedrockAsk));

  const http = handle(app);
  return {
    app, // Hono app (has .fetch for Bun, Deno, Workers, tests)
    ctx,
    runScheduled: () => runScheduled(ctx),
    // Lambda: HTTP events from API Gateway, or the hourly scheduler event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lambda: (event: any, context: any) =>
      event?.source === "sfai.crm.scheduler" ? runScheduled(ctx) : http(event, context),
  };
}

export type CrmModule = Awaited<ReturnType<typeof createCrmModule>>;

// Node adapter: works with Express (`app.use(toNodeHandler(crm))`), Fastify
// (via middie) or a plain http.createServer. Keeps the full URL so the base path matches.
export function toNodeHandler(crm: CrmModule) {
  const listener = getRequestListener(crm.app.fetch);
  return (req: IncomingMessage & { originalUrl?: string }, res: ServerResponse) => {
    req.url = req.originalUrl ?? req.url;
    return listener(req, res);
  };
}

export { cognitoAuth, devAuth, type Authenticate } from "./auth.js";
export type { AuthUser } from "./lib/http.js";
export { migrateDb } from "./db/migrate.js";
export * as schema from "./db/schema.js";
