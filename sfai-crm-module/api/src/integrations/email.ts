// Sends email for a firm, using the best connected option:
//   1. Gmail (Google connected)  2. Outlook (Microsoft connected)  3. Amazon SES
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { eq } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { firms } from "../db/schema.js";
import { accessToken } from "./oauth.js";

export interface Email {
  to: string;
  subject: string;
  text: string;
}
export type Mailer = (
  firmId: string,
  email: Email,
) => Promise<"gmail" | "outlook" | "ses">;

// Gmail wants a base64url RFC 822 message
function rfc822({ to, subject, text }: Email) {
  const msg = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
  ];
  return Buffer.from(msg.join("\r\n")).toString("base64url");
}

export function createMailer(ctx: Ctx): Mailer {
  const ses = new SESv2Client({ region: ctx.cfg.region });

  // POST JSON with a bearer token; throw on failure
  const post = async (url: string, token: string, json: unknown) => {
    const res = await ctx.svc.fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(json),
    });
    if (!res.ok) throw new Error(`Email send failed (${res.status}) at ${url}`);
  };

  return async (firmId, email) => {
    const google = await accessToken(ctx, firmId, "google").catch(() => null);
    if (google) {
      await post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", google, {
        raw: rfc822(email),
      });
      return "gmail";
    }

    const microsoft = await accessToken(ctx, firmId, "microsoft").catch(() => null);
    if (microsoft) {
      await post("https://graph.microsoft.com/v1.0/me/sendMail", microsoft, {
        message: {
          subject: email.subject,
          body: { contentType: "Text", content: email.text },
          toRecipients: [{ emailAddress: { address: email.to } }],
        },
      });
      return "outlook";
    }

    // SES: send from the firm's verified address, or the module default
    const [firm] = await ctx.db.select().from(firms).where(eq(firms.firmId, firmId));
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: firm?.emailFrom ?? ctx.cfg.emailFrom,
        Destination: { ToAddresses: [email.to] },
        Content: {
          Simple: {
            Subject: { Data: email.subject },
            Body: { Text: { Data: email.text } },
          },
        },
      }),
    );
    return "ses";
  };
}
