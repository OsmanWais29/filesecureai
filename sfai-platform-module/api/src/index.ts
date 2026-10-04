// SFAI Platform Module: one function builds the whole backend
// (CRM, documents + AI analysis, tasks, notifications, client portal, and the
// data + file API behind the FileSecure web app).
//
//   const crm = await createSfaiModule();            // reads env vars
//   export const handler = crm.lambda;              // AWS Lambda (API Gateway)
//   app.use(toNodeHandler(crm));                    // Express / Fastify / node:http
//
// Everything is mounted under cfg.basePath ("/api" by default).
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
import { activityRoutes, messageRoutes } from "./routes/activity.js";
import documentRoutes from "./routes/documents.js";
import tasks from "./routes/tasks.js";
import notifications from "./routes/notifications.js";
import ai from "./routes/ai.js";
import portal from "./routes/portal.js";
import data from "./routes/data.js";
import files, { fileKey } from "./routes/files.js";
import { runJob } from "./jobs/run.js";
import type { Job } from "./jobs/queue.js";
import reports from "./routes/reports.js";
import settings from "./routes/settings.js";
import { integrationRoutes, oauthCallback } from "./routes/integrations.js";
import publicRoutes from "./routes/public.js";
import assistant, { type Ask } from "./routes/assistant.js";
import drafts from "./routes/drafts.js";
import mcp from "./routes/mcp.js";

export interface SfaiOptions {
  config?: Partial<Config>; // override any env-based setting
  db?: Db; // reuse the host's Drizzle/Postgres connection
  authenticate?: Authenticate; // reuse the host's login (default: Cognito)
  services?: Partial<Services>; // swap email/SMS/storage/crypto (tests, custom providers)
  ask?: Ask; // swap the AI agent (tests)
}

export async function createSfaiModule(opts: SfaiOptions = {}) {
  await loadSecretsIntoEnv();
  const cfg = { ...loadConfig(), ...opts.config };
  const ctx = createContext(opts.db ?? (await connect()), cfg, opts.services);
  const authenticate = opts.authenticate ?? (cfg.cognito && cognitoAuth(cfg.cognito));
  if (!authenticate) throw new Error("Pass `authenticate` or set COGNITO_USER_POOL_ID");

  const app = new Hono<Env>().basePath(cfg.basePath);
  // CORS: the website form + booking routes are embedded on trustee websites
  // (any origin); everything else (sign-up, portal activation...) only answers the app
  const embedded = (path: string) =>
    /\/public\/(embed\.js|[^/]+\/(leads|slots|bookings))$/.test(path);
  app.use(
    "*",
    cors({ origin: (origin, c) => (embedded(c.req.path) ? origin : cfg.appUrl) }),
  );

  // Errors -> JSON. Expected errors keep their status; anything else is a 500.
  app.onError((err, c) => {
    if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: "Something went wrong" }, 500);
  });

  // Public (no login): website form, booking page, OAuth callbacks, health check
  app.get("/health", (c) => c.json({ ok: true }));
  // Synchronous file links for viewers (<img>, <iframe>): the login token comes
  // in the URL, is checked like any other, then we redirect to a 5-minute S3 link
  app.get("/public/files/view", async (c) => {
    const { bucket, path, token } = c.req.query();
    const user =
      token &&
      (await authenticate(
        new Request("http://x", { headers: { authorization: `Bearer ${token}` } }),
      ));
    if (!user) return c.json({ error: "Please sign in" }, 401);
    if (
      !["documents", "client-portal-uploads", "avatars"].includes(bucket ?? "") ||
      !path ||
      path.includes("..")
    ) {
      return c.json({ error: "Invalid file" }, 400);
    }
    const key = await fileKey(ctx, user, bucket, path);
    c.header("cache-control", "no-store");
    c.header("referrer-policy", "no-referrer");
    return c.redirect(
      await ctx.svc.storage.downloadUrl(key, path.split("/").pop()!, true),
    );
  });

  const accounts = portal(ctx);
  app.route("/public", accounts.publicRoutes); // sign-up, portal invite links
  app.route("/public", publicRoutes(ctx));
  app.route("/integrations", oauthCallback(ctx));

  // Everything below needs a logged-in user
  app.use("*", async (c, next) => {
    const user = await authenticate(c.req.raw);
    if (!user) return c.json({ error: "Please sign in" }, 401);
    // Portal clients share the login pool; they only reach the data/file API,
    // where the table rules limit them to their own estate
    const portalPath = /^\/(data|files|rpc)\//.test(
      c.req.path.slice(cfg.basePath.length),
    );
    if (user.role === "client" && !portalPath)
      return c.json({ error: "Staff only" }, 403);
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
  app.route("/drafts", drafts(ctx)); // AI-written emails awaiting approval
  app.route("/mcp", mcp(ctx)); // the CRM as an MCP server for external agents
  app.route("/tasks", tasks(ctx));
  app.route("/notifications", notifications(ctx));
  app.route("/ai", ai(ctx)); // assistant chat + financial check
  app.route("/data", data(ctx)); // the web app's tables (replaces Supabase)
  app.route("/files", files(ctx)); // the web app's files (replaces Supabase Storage)
  app.route("/rpc", accounts.rpc); // portal database functions

  const http = handle(app);
  return {
    app, // Hono app (has .fetch for Bun, Deno, Workers, tests)
    ctx,
    runScheduled: () => runScheduled(ctx),
    runJob: (job: Job) => runJob(ctx, job),
    // Lambda: API Gateway requests, the 15-minute schedule, or SQS jobs (worker).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lambda: async (event: any, context: any) => {
      if (event?.source === "sfai.crm.scheduler") return runScheduled(ctx);
      if (event?.Records?.[0]?.eventSource === "aws:sqs") return runSqs(ctx, event);
      return http(event, context);
    },
  };
}

// SQS batch: report failed messages so only those are retried
async function runSqs(
  ctx: ReturnType<typeof createContext>,
  event: { Records: { messageId: string; body: string }[] },
) {
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const r of event.Records) {
    try {
      await runJob(ctx, JSON.parse(r.body) as Job);
    } catch (e) {
      console.error("Job failed", r.messageId, e);
      batchItemFailures.push({ itemIdentifier: r.messageId });
    }
  }
  return { batchItemFailures };
}

export type SfaiModule = Awaited<ReturnType<typeof createSfaiModule>>;

// Node adapter: works with Express (`app.use(toNodeHandler(crm))`), Fastify
// (via middie) or a plain http.createServer. Keeps the full URL so the base path matches.
export function toNodeHandler(crm: SfaiModule) {
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
