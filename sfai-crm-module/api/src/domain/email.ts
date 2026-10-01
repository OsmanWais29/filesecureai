// The one way the CRM emails a client: send, store a copy, add it to the timeline.
// Used by the compose screen, automations and approved AI drafts.
import { and, eq } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { emails, type Client } from "../db/schema.js";
import { logActivity } from "./firm.js";

export async function emailClient(
  ctx: Ctx,
  client: Client,
  msg: { subject: string; text: string; actor: string; replyToId?: string },
) {
  if (!client.email) throw new Error(`${client.name} has no email address`);

  // Replying? Find the original so the reply stays in the same thread
  const [original] = msg.replyToId
    ? await ctx.db
        .select()
        .from(emails)
        .where(and(eq(emails.firmId, client.firmId), eq(emails.id, msg.replyToId)))
    : [];

  const subject = original
    ? `Re: ${original.subject.replace(/^re:\s*/i, "")}`
    : msg.subject;
  const sent = await ctx.svc.mail(client.firmId, {
    to: client.email,
    subject,
    text: msg.text,
    replyTo: original && { externalId: original.externalId, threadId: original.threadId },
  });

  // Keep our own copy (the sync later skips it because the id already exists)
  await ctx.db
    .insert(emails)
    .values({
      firmId: client.firmId,
      clientId: client.id,
      provider: sent.via,
      externalId: sent.id,
      threadId: sent.threadId,
      direction: "out",
      fromAddr: "me",
      toAddr: client.email,
      subject,
      snippet: msg.text.slice(0, 500),
      sentAt: new Date(),
    })
    .onConflictDoNothing();

  await logActivity(ctx, client.firmId, {
    clientId: client.id,
    type: "email",
    text: `Email sent: “${subject}”`,
    actor: msg.actor,
  });
  return sent;
}
