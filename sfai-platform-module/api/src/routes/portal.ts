// Client portal invitations (replaces create-client-portal-account).
//   Staff:  POST /portal/invites {clientId}  -> emails the client a one-time link
//           GET /portal/invites?clientId=, DELETE /portal/invites/:id (revoke)
//   Public: POST /public/portal/activate {token, fullName, password}
//           -> creates the client's Cognito login (role "client", their firm + client)
// Only a SHA-256 hash of each token is stored. Links expire after 7 days.
import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { portalInvites } from "../db/schema.js";
import { getClient } from "../domain/firm.js";
import { WeakPasswordError } from "../integrations/identity.js";
import { body, fail, found, router, uuidParam } from "../lib/http.js";

const DAYS = 7;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

const trusteeOnly = (role?: string) => {
  if (role !== "trustee") throw fail(403, "Only trustees can manage portal access");
};

export const portalRoutes = (ctx: Ctx) =>
  router()
    .post("/invites", async (c) => {
      const user = c.get("user");
      trusteeOnly(user.role);
      const { clientId } = await body(c, z.object({ clientId: z.uuid() }));
      const client = found(await getClient(ctx, user.firmId, clientId), "Client");
      if (!client.email) throw fail(400, "Add the client's email first");

      const token = randomBytes(32).toString("base64url");
      const [invite] = await ctx.db
        .insert(portalInvites)
        .values({
          firmId: user.firmId,
          clientId,
          email: client.email.toLowerCase(),
          tokenHash: hash(token),
          expiresAt: new Date(Date.now() + DAYS * 86_400_000),
          createdBy: user.id,
        })
        .returning();
      const link = `${ctx.cfg.appUrl}/portal/activate?token=${token}`;
      await ctx.svc.mail(user.firmId, {
        to: client.email,
        subject: "Your secure client portal",
        text:
          `Hi ${client.name.split(" ")[0]},\n\nSet up your secure portal account ` +
          `to share documents with your trustee:\n${link}\n\n` +
          `This link works once and expires in ${DAYS} days.`,
      });
      const { tokenHash, ...view } = invite;
      return c.json(view, 201);
    })

    .get("/invites", async (c) => {
      const { firmId } = c.get("user");
      const clientId = z.uuid().safeParse(c.req.query("clientId"));
      if (!clientId.success) throw fail(400, "clientId must be a UUID");
      const rows = await ctx.db
        .select()
        .from(portalInvites)
        .where(
          and(
            eq(portalInvites.firmId, firmId),
            eq(portalInvites.clientId, clientId.data),
          ),
        )
        .orderBy(desc(portalInvites.createdAt));
      return c.json(rows.map(({ tokenHash, ...r }) => r));
    })

    .delete("/invites/:id", async (c) => {
      const user = c.get("user");
      trusteeOnly(user.role);
      const [row] = await ctx.db
        .update(portalInvites)
        .set({ status: "revoked" })
        .where(
          and(eq(portalInvites.firmId, user.firmId), eq(portalInvites.id, uuidParam(c))),
        )
        .returning();
      found(row, "Invite");
      return c.body(null, 204);
    });

// Public: the client sets their password. Errors use the same codes as the old
// function (invalid, expired, revoked, used, staff_account, invalid_password...).
export const portalActivate = (ctx: Ctx) =>
  router().post("/activate", async (c) => {
    const no = (error: string) => c.json({ error }, 400);
    const input = z
      .object({
        token: z.string().min(16).max(256),
        fullName: z.string().trim().min(2).max(120),
        password: z.string().min(8).max(200),
      })
      .safeParse(await c.req.json().catch(() => ({})));
    if (!input.success) {
      const field = input.error.issues[0]?.path[0];
      return no(
        field === "fullName"
          ? "invalid_name"
          : field === "password"
            ? "invalid_password"
            : "invalid",
      );
    }
    const { token, fullName, password } = input.data;

    const [invite] = await ctx.db
      .select()
      .from(portalInvites)
      .where(eq(portalInvites.tokenHash, hash(token)));
    if (!invite) return no("invalid");
    if (invite.status === "revoked") return no("revoked");
    if (invite.status === "redeemed") return no("used");
    if (+invite.expiresAt < Date.now()) return no("expired");

    // The email always comes from the invite, never from the browser
    const role = await ctx.svc.identity.roleOf(invite.email);
    if (role && role !== "client") return no("staff_account"); // never touch staff logins
    if (role) return c.json({ status: "existing_account", email: invite.email });

    try {
      await ctx.svc.identity.createClientUser({
        email: invite.email,
        name: fullName,
        password,
        firmId: invite.firmId,
        clientId: invite.clientId,
      });
    } catch (e) {
      if (e instanceof WeakPasswordError) return no("invalid_password");
      throw e;
    }
    await ctx.db
      .update(portalInvites)
      .set({ status: "redeemed", redeemedAt: new Date() })
      .where(eq(portalInvites.id, invite.id));
    return c.json({ status: "created", email: invite.email });
  });
