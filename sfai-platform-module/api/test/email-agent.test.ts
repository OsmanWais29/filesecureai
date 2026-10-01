// Two-way email (Gmail sync + threaded replies), draft approval, and the MCP server.
import { describe, expect, it } from "vitest";
import { crmTools } from "../src/ai/tools.js";
import { setup, type FakeFetch } from "./helpers.js";

const json = (v: unknown) => new Response(JSON.stringify(v), { status: 200 });
const idToken = (email: string) =>
  "x." + Buffer.from(JSON.stringify({ email })).toString("base64url") + ".y";

// Fake Google: OAuth tokens, a Gmail inbox with one client email + one stranger
const sentBodies: any[] = [];
const fakeGmail: FakeFetch = (url, init) => {
  if (url.includes("oauth2.googleapis.com/token")) {
    return json({
      access_token: "at",
      refresh_token: "rt",
      id_token: idToken("lit@firm.ca"),
      expires_in: 3600,
    });
  }
  if (url.endsWith("/messages/send")) {
    sentBodies.push(JSON.parse(String(init?.body)));
    // Unique ids, like real Gmail
    return json({ id: `gm-sent-${sentBodies.length}`, threadId: "t-ann" });
  }
  if (url.includes("/messages?"))
    return json({ messages: [{ id: "gm-1" }, { id: "gm-2" }] });
  const headers = (from: string, subject: string) => ({
    headers: [
      { name: "From", value: from },
      { name: "To", value: "Trustee <lit@firm.ca>" },
      { name: "Subject", value: subject },
    ],
  });
  if (url.includes("/messages/gm-1")) {
    return json({
      id: "gm-1",
      threadId: "t-ann",
      snippet: "Here are my pay stubs",
      internalDate: `${Date.now()}`,
      payload: headers("Ann Lee <ANN@x.com>", "My documents"),
    });
  }
  if (url.includes("/messages/gm-2")) {
    return json({
      id: "gm-2",
      threadId: "t-x",
      snippet: "Sale!",
      internalDate: `${Date.now()}`,
      payload: headers("shop@spam.com", "50% off"),
    });
  }
  return new Response("not found", { status: 404 });
};

// Connect Google for firm f1 by walking the OAuth flow
async function connectGoogle(s: Awaited<ReturnType<typeof setup>>) {
  const { body } = await s.api("/integrations/google/connect");
  const state = new URL(body.url).searchParams.get("state");
  await s.crm.app.request(`/api/integrations/google/callback?code=c&state=${state}`);
}

describe("two-way email", () => {
  it("syncs client replies (only clients) and answers in the same thread", async () => {
    const s = await setup(fakeGmail, { realMail: true });
    await connectGoogle(s);
    const { body: ann } = await s.api("/clients", {
      method: "POST",
      json: { name: "Ann Lee", email: "ann@x.com" },
    });

    // Pull the inbox twice: one client email stored once, the stranger ignored
    await s.api("/messages/email/sync", { method: "POST" });
    await s.api("/messages/email/sync", { method: "POST" });
    let { body: thread } = await s.api(`/messages/email/${ann.id}`);
    const inbound = thread.filter((e: { direction: string }) => e.direction === "in");
    expect(inbound).toHaveLength(1);
    expect(inbound[0]).toMatchObject({ subject: "My documents", fromAddr: "ann@x.com" });

    // It shows on her timeline
    const { body: profile } = await s.api(`/clients/${ann.id}`);
    expect(profile.activities.map((a: { text: string }) => a.text)).toContain(
      "Email received: “My documents”",
    );

    // Reply in the thread through Gmail
    await s.api("/messages/email", {
      method: "POST",
      json: {
        clientIds: [ann.id],
        subject: "ignored",
        text: "Thanks Ann!",
        replyToId: inbound[0].id,
      },
    });
    const reply = sentBodies.at(-1);
    expect(reply.threadId).toBe("t-ann");
    expect(Buffer.from(reply.raw, "base64url").toString()).toContain(
      "Subject: Re: My documents",
    );
    ({ body: thread } = await s.api(`/messages/email/${ann.id}`));
    expect(thread.find((e: { direction: string }) => e.direction === "out").subject).toBe(
      "Re: My documents",
    );
  });
});

describe("AI drafts need approval", () => {
  it("sends only after a person approves, and only once", async () => {
    const s = await setup();
    const { body: bo } = await s.api("/clients", {
      method: "POST",
      json: { name: "Bo", email: "bo@x.com" },
    });
    const tools = crmTools(s.crm.ctx, "f1", "mcp");
    const draft = tools.find((t) => t.name === "draft_email")!;
    await draft.run({
      clientIds: [bo.id],
      subject: "Docs",
      body: "Please send pay stubs",
    });
    await draft.run({ clientIds: [bo.id], subject: "Spammy", body: "Not this one" });

    const before = s.sent.length;
    const { body: pending } = await s.api("/drafts");
    expect(pending).toHaveLength(2);
    expect(s.sent.length).toBe(before); // drafting sent nothing

    const keep = pending.find((d: { subject: string }) => d.subject === "Docs");
    const drop = pending.find((d: { subject: string }) => d.subject === "Spammy");
    await s.api(`/drafts/${keep.id}`, {
      method: "PATCH",
      json: { subject: "Documents needed" },
    });
    expect((await s.api(`/drafts/${keep.id}/send`, { method: "POST" })).body).toEqual({
      sent: 1,
    });
    expect((await s.api(`/drafts/${keep.id}/send`, { method: "POST" })).status).toBe(409);
    await s.api(`/drafts/${drop.id}`, { method: "DELETE" });

    expect(s.sent.slice(before).map((m) => m.text)).toEqual(["Documents needed"]);
    expect((await s.api("/drafts")).body).toHaveLength(0);
  });
});

describe("MCP server", () => {
  // JSON-RPC call to /api/mcp as a user of firm f1
  const rpc = (
    s: Awaited<ReturnType<typeof setup>>,
    method: string,
    params = {},
    firm = "f1",
  ) =>
    s.crm.app.request("/api/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        ...(firm ? { "x-firm": firm } : {}),
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });

  it("lists and runs the CRM tools for the caller's firm only", async () => {
    const s = await setup();
    await s.api("/clients", { method: "POST", json: { name: "Cy F1" } }, "f1");
    await s.api("/clients", { method: "POST", json: { name: "Di F2" } }, "f2");

    expect((await rpc(s, "tools/list", {}, "")).status).toBe(401); // login required

    const init = await rpc(s, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test", version: "1" },
    });
    expect((await init.json()).result.serverInfo.name).toBe("sfai-crm");

    const list = await (await rpc(s, "tools/list")).json();
    const names = list.result.tools.map((t: { name: string }) => t.name);
    expect(names).toEqual([
      "search_clients",
      "get_client",
      "list_deadlines",
      "practice_overview",
      "draft_email",
    ]);
    const draftTool = list.result.tools.find(
      (t: { name: string }) => t.name === "draft_email",
    );
    expect(draftTool.annotations.readOnlyHint).toBe(false);

    const call = await (
      await rpc(s, "tools/call", { name: "search_clients", arguments: {} })
    ).json();
    const clients = JSON.parse(call.result.content[0].text);
    expect(clients.map((c: { name: string }) => c.name)).toEqual(["Cy F1"]);
  });
});
