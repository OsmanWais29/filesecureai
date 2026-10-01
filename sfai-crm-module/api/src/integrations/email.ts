// Sends email for a firm, using the best connected option:
//   1. Gmail (Google connected)  2. Outlook (Microsoft connected)  3. Amazon SES
// Gmail/Outlook send FROM the trustee's own mailbox, so client replies land in
// their inbox (and come back into the CRM through mailsync.ts).
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { eq } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { firms } from "../db/schema.js";
import { accessToken } from "./oauth.js";

export interface Email {
  to: string;
  subject: string;
  text: string;
  replyTo?: { externalId: string; threadId: string | null }; // reply in a thread
}

// What the provider gave back: used to store the message and thread replies
export interface SentMail {
  via: "gmail" | "outlook" | "ses";
  id: string; // provider message id
  threadId: string | null;
}
export type Mailer = (firmId: string, email: Email) => Promise<SentMail>;

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
const GRAPH = "https://graph.microsoft.com/v1.0/me/messages";

// Gmail wants a base64url RFC 822 message
function rfc822({ to, subject, text }: Email) {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
  ];
  return Buffer.from([...lines, "", text].join("\r\n")).toString("base64url");
}

export function createMailer(ctx: Ctx): Mailer {
  const ses = new SESv2Client({ region: ctx.cfg.region });

  // POST JSON with a bearer token; returns the JSON reply ({} when empty)
  const post = async (url: string, token: string, json?: unknown) => {
    const res = await ctx.svc.fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        prefer: 'IdType="ImmutableId"', // Outlook: ids don't change between folders
      },
      body: json === undefined ? undefined : JSON.stringify(json),
    });
    if (!res.ok) throw new Error(`Email send failed (${res.status}) at ${url}`);
    return res.status === 202 || res.status === 204 ? {} : res.json();
  };

  // Gmail: one call; threadId keeps replies in the same conversation
  const viaGmail = async (token: string, e: Email): Promise<SentMail> => {
    const sent = await post(`${GMAIL}/send`, token, {
      raw: rfc822(e),
      threadId: e.replyTo?.threadId ?? undefined,
    });
    return { via: "gmail", id: sent.id, threadId: sent.threadId };
  };

  // Outlook: create the message (new, or a reply), then send it.
  // Creating first gives us its id, so the sync won't store it twice.
  const viaOutlook = async (token: string, e: Email): Promise<SentMail> => {
    const draft = e.replyTo
      ? await post(`${GRAPH}/${e.replyTo.externalId}/createReply`, token, {
          comment: e.text,
        })
      : await post(GRAPH, token, {
          subject: e.subject,
          body: { contentType: "Text", content: e.text },
          toRecipients: [{ emailAddress: { address: e.to } }],
        });
    await post(`${GRAPH}/${draft.id}/send`, token);
    return { via: "outlook", id: draft.id, threadId: draft.conversationId ?? null };
  };

  // SES: send from the firm's verified address (replies go to that address, not the CRM)
  const viaSes = async (firmId: string, e: Email): Promise<SentMail> => {
    const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, firmId));
    const res = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: firm?.emailFrom ?? ctx.cfg.emailFrom,
        Destination: { ToAddresses: [e.to] },
        Content: {
          Simple: { Subject: { Data: e.subject }, Body: { Text: { Data: e.text } } },
        },
      }),
    );
    return { via: "ses", id: res.MessageId ?? crypto.randomUUID(), threadId: null };
  };

  return async (firmId, email) => {
    const google = await accessToken(ctx, firmId, "google").catch(() => null);
    if (google) return viaGmail(google, email);
    const microsoft = await accessToken(ctx, firmId, "microsoft").catch(() => null);
    if (microsoft) return viaOutlook(microsoft, email);
    return viaSes(firmId, email);
  };
}
