// Accounts and the client portal, on the FileSecure app's own tables.
//   Public  POST /public/signup                a trustee creates a new firm + login
//           POST /public/portal/peek           what an invite link is for (before login)
//           POST /public/portal/opened         mark the invite as opened
//           POST /public/portal/activate       the client sets their password
//   Login   POST /rpc/redeem_client_portal_invitation   link the client to the estate
//           POST /rpc/record_client_portal_login        note a portal sign-in
// These replace the Supabase database functions of the same names. Invite tokens
// are only ever compared by their SHA-256 hash.
import { createHash, randomUUID } from "node:crypto";
import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { records } from "../db/schema.js";
import { ensureFirm } from "../domain/firm.js";
import { WeakPasswordError } from "../integrations/identity.js";
import { body, fail, router } from "../lib/http.js";

type Row = Record<string, unknown>;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const now = () => new Date().toISOString();

export default (ctx: Ctx) => {
  // Server-side writes (no user policy applies here)
  const put = (firmId: string, tbl: string, data: Row, ownerId?: string) => {
    const id = String(data.id ?? randomUUID());
    const row = { created_at: now(), updated_at: now(), ...data, id };
    return ctx.db
      .insert(records)
      .values({ firmId, tbl, id, ownerId: ownerId ?? null, data: row })
      .onConflictDoUpdate({
        target: [records.firmId, records.tbl, records.id],
        set: {
          data: sql`${records.data} || ${JSON.stringify(row)}::jsonb`,
          updatedAt: new Date(),
        },
      });
  };
  const patch = (firmId: string, tbl: string, id: string, data: Row) =>
    ctx.db
      .update(records)
      .set({
        data: sql`${records.data} || ${JSON.stringify({ ...data, updated_at: now() })}::jsonb`,
        updatedAt: new Date(),
      })
      .where(and(eq(records.firmId, firmId), eq(records.tbl, tbl), eq(records.id, id)));

  // The invitation for a token (any firm: the token itself is the secret)
  async function invite(token: string) {
    const [row] = await ctx.db
      .select()
      .from(records)
      .where(
        and(
          eq(records.tbl, "client_portal_invitations"),
          sql`${records.data}->>'token_hash' = ${hash(token)}`,
        ),
      );
    return row && { firmId: row.firmId, inv: row.data as Row };
  }
  // Why an invitation can't be used, or null when it can
  const problem = (inv: Row) =>
    inv.status === "revoked"
      ? "revoked"
      : inv.status === "suspended"
        ? "suspended"
        : inv.redeemed_at
          ? "used"
          : Date.parse(String(inv.expires_at)) < Date.now()
            ? "expired"
            : null;
  const event = (firmId: string, inv: Row, data: Row) =>
    put(firmId, "client_portal_events", {
      estate_id: inv.estate_id,
      invitation_id: inv.id,
      occurred_at: now(),
      actor_role: "client",
      ...data,
    });

  // Default rows a new user gets (the old sign-up triggers)
  async function userRows(
    firmId: string,
    id: string,
    email: string,
    name: string,
    role: string,
  ) {
    await put(firmId, "profiles", { id, user_id: id, email, full_name: name }, id);
    await put(firmId, "user_roles", { user_id: id, role }, id);
    await put(firmId, "user_settings", { user_id: id }, id);
    await put(firmId, "user_preferences", { user_id: id }, id);
  }

  const Token = z.object({ token: z.string().min(16).max(256) });

  const publicRoutes = router()
    // A trustee signs up: a new firm, their login, their profile
    .post("/signup", async (c) => {
      const { email, password, fullName, firmName } = await body(
        c,
        z.object({
          email: z.email().max(200),
          password: z.string().min(8).max(200),
          fullName: z.string().trim().min(2).max(120),
          firmName: z.string().trim().max(200).optional(),
        }),
      );
      const firmId = randomUUID();
      let userId: string;
      try {
        userId = await ctx.svc.identity.createUser({
          email: email.toLowerCase(),
          name: fullName,
          password,
          firmId,
          role: "trustee",
        });
      } catch (e) {
        if (e instanceof WeakPasswordError) throw fail(400, e.message);
        if (e instanceof UsernameExistsException) {
          throw fail(409, "An account with this email already exists");
        }
        throw e;
      }
      await ensureFirm(ctx, firmId, firmName || `${fullName}'s firm`);
      await userRows(firmId, userId, email.toLowerCase(), fullName, "trustee");
      return c.json({ ok: true, email: email.toLowerCase() }, 201);
    })

    .post("/portal/peek", async (c) => {
      const { token } = await body(c, Token);
      const found = await invite(token);
      if (!found) return c.json({ ok: false, reason: "invalid" });
      const { inv } = found;
      const reason = problem(inv);
      if (reason) return c.json({ ok: false, reason });
      return c.json({
        ok: true,
        invitation_id: inv.id,
        invited_email: inv.invited_email,
        invited_name: inv.invited_name,
        firm_name: inv.firm_name,
        expires_at: inv.expires_at,
      });
    })

    .post("/portal/opened", async (c) => {
      const { token } = await body(c, Token);
      const found = await invite(token);
      if (
        found &&
        !found.inv.redeemed_at &&
        ["created", "sent"].includes(String(found.inv.status))
      ) {
        const { firmId, inv } = found;
        await patch(firmId, "client_portal_invitations", String(inv.id), {
          status: "opened",
          opened_at: inv.opened_at ?? now(),
          last_activity_at: now(),
        });
        await event(firmId, inv, {
          event_type: "CLIENT_PORTAL_INVITE_OPENED",
          previous_state: inv.status,
          new_state: "opened",
          detail: "Invitation link opened",
        });
      }
      return c.json(null);
    })

    // Same error codes as the old create-client-portal-account function
    .post("/portal/activate", async (c) => {
      const no = (error: string) => c.json({ error }, 400);
      const input = z
        .object({
          token: z.string().min(16).max(256),
          fullName: z.string().trim().min(2).max(120),
          password: z.string().min(8).max(200),
        })
        .safeParse(await c.req.json().catch(() => ({})));
      if (!input.success) {
        const f = input.error.issues[0]?.path[0];
        return no(
          f === "fullName"
            ? "invalid_name"
            : f === "password"
              ? "invalid_password"
              : "invalid",
        );
      }
      const { token, fullName, password } = input.data;
      const found = await invite(token);
      if (!found) return no("invalid");
      const { firmId, inv } = found;
      const reason = problem(inv);
      if (reason) return no(reason);

      const email = String(inv.invited_email).trim().toLowerCase(); // never from the browser
      const role = await ctx.svc.identity.roleOf(email);
      if (role && role !== "client") return no("staff_account"); // never touch staff logins
      if (role) return c.json({ status: "existing_account", email });
      try {
        const id = await ctx.svc.identity.createUser({
          email,
          name: fullName,
          password,
          firmId,
          role: "client",
        });
        await userRows(firmId, id, email, fullName, "client");
      } catch (e) {
        if (e instanceof WeakPasswordError) return no("invalid_password");
        throw e;
      }
      return c.json({ status: "created", email });
    });

  const rpc = router()
    // After the client's first sign-in: grant access to the invited estate
    .post("/redeem_client_portal_invitation", async (c) => {
      const user = c.get("user");
      const { p_token } = await body(
        c,
        z.object({ p_token: z.string().min(16).max(256) }),
      );
      const found = await invite(p_token);
      if (!found || found.firmId !== user.firmId)
        return c.json({ ok: false, reason: "invalid" });
      const { firmId, inv } = found;
      const access = (already: boolean) => ({
        ok: true,
        estate_id: inv.estate_id,
        client_id: inv.client_id,
        already_redeemed: already,
      });
      const grant = () =>
        put(
          firmId,
          "client_portal_access",
          {
            id: `${user.id}:${inv.estate_id}`, // one access row per user + estate
            user_id: user.id,
            estate_id: inv.estate_id,
            client_id: inv.client_id,
            invitation_id: inv.id,
            status: "active",
            granted_by: inv.created_by,
            granted_at: now(),
          },
          user.id,
        );

      if (inv.redeemed_at) {
        if (inv.redeemed_by !== user.id) return c.json({ ok: false, reason: "used" });
        await grant(); // retry-safe: restore access if it went missing
        return c.json(access(true));
      }
      const reason = problem(inv);
      if (reason) return c.json({ ok: false, reason });
      if (
        String(user.email ?? "").toLowerCase() !== String(inv.invited_email).toLowerCase()
      ) {
        return c.json({ ok: false, reason: "email_mismatch" });
      }
      await grant();
      await patch(firmId, "client_portal_invitations", String(inv.id), {
        status: "active",
        redeemed_at: now(),
        redeemed_by: user.id,
        last_activity_at: now(),
      });
      await event(firmId, inv, {
        event_type: "CLIENT_PORTAL_INVITE_ACCEPTED",
        actor_user_id: user.id,
        actor_name: inv.invited_email,
        previous_state: inv.status,
        new_state: "active",
        detail: "Invitation redeemed",
      });
      return c.json(access(false));
    })

    .post("/record_client_portal_login", async (c) => {
      const user = c.get("user");
      const rows = await ctx.db
        .select()
        .from(records)
        .where(
          and(
            eq(records.firmId, user.firmId),
            eq(records.tbl, "client_portal_access"),
            sql`${records.data}->>'user_id' = ${user.id}`,
            sql`${records.data}->>'status' = 'active'`,
          ),
        );
      for (const r of rows) {
        const a = r.data as Row;
        await patch(user.firmId, "client_portal_access", r.id, { last_login_at: now() });
        await event(user.firmId, a, {
          estate_id: a.estate_id,
          invitation_id: a.invitation_id,
          event_type: "CLIENT_LOGIN",
          actor_user_id: user.id,
          detail: "Client signed in to portal",
        });
      }
      return c.json(null);
    });

  return { publicRoutes, rpc };
};
