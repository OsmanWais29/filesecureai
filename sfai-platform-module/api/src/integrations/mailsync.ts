// Inbound email sync: pulls recent Gmail / Outlook messages and keeps only the
// ones to or from a known client. Runs every 15 minutes (and on demand).
// Client replies show up on their timeline; we never store unrelated mail.
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { clients, emails, integrations } from "../db/schema.js";
import { logActivity } from "../domain/firm.js";
import { accessToken, type OAuthProvider } from "./oauth.js";

// A message in a provider-neutral shape
interface Mail {
  id: string;
  threadId: string | null;
  from: string;
  to: string[];
  subject: string;
  snippet: string;
  sentAt: Date;
}

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
const GRAPH = "https://graph.microsoft.com/v1.0/me/messages";
const WEEK = 7 * 86_400_000;

// "Ann Lee <ann@x.com>, bo@y.ca" -> ["ann@x.com", "bo@y.ca"]
const addresses = (s = "") =>
  (s.match(/[\w.+'-]+@[\w-]+(\.[\w-]+)+/g) ?? []).map((a) => a.toLowerCase());

// ---------- Readers: fetch messages since a date ----------

async function readGmail(ctx: Ctx, token: string, since: Date): Promise<Mail[]> {
  const auth = { headers: { authorization: `Bearer ${token}` } };
  const q = `after:${Math.floor(+since / 1000)}`;
  const list = await (await ctx.svc.fetch(`${GMAIL}?maxResults=100&q=${q}`, auth)).json();
  const out: Mail[] = [];
  for (const { id } of list.messages ?? []) {
    // Headers + snippet only: we don't download bodies or attachments
    const url =
      `${GMAIL}/${id}?format=metadata` +
      "&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject";
    const m = await (await ctx.svc.fetch(url, auth)).json();
    const h = (name: string) =>
      m.payload?.headers?.find((x: { name: string }) => x.name === name)?.value ?? "";
    out.push({
      id: m.id,
      threadId: m.threadId ?? null,
      from: addresses(h("From"))[0] ?? "",
      to: addresses(h("To")),
      subject: h("Subject"),
      snippet: m.snippet ?? "",
      sentAt: new Date(Number(m.internalDate)),
    });
  }
  return out;
}

async function readOutlook(ctx: Ctx, token: string, since: Date): Promise<Mail[]> {
  const select = "id,conversationId,subject,bodyPreview,from,toRecipients,sentDateTime";
  const url =
    `${GRAPH}?$top=100&$select=${select}` +
    `&$filter=sentDateTime ge ${since.toISOString()}`;
  const res = await ctx.svc.fetch(url, {
    headers: { authorization: `Bearer ${token}`, prefer: 'IdType="ImmutableId"' },
  });
  const json = await res.json();
  type Addr = { emailAddress: { address: string } };
  return (json.value ?? []).map((m: any) => ({
    id: m.id,
    threadId: m.conversationId ?? null,
    from: m.from?.emailAddress?.address?.toLowerCase() ?? "",
    to: (m.toRecipients ?? []).map((r: Addr) => r.emailAddress.address.toLowerCase()),
    subject: m.subject ?? "",
    snippet: m.bodyPreview ?? "",
    sentAt: new Date(m.sentDateTime),
  }));
}

const READERS = { google: readGmail, microsoft: readOutlook };
const LABEL = { google: "gmail", microsoft: "outlook" } as const;

// ---------- Sync one firm ----------

export async function pullMail(ctx: Ctx, firmId: string) {
  const connected = await ctx.db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.firmId, firmId),
        inArray(integrations.provider, ["google", "microsoft"]),
      ),
    );

  for (const row of connected) {
    const p = row.provider as OAuthProvider;
    const token = await accessToken(ctx, firmId, p);
    if (!token) continue;
    const since = new Date(row.settings.mailSyncedAt ?? Date.now() - WEEK);
    const mailbox = row.account?.toLowerCase() ?? ""; // the trustee's own address
    const mail = await READERS[p](ctx, token, since);

    // Match messages to clients by email address
    const people = [...new Set(mail.flatMap((m) => [m.from, ...m.to]))];
    const known = people.length
      ? await ctx.db
          .select({ id: clients.id, email: clients.email })
          .from(clients)
          .where(
            and(
              eq(clients.firmId, firmId),
              inArray(sql`lower(${clients.email})`, people),
            ),
          )
      : [];
    const clientOf = new Map(known.map((c) => [c.email!.toLowerCase(), c.id]));

    for (const m of mail) {
      const outgoing = m.from === mailbox;
      const clientId = outgoing
        ? m.to.map((a) => clientOf.get(a)).find(Boolean)
        : clientOf.get(m.from);
      if (!clientId) continue; // not about a client: don't store it

      const [isNew] = await ctx.db
        .insert(emails)
        .values({
          firmId,
          clientId,
          provider: LABEL[p],
          externalId: m.id,
          threadId: m.threadId,
          direction: outgoing ? "out" : "in",
          fromAddr: m.from,
          toAddr: m.to.join(", "),
          subject: m.subject,
          snippet: m.snippet.slice(0, 500),
          sentAt: m.sentAt,
        })
        .onConflictDoNothing() // already synced (or sent by the CRM itself)
        .returning();
      if (isNew && !outgoing) {
        await logActivity(ctx, firmId, {
          clientId,
          type: "email",
          text: `Email received: “${m.subject}”`,
          source: LABEL[p] === "gmail" ? "Gmail" : "Outlook",
          actor: "system",
        });
      }
    }

    const settings = { ...row.settings, mailSyncedAt: new Date().toISOString() };
    await ctx.db
      .update(integrations)
      .set({ settings })
      .where(and(eq(integrations.firmId, firmId), eq(integrations.provider, p)));
  }
}
