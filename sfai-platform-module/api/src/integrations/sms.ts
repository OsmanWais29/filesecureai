// Sends text messages: Twilio if the firm connected it, otherwise Amazon SNS.
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { and, eq } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { integrations } from "../db/schema.js";

export type Sms = (firmId: string, to: string, text: string) => Promise<"twilio" | "sns">;

export function createSms(ctx: Ctx): Sms {
  const sns = new SNSClient({ region: ctx.cfg.region });

  return async (firmId, to, text) => {
    const [twilio] = await ctx.db
      .select()
      .from(integrations)
      .where(and(eq(integrations.firmId, firmId), eq(integrations.provider, "twilio")));

    if (twilio) {
      const sid = twilio.settings.accountSid;
      const token = await ctx.svc.crypto.decrypt(twilio.secretEncrypted, firmId);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const res = await ctx.svc.fetch(url, {
        method: "POST",
        headers: {
          authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        },
        body: new URLSearchParams({ To: to, From: twilio.settings.from, Body: text }),
      });
      if (!res.ok) throw new Error(`Twilio send failed (${res.status})`);
      return "twilio";
    }

    // SNS direct-to-phone SMS (number in E.164 format, e.g. +14165550141)
    await sns.send(new PublishCommand({ PhoneNumber: to, Message: text }));
    return "sns";
  };
}
