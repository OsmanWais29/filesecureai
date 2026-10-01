// End-to-end tests of the module through its HTTP API.
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { schema } from "../src/index.js";
import { nextWeekday, setup } from "./helpers.js";

describe("login + firm isolation", () => {
  it("rejects requests without a user", async () => {
    const { crm } = await setup();
    const res = await crm.app.request("/crm/clients");
    expect(res.status).toBe(401);
  });

  it("never shows one firm's clients to another firm", async () => {
    const { api } = await setup();
    await api("/clients", { method: "POST", json: { name: "Only F1" } }, "f1");
    expect((await api("/clients", {}, "f2")).body).toEqual([]);
    expect((await api("/clients", {}, "f1")).body).toHaveLength(1);
  });
});

describe("clients", () => {
  it("encrypts the SIN and only lets trustees reveal it (audited)", async () => {
    const { api, db } = await setup();
    const { body: c } = await api("/clients", {
      method: "POST",
      json: { name: "Ann Lee", email: "ann@x.com", sin: "123-456-789" },
    });
    expect(c.sinLast3).toBe("789");
    expect(c.sinEncrypted).toBeUndefined(); // never sent to the browser

    const [row] = await db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, c.id));
    expect(row.sinEncrypted).toMatch(/^local:/);
    expect(row.sinEncrypted).not.toContain("123");

    expect((await api(`/clients/${c.id}/sin`, {}, "f1", "staff")).status).toBe(403);
    expect((await api(`/clients/${c.id}/sin`)).body).toEqual({ sin: "123-456-789" });
    const audit = await db.select().from(schema.auditLog);
    expect(audit.some((a) => a.action === "sin.reveal" && a.entityId === c.id)).toBe(
      true,
    );
  });

  it("creates statutory deadlines once when a bankruptcy is filed", async () => {
    const { api } = await setup();
    const { body: c } = await api("/clients", {
      method: "POST",
      json: { name: "Bo Kim", fileType: "Bankruptcy" },
    });
    await api(`/clients/${c.id}`, { method: "PATCH", json: { stage: "Filed" } });
    await api(`/clients/${c.id}`, {
      method: "PATCH",
      json: { stage: "Filed", risk: "low" },
    });
    const { body } = await api(`/clients/${c.id}`);
    const titles = body.deadlines.map((d: { title: string }) => d.title);
    expect(titles).toContain("First meeting of creditors (if called)");
    expect(titles.filter((t: string) => t.startsWith("Monthly income"))).toHaveLength(9);
    expect(body.client.filedAt).toBeTruthy();
  });

  it("validates input with clear messages", async () => {
    const { api } = await setup();
    const res = await api("/clients", { method: "POST", json: { email: "nope" } });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("name");
  });

  it("ticks documents on the checklist", async () => {
    const { api } = await setup();
    const { body: c } = await api("/clients", { method: "POST", json: { name: "Cy" } });
    const doc = "Tax returns (last 2 years)";
    const res = await api(`/clients/${c.id}/docs`, {
      method: "POST",
      json: { doc, received: true },
    });
    expect(res.body.docsReceived).toEqual([doc]);
  });
});

describe("automations", () => {
  it("welcomes a new lead once and creates a call-back task", async () => {
    const { api, sent } = await setup();
    const { body: c } = await api("/clients", {
      method: "POST",
      json: { name: "Dee Ray", email: "dee@x.com" },
    });
    expect(sent.filter((s) => s.to === "dee@x.com")).toHaveLength(1);
    const { body } = await api(`/clients/${c.id}`);
    expect(body.deadlines.map((d: { title: string }) => d.title)).toContain(
      "Call back new lead",
    );
  });

  it("runs deadline reminders from the hourly job, without repeating", async () => {
    const { api, crm, sent, db } = await setup();
    const { body: c } = await api("/clients", {
      method: "POST",
      json: { name: "Eve", email: "eve@x.com", phone: "+14165550199" },
    });
    await db.insert(schema.deadlines).values({
      firmId: "f1",
      clientId: c.id,
      title: "2nd counselling session",
      dueAt: new Date(Date.now() + 2 * 86_400_000),
    });
    await crm.runScheduled();
    await crm.runScheduled(); // second run must not resend
    const reminders = sent.filter((s) => s.text.includes("2nd counselling session"));
    expect(reminders.map((r) => r.kind).sort()).toEqual(["email", "sms"]);
  });

  it("can be switched off", async () => {
    const { api, sent } = await setup();
    const { body: rules } = await api("/settings/automations");
    for (const r of rules) {
      await api(`/settings/automations/${r.id}`, {
        method: "PATCH",
        json: { enabled: false },
      });
    }
    await api("/clients", { method: "POST", json: { name: "Quiet", email: "q@x.com" } });
    expect(sent).toHaveLength(0);
  });
});

describe("public website form + booking page", () => {
  const publicKey = async (api: Awaited<ReturnType<typeof setup>>["api"]) =>
    (await api("/settings")).body.publicKey as string;

  it("creates a lead from the website form; ignores bots", async () => {
    const { api, crm } = await setup();
    const key = await publicKey(api);
    const post = (json: object) =>
      crm.app.request(`/crm/public/${key}/leads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(json),
      });
    expect((await post({ name: "Web Lead", email: "w@x.com" })).status).toBe(201);
    expect(
      (await post({ name: "Bot", email: "b@x.com", company_website: "x" })).status,
    ).toBe(201);
    const names = (await api("/clients")).body.map((c: { name: string }) => c.name);
    expect(names).toEqual(["Web Lead"]);
  });

  it("books a free slot and refuses double booking", async () => {
    const { api, crm } = await setup();
    const key = await publicKey(api);
    const date = nextWeekday();
    const slots = await (
      await crm.app.request(`/crm/public/${key}/slots?date=${date}`)
    ).json();
    expect(slots.slots.length).toBe(16); // 9:00-17:00 in 30-minute slots

    const book = () =>
      crm.app.request(`/crm/public/${key}/bookings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Fay",
          email: "fay@x.com",
          startsAt: slots.slots[0],
          kind: "phone",
        }),
      });
    expect((await book()).status).toBe(201);
    expect((await book()).status).toBe(409);
    const [client] = (await api("/clients")).body;
    expect(client.stage).toBe("Consultation booked");
  });
});

describe("reports, documents, assistant, OSB export", () => {
  it("summarises the practice", async () => {
    const { api } = await setup();
    await api("/clients", {
      method: "POST",
      json: { name: "A", totalDebt: 1000, leadSource: "google" },
    });
    const { body: b } = await api("/clients", {
      method: "POST",
      json: { name: "B", totalDebt: 5000 },
    });
    await api(`/clients/${b.id}`, { method: "PATCH", json: { stage: "Filed" } });
    const { body: r } = await api("/reports/summary");
    expect(r).toMatchObject({
      clients: 2,
      active: 1,
      debtUnderAdmin: 5000,
      avgDebtPerFiling: 5000,
    });
    expect(r.conversionRate).toBe(0.5);
  });

  it("issues presigned upload/download links", async () => {
    const { api } = await setup();
    const { body: c } = await api("/clients", { method: "POST", json: { name: "Gus" } });
    const up = await api("/documents/upload-url", {
      method: "POST",
      json: { clientId: c.id, name: "pay.pdf", contentType: "application/pdf", size: 10 },
    });
    expect(up.body.url).toContain("https://s3.test/put/f1/");
    const early = await api(`/documents/${up.body.id}/download-url`);
    expect(early.status).toBe(409); // upload not finished yet
    await api(`/documents/${up.body.id}/complete`, { method: "POST" });
    expect((await api(`/documents/${up.body.id}/download-url`)).body.url).toContain(
      "/get/",
    );
  });

  it("passes the conversation to the assistant", async () => {
    const { api } = await setup();
    const res = await api("/assistant", {
      method: "POST",
      json: { messages: [{ role: "user", text: "What's due this week?" }] },
    });
    expect(res.body.text).toBe("echo f1: What's due this week?");
  });

  it("exports filed estates as CSV", async () => {
    const { api } = await setup();
    const { body: c } = await api("/clients", {
      method: "POST",
      json: { name: 'Hal "H" Ng' },
    });
    await api(`/clients/${c.id}`, {
      method: "PATCH",
      json: { stage: "Filed", estateNumber: "31-1" },
    });
    const { body } = await api("/integrations/osb/export");
    expect(body).toContain('"31-1","Hal ""H"" Ng"');
  });
});
