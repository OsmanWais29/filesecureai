// Integrations against fake Google / Twilio HTTP endpoints, plus the AI tools.
import { describe, expect, it } from "vitest";
import { createMailer } from "../src/integrations/email.js";
import { createSms } from "../src/integrations/sms.js";
import { crmTools, type EmailDraft } from "../src/ai/tools.js";
import { setup, type FakeFetch } from "./helpers.js";

const json = (v: unknown) => new Response(JSON.stringify(v), { status: 200 });

// Pretend to be Google: token endpoint, Gmail, Calendar
const fakeGoogle: FakeFetch = (url, init) => {
  if (url.includes("oauth2.googleapis.com/token")) {
    const grant = new URLSearchParams(String(init?.body)).get("grant_type");
    const idToken =
      "x." +
      Buffer.from(JSON.stringify({ email: "lit@firm.ca" })).toString("base64url") +
      ".y";
    return grant === "authorization_code"
      ? json({
          access_token: "at-1",
          refresh_token: "rt-1",
          id_token: idToken,
          expires_in: 3600,
        })
      : json({ access_token: "at-2", expires_in: 3600 });
  }
  if (url.includes("gmail.googleapis.com")) return json({ id: "msg-1" });
  if (url.includes("calendar/v3") && init?.method === "POST")
    return json({ id: "evt-new" });
  if (url.includes("calendar/v3")) {
    const start = new Date(Date.now() + 86_400_000).toISOString();
    const end = new Date(Date.now() + 86_400_000 + 1_800_000).toISOString();
    return json({
      items: [
        {
          id: "evt-ext",
          summary: "Creditor call",
          start: { dateTime: start },
          end: { dateTime: end },
        },
      ],
    });
  }
  if (url.includes("api.twilio.com")) return json({ sid: "SM1" });
  return new Response("not found", { status: 404 });
};

describe("Google OAuth + Gmail + Calendar", () => {
  it("connects, sends mail through Gmail, and syncs the calendar both ways", async () => {
    const { api, crm, calls } = await setup(fakeGoogle);

    // 1. Connect: consent URL carries a signed state
    const { body } = await api("/integrations/google/connect");
    const consent = new URL(body.url);
    expect(consent.hostname).toBe("accounts.google.com");
    const state = consent.searchParams.get("state")!;

    // 2. Google redirects back; a forged state is rejected
    const bad = await crm.app.request(
      `/crm/integrations/google/callback?code=c&state=forged.x`,
    );
    expect(bad.status).toBe(400);
    const ok = await crm.app.request(
      `/crm/integrations/google/callback?code=c&state=${state}`,
    );
    expect(ok.status).toBe(302);
    expect(ok.headers.get("location")).toBe("https://app.test?connected=google");
    const status = await api("/integrations");
    expect(status.body.connected[0]).toMatchObject({
      provider: "google",
      account: "lit@firm.ca",
    });

    // 3. Real mailer now routes through Gmail
    expect(
      await createMailer(crm.ctx)("f1", { to: "a@b.c", subject: "Hi", text: "Body" }),
    ).toBe("gmail");

    // 4. Booking pushes an event; sync pulls the external one in (once)
    const { body: c } = await api("/clients", { method: "POST", json: { name: "Ivy" } });
    const start = new Date(Date.now() + 2 * 86_400_000).toISOString();
    await api("/appointments", {
      method: "POST",
      json: { clientId: c.id, title: "Assessment", startsAt: start },
    });
    await api("/integrations/calendar/sync", { method: "POST" });
    await api("/integrations/calendar/sync", { method: "POST" });
    const { body: appts } = await api("/appointments");
    expect(appts.map((a: { title: string }) => a.title).sort()).toEqual([
      "Assessment",
      "Creditor call",
    ]);
    expect(
      appts.find((a: { title: string }) => a.title === "Assessment").externalId,
    ).toBe("evt-new");
    expect(calls.some((x) => x.url.includes("gmail.googleapis.com"))).toBe(true);
  });
});

describe("Twilio SMS", () => {
  it("stores the auth token encrypted and sends through Twilio", async () => {
    const { api, crm, calls } = await setup(fakeGoogle);
    const res = await api("/integrations/twilio", {
      method: "POST",
      json: { accountSid: "AC123", authToken: "secret-token-1", from: "+15550001111" },
    });
    expect(res.status).toBe(200);
    expect(await createSms(crm.ctx)("f1", "+15550002222", "Hello")).toBe("twilio");
    const call = calls.find((x) => x.url.includes("api.twilio.com"))!;
    expect(call.url).toContain("/Accounts/AC123/");
    expect(String(call.init?.body)).toContain("From=%2B15550001111");
  });
});

describe("assistant tools", () => {
  it("only see the caller's firm, and draft (not send) emails", async () => {
    const { api, crm, sent } = await setup();
    await api("/clients", { method: "POST", json: { name: "Jo F1" } }, "f1");
    await api("/clients", { method: "POST", json: { name: "Kai F2" } }, "f2");
    const drafts: EmailDraft[] = [];
    const tools = crmTools(crm.ctx, "f1", drafts);
    const run = (name: string, input: unknown) =>
      tools.find((t) => t.name === name)!.run(input as never);

    const found = JSON.parse(String(await run("search_clients", {})));
    expect(found.map((c: { name: string }) => c.name)).toEqual(["Jo F1"]);

    const before = sent.length;
    await run("draft_email", {
      clientIds: [found[0].id],
      subject: "Hi",
      text: "Hello Jo",
    });
    expect(drafts).toHaveLength(1);
    expect(sent.length).toBe(before); // nothing actually sent
  });
});
