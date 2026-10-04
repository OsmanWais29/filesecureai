// The web app's data API (/data), files (/files), sign-up and the client portal.
// These replace Supabase's database, storage, auth sign-up and portal functions,
// so most tests check a rule the old row-level security used to enforce.
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { setup } from "./helpers.js";

type S = Awaited<ReturnType<typeof setup>>;
// One /data request, as the drop-in client sends it
const q = (s: S, table: string, json: object, firm = "f1", role = "trustee", who = {}) =>
  s.api(`/data/${table}`, { method: "POST", json }, firm, role, who);

describe("data API", () => {
  it("insert, filter, order, update, delete", async () => {
    const s = await setup();
    const ins = await q(s, "documents", {
      action: "insert",
      values: [
        {
          title: "Form 47",
          type: "application/pdf",
          size: 10,
          metadata: { formType: "form-47" },
        },
        { title: "Bank statement", type: "application/pdf", size: 30 },
      ],
    });
    expect(ins.status).toBe(201);
    expect(ins.body.data[0].id).toBeTruthy();
    expect(ins.body.data[0].user_id).toBeUndefined(); // not invented for firm tables

    // eq on a JSON path, ilike, numbers, order, select columns
    const byPath = await q(s, "documents", {
      action: "select",
      filters: [{ col: "metadata->formType", op: "eq", value: "form-47" }],
    });
    expect(byPath.body.data.map((d: { title: string }) => d.title)).toEqual(["Form 47"]);
    const big = await q(s, "documents", {
      action: "select",
      select: "title",
      filters: [{ col: "size", op: "gt", value: 20 }],
    });
    expect(big.body.data).toEqual([{ title: "Bank statement" }]);
    const sorted = await q(s, "documents", {
      action: "select",
      order: [{ col: "size", asc: false }],
      count: true,
    });
    expect(sorted.body.data.map((d: { size: number }) => d.size)).toEqual([30, 10]);
    expect(sorted.body.count).toBe(2);

    // PostgREST or-string, as the app writes it
    const either = await q(s, "documents", {
      action: "select",
      or: ["metadata->formType.eq.form-47,title.ilike.%bank%"],
    });
    expect(either.body.data).toHaveLength(2);

    const id = ins.body.data[0].id;
    const upd = await q(s, "documents", {
      action: "update",
      values: { ai_processing_status: "complete", id: "hijack" },
      filters: [{ col: "id", op: "eq", value: id }],
    });
    expect(upd.body.data[0]).toMatchObject({ id, ai_processing_status: "complete" });
    expect((await q(s, "documents", { action: "update", values: { x: 1 } })).status).toBe(
      400,
    ); // no filter

    await q(s, "documents", {
      action: "delete",
      filters: [{ col: "id", op: "eq", value: id }],
    });
    expect((await q(s, "documents", { action: "select" })).body.data).toHaveLength(1);
  });

  it("upsert on conflict columns, and embedded child rows", async () => {
    const s = await setup();
    const row = { estate_id: "e1", section_key: "income", value: 1 };
    await q(s, "client_portal_intake_sections", {
      action: "upsert",
      values: row,
      onConflict: "estate_id,section_key",
    });
    await q(s, "client_portal_intake_sections", {
      action: "upsert",
      values: { ...row, value: 2 },
      onConflict: "estate_id,section_key",
    });
    const all = await q(s, "client_portal_intake_sections", { action: "select" });
    expect(all.body.data).toHaveLength(1);
    expect(all.body.data[0].value).toBe(2);

    const asset = await q(s, "estate_assets", {
      action: "insert",
      values: { estate_id: "e1", name: "Car" },
    });
    await q(s, "estate_asset_securities", {
      action: "insert",
      values: { asset_id: asset.body.data[0].id, creditor_name: "Bank", amount: 500 },
    });
    const withKids = await q(s, "estate_assets", {
      action: "select",
      select: "*, estate_asset_securities(creditor_name, amount)",
    });
    expect(withKids.body.data[0].estate_asset_securities).toEqual([
      { creditor_name: "Bank", amount: 500 },
    ]);
  });

  it("never mixes firms, and refuses unknown tables and bad columns", async () => {
    const s = await setup();
    await q(s, "clients", { action: "insert", values: { name: "Secret" } }, "f2");
    expect((await q(s, "clients", { action: "select" })).body.data).toEqual([]);
    const upd = await q(s, "clients", {
      action: "update",
      values: { name: "Hacked" },
      filters: [{ col: "name", op: "eq", value: "Secret" }],
    });
    expect(upd.body.data).toEqual([]);
    expect((await q(s, "pg_user", { action: "select" })).status).toBe(404);
    const inject = await q(s, "clients", {
      action: "select",
      filters: [{ col: "name'; drop table x;--", op: "eq", value: 1 }],
    });
    expect(inject.status).toBe(400);
  });

  it("private tables: only the owner reads; colleagues may notify", async () => {
    const s = await setup();
    await q(s, "user_settings", {
      action: "insert",
      values: { user_id: "someone-else", theme: "dark" },
    });
    const mine = await q(s, "user_settings", { action: "select" });
    expect(mine.body.data[0].user_id).toBe("u1"); // forced to the caller
    expect(
      (await q(s, "user_settings", { action: "select" }, "f1", "trustee", { user: "u2" }))
        .body.data,
    ).toEqual([]);

    await q(s, "notifications", {
      action: "insert",
      values: { user_id: "u2", title: "Hi", message: "m" },
    });
    expect((await q(s, "notifications", { action: "select" })).body.data).toEqual([]);
    const theirs = await q(s, "notifications", { action: "select" }, "f1", "trustee", {
      user: "u2",
    });
    expect(theirs.body.data[0].title).toBe("Hi");
  });

  it("signatures always belong to the signer; logs can't be edited", async () => {
    const s = await setup();
    const sig = await q(s, "signatures", {
      action: "insert",
      values: { document_id: "d1", signer_id: "boss" },
    });
    expect(sig.body.data[0].signer_id).toBe("u1");
    await q(s, "audit_logs", { action: "insert", values: { action: "viewed" } });
    const edit = await q(s, "audit_logs", {
      action: "update",
      values: { action: "x" },
      filters: [{ col: "action", op: "eq", value: "viewed" }],
    });
    expect(edit.status).toBe(403);
    expect(
      (await q(s, "user_roles", { action: "insert", values: { role: "trustee" } }))
        .status,
    ).toBe(403);
  });

  it("only trustees manage portal invitations", async () => {
    const s = await setup();
    const res = await q(
      s,
      "client_portal_invitations",
      { action: "insert", values: { estate_id: "e1" } },
      "f1",
      "staff",
    );
    expect(res.status).toBe(403);
  });

  it("polls for changes", async () => {
    const s = await setup();
    const since = new Date(Date.now() - 1000).toISOString();
    await q(s, "messages", { action: "insert", values: { content: "hi" } });
    const res = await s.api("/data/messages/changes", {
      method: "POST",
      json: { since },
    });
    expect(res.body.rows).toHaveLength(1);
  });
});

describe("files", () => {
  it("keys every file under the caller's firm", async () => {
    const s = await setup();
    const up = await s.api("/files/upload-url", {
      method: "POST",
      json: { bucket: "documents", path: "u1/claim.pdf", contentType: "application/pdf" },
    });
    expect(up.body.url).toBe("https://s3.test/put/f1/documents/u1/claim.pdf");
    const bad = await s.api("/files/download-url", {
      method: "POST",
      json: { bucket: "documents", path: "../f2/documents/x.pdf" },
    });
    expect(bad.status).toBe(400);
  });
});

describe("sign-up and client portal", () => {
  // A trustee invites a client to estate e1 (as the app does: hash made in the browser)
  async function invited(s: S, token = "t".repeat(40)) {
    const token_hash = createHash("sha256").update(token).digest("hex");
    await q(s, "estates", {
      action: "insert",
      values: { id: "e1", name: "Estate of Ana" },
    });
    await q(s, "estates", {
      action: "insert",
      values: { id: "e2", name: "Someone else" },
    });
    await q(s, "client_portal_requests", {
      action: "insert",
      values: { estate_id: "e1", title: "Pay stubs" },
    });
    await q(s, "client_portal_requests", {
      action: "insert",
      values: { estate_id: "e2", title: "Other" },
    });
    await q(s, "client_portal_invitations", {
      action: "insert",
      values: {
        estate_id: "e1",
        client_id: "c1",
        invited_email: "Ana@Example.com",
        token_hash,
        status: "sent",
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
    });
    return token;
  }
  const pub = (s: S, path: string, json: object) =>
    s.crm.app.request(`/api/public${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(json),
    });

  it("a trustee signs up a new firm with a profile and role", async () => {
    const s = await setup();
    const res = await pub(s, "/signup", {
      email: "New@Firm.ca",
      password: "long-password",
      fullName: "Nora Trustee",
    });
    expect(res.status).toBe(201);
    expect(s.portalUsers.get("new@firm.ca")).toBe("trustee");
    const again = await pub(s, "/signup", { email: "x", password: "p", fullName: "N" });
    expect(again.status).toBe(400);
  });

  it("invite: peek, open, activate, redeem, then see only their estate", async () => {
    const s = await setup();
    const token = await invited(s);
    expect(await (await pub(s, "/portal/peek", { token })).json()).toMatchObject({
      ok: true,
      invited_email: "Ana@Example.com",
    });
    await pub(s, "/portal/opened", { token });
    const act = await pub(s, "/portal/activate", {
      token,
      fullName: "Ana Diaz",
      password: "long-password",
    });
    expect(await act.json()).toEqual({ status: "created", email: "ana@example.com" });

    // Signed in as the client (Cognito would supply these from the token)
    const client = { user: "ana", email: "ana@example.com" };
    const rpc = (name: string, json: object) =>
      s.api(`/rpc/${name}`, { method: "POST", json }, "f1", "client", client);
    expect(
      (await rpc("redeem_client_portal_invitation", { p_token: token })).body,
    ).toMatchObject({
      ok: true,
      estate_id: "e1",
      already_redeemed: false,
    });
    await rpc("record_client_portal_login", {});

    const mine = await q(
      s,
      "client_portal_requests",
      { action: "select" },
      "f1",
      "client",
      client,
    );
    expect(mine.body.data.map((r: { title: string }) => r.title)).toEqual(["Pay stubs"]);
    const est = await q(s, "estates", { action: "select" }, "f1", "client", client);
    expect(est.body.data.map((e: { id: string }) => e.id)).toEqual(["e1"]);

    // Can't write into someone else's estate, or touch staff tables
    const wrong = await q(
      s,
      "client_portal_messages",
      { action: "insert", values: { estate_id: "e2", body: "hi" } },
      "f1",
      "client",
      client,
    );
    expect(wrong.status).toBe(403);
    expect(
      (await q(s, "clients", { action: "select" }, "f1", "client", client)).status,
    ).toBe(403);
    expect((await s.api("/clients", {}, "f1", "client", client)).status).toBe(403);

    // Files: only their estate's folder in the portal bucket
    const own = await s.api(
      "/files/upload-url",
      {
        method: "POST",
        json: {
          bucket: "client-portal-uploads",
          path: "e1/stub.pdf",
          contentType: "application/pdf",
        },
      },
      "f1",
      "client",
      client,
    );
    expect(own.status).toBe(200);
    const other = await s.api(
      "/files/upload-url",
      {
        method: "POST",
        json: {
          bucket: "client-portal-uploads",
          path: "e2/x.pdf",
          contentType: "application/pdf",
        },
      },
      "f1",
      "client",
      client,
    );
    expect(other.status).toBe(403);

    // The link works once
    expect(await (await pub(s, "/portal/peek", { token })).json()).toEqual({
      ok: false,
      reason: "used",
    });
  });

  it("refuses a different person redeeming, and staff logins", async () => {
    const s = await setup();
    const token = await invited(s);
    const res = await s.api(
      "/rpc/redeem_client_portal_invitation",
      { method: "POST", json: { p_token: token } },
      "f1",
      "client",
      { user: "eve", email: "eve@x.com" },
    );
    expect(res.body).toEqual({ ok: false, reason: "email_mismatch" });
    s.portalUsers.set("ana@example.com", "trustee");
    const act = await pub(s, "/portal/activate", {
      token,
      fullName: "Ana Diaz",
      password: "long-password",
    });
    expect(await act.json()).toEqual({ error: "staff_account" });
  });
});

describe("document analysis for the app's documents", () => {
  it("writes document_analysis, tasks and a notification the app can read", async () => {
    const s = await setup();
    const doc = await q(s, "documents", {
      action: "insert",
      values: {
        title: "claim.pdf",
        storage_path: "u1/claim.pdf",
        type: "application/pdf",
        size: 100,
        user_id: "u1",
      },
    });
    const id = doc.body.data[0].id;
    expect(
      (await s.api(`/data/documents/${id}/analyze`, { method: "POST" })).status,
    ).toBe(202);

    const a = await q(s, "document_analysis", {
      action: "select",
      filters: [{ col: "document_id", op: "eq", value: id }],
    });
    expect(a.body.data[0].content.extracted_info.formType).toBe("form-31");
    const d = await q(s, "documents", {
      action: "select",
      filters: [{ col: "id", op: "eq", value: id }],
    });
    expect(d.body.data[0]).toMatchObject({ ai_processing_status: "complete" });
    expect(d.body.data[0].metadata.formType).toBe("form-31");
    const t = await q(s, "tasks", {
      action: "select",
      filters: [{ col: "document_id", op: "eq", value: id }],
    });
    expect(t.body.data).toHaveLength(1);
    expect((await q(s, "notifications", { action: "select" })).body.data[0].title).toBe(
      "Document analyzed",
    );
  });
});
