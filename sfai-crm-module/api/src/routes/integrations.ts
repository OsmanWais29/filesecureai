// /integrations: connect Google / Microsoft (OAuth), Twilio, sync calendars,
// website embed code + booking link, OSB export.
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { firms, integrations } from "../db/schema.js";
import { pullCalendars } from "../integrations/calendar.js";
import {
  consentUrl,
  finishConnect,
  readState,
  type OAuthProvider,
} from "../integrations/oauth.js";
import { osbCsv } from "../integrations/osb.js";
import { body, fail, router } from "../lib/http.js";

const OAUTH = ["google", "microsoft"];
const isOAuth = (p: string): p is OAuthProvider => OAUTH.includes(p);

export const integrationRoutes = (ctx: Ctx) =>
  router()
    // What's connected, plus the firm's public website/booking links
    .get("/", async (c) => {
      const { firmId } = c.get("user");
      const rows = await ctx.db
        .select({
          provider: integrations.provider,
          account: integrations.account,
          connectedAt: integrations.connectedAt,
          lastSyncAt: integrations.lastSyncAt,
        })
        .from(integrations)
        .where(eq(integrations.firmId, firmId));
      const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, firmId));
      const pub = `${ctx.cfg.publicApiUrl}${ctx.cfg.basePath}/public`;
      return c.json({
        connected: rows,
        available: {
          google: !!ctx.cfg.google,
          microsoft: !!ctx.cfg.microsoft,
          twilio: true,
        },
        website: {
          embed:
            `<script src="${pub}/embed.js" data-key="${firm?.publicKey}" async>` +
            "</script>",
          bookingApi: `${pub}/${firm?.publicKey}`,
        },
      });
    })

    // Start OAuth: the front end opens this URL
    .get("/:provider/connect", (c) => {
      const p = c.req.param("provider");
      if (!isOAuth(p)) throw fail(404, "Unknown provider");
      if (!ctx.cfg[p]) throw fail(400, `${p} isn't set up on this server yet`);
      return c.json({ url: consentUrl(ctx, c.get("user").firmId, p) });
    })

    .post("/twilio", async (c) => {
      const { firmId } = c.get("user");
      const t = await body(
        c,
        z.object({
          accountSid: z.string().startsWith("AC"),
          authToken: z.string().min(10),
          from: z.string().regex(/^\+\d{8,15}$/), // E.164 sending number
        }),
      );
      const row = {
        firmId,
        provider: "twilio",
        account: t.from,
        secretEncrypted: await ctx.svc.crypto.encrypt(t.authToken, firmId),
        settings: { accountSid: t.accountSid, from: t.from },
      };
      await ctx.db
        .insert(integrations)
        .values(row)
        .onConflictDoUpdate({
          target: [integrations.firmId, integrations.provider],
          set: row,
        });
      return c.json({ ok: true });
    })

    .delete("/:provider", async (c) => {
      const { firmId } = c.get("user");
      await ctx.db
        .delete(integrations)
        .where(
          and(
            eq(integrations.firmId, firmId),
            eq(integrations.provider, c.req.param("provider")),
          ),
        );
      return c.body(null, 204);
    })

    // Pull calendars now (also runs hourly)
    .post("/calendar/sync", async (c) => {
      await pullCalendars(ctx, c.get("user").firmId);
      return c.json({ ok: true });
    })

    .get("/osb/export", async (c) => {
      c.header("content-type", "text/csv");
      c.header("content-disposition", 'attachment; filename="osb-estates.csv"');
      return c.body(await osbCsv(ctx, c.get("user").firmId));
    });

// OAuth callback: public (the browser arrives from Google/Microsoft).
// Trusted only because the signed `state` checks out.
export const oauthCallback = (ctx: Ctx) =>
  router().get("/:provider/callback", async (c) => {
    const p = c.req.param("provider");
    const code = c.req.query("code");
    let state: ReturnType<typeof readState>;
    try {
      state = readState(ctx, c.req.query("state") ?? "");
    } catch {
      throw fail(400, "This connect link is invalid or expired. Please try again.");
    }
    if (!isOAuth(p) || state.p !== p || !code) throw fail(400, "Invalid callback");
    await finishConnect(ctx, p, code, state.firmId);
    return c.redirect(`${ctx.cfg.appUrl}?connected=${p}`);
  });
