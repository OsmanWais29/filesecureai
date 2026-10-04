// The AWS replacements for the old Supabase Edge Functions: document analysis,
// search, tasks, notifications, signatures, chat/financials.
// (The client portal is covered in data.test.ts.)
// Each test also checks the hole the old function had (other firms, other users).
import { describe, expect, it } from "vitest";
import { notifications } from "../src/db/schema.js";
import { setup } from "./helpers.js";

// Upload a document (presign + complete); analysis runs inline in tests
async function upload(
  s: Awaited<ReturnType<typeof setup>>,
  over: Record<string, unknown> = {},
  firm = "f1",
) {
  const up = await s.api(
    "/documents/upload-url",
    {
      method: "POST",
      json: { name: "claim.pdf", contentType: "application/pdf", size: 1000, ...over },
    },
    firm,
  );
  expect(up.status).toBe(201);
  const done = await s.api(`/documents/${up.body.id}/complete`, { method: "POST" }, firm);
  expect(done.status).toBe(200);
  return up.body.id as string;
}

describe("document analysis (replaces the 6 DeepSeek functions)", () => {
  it("analyzes on upload, files it, links the client, makes tasks, notifies", async () => {
    const s = await setup();
    const client = await s.api("/clients", {
      method: "POST",
      json: { name: "Maria Lopez" },
    });
    const id = await upload(s);

    const doc = await s.api(`/documents/${id}`);
    expect(doc.body.analysisStatus).toBe("done");
    expect(doc.body.analysis.extracted_info.formType).toBe("form-31");
    expect(doc.body.analysis.risks).toHaveLength(2);
    expect(doc.body.folder).toBe("Proofs of claim");
    expect(doc.body.clientId).toBe(client.body.id); // matched by exact name
    expect(doc.body.s3Key).toBeUndefined(); // storage key never leaves the server

    // Only the high risk became a task (low ones are skipped)
    const tasks = await s.api(`/tasks?documentId=${id}`);
    expect(tasks.body).toHaveLength(1);
    expect(tasks.body[0]).toMatchObject({ priority: "high", source: "ai" });

    const notes = await s.api("/notifications");
    expect(notes.body[0].title).toBe("Document analyzed");
  });

  it("re-running replaces the AI tasks instead of duplicating them", async () => {
    const s = await setup();
    const id = await upload(s);
    expect((await s.api(`/documents/${id}/analyze`, { method: "POST" })).status).toBe(
      202,
    );
    expect((await s.api(`/tasks?documentId=${id}`)).body).toHaveLength(1);
  });

  it("records a failure instead of crashing the upload", async () => {
    const s = await setup(undefined, {
      analysis: () => {
        throw new Error("model unavailable");
      },
    });
    const up = await s.api("/documents/upload-url", {
      method: "POST",
      json: { name: "x.pdf", contentType: "application/pdf", size: 10 },
    });
    // The upload still succeeds; on AWS the queue would retry the analysis
    const done = await s.api(`/documents/${up.body.id}/complete`, { method: "POST" });
    expect(done.status).toBe(200);
    const doc = await s.api(`/documents/${up.body.id}`);
    expect(doc.body.analysisStatus).toBe("failed");
    expect(doc.body.analysisError).toBe("model unavailable");
  });

  it("only allows known file types and skips analysis for Word/Excel", async () => {
    const s = await setup();
    const bad = await s.api("/documents/upload-url", {
      method: "POST",
      json: { name: "x.html", contentType: "text/html", size: 10 },
    });
    expect(bad.status).toBe(400);
    const xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const id = await upload(s, { name: "budget.xlsx", contentType: xlsx });
    expect((await s.api(`/documents/${id}`)).body.analysisStatus).toBe("none");
  });

  it("never shows or analyzes another firm's document (old IDOR)", async () => {
    const s = await setup();
    const id = await upload(s, {}, "f2");
    expect((await s.api(`/documents/${id}`)).status).toBe(404);
    expect((await s.api(`/documents/${id}/analyze`, { method: "POST" })).status).toBe(
      404,
    );
    expect((await s.api(`/documents/${id}/download-url`)).status).toBe(404);
    expect((await s.api("/documents/not-a-uuid")).status).toBe(400);
  });
});

describe("search (replaces smart-search)", () => {
  it("finds documents by what the AI read, only in my firm", async () => {
    const s = await setup();
    const mine = await upload(s);
    await upload(s, {}, "f2"); // same content, other firm
    const hits = await s.api("/documents/search?q=proof claim bank");
    expect(hits.body.map((d: { id: string }) => d.id)).toEqual([mine]);
    expect((await s.api("/documents/search?q=")).body).toEqual([]);
  });
});

describe("signatures (replaces process-document)", () => {
  it("signer is the logged-in user; complete when all parties signed", async () => {
    const s = await setup();
    const id = await upload(s);
    await s.api(`/documents/${id}`, {
      method: "PATCH",
      json: { requiredParties: ["debtor", "trustee"] },
    });
    const sig = "data:image/png;base64,iVBORw0KGgo=";
    const wrong = await s.api(`/documents/${id}/signatures`, {
      method: "POST",
      json: { partyType: "witness", signatureData: sig },
    });
    expect(wrong.status).toBe(400);

    const one = await s.api(`/documents/${id}/signatures`, {
      method: "POST",
      json: { partyType: "debtor", signatureData: sig },
    });
    expect(one.body.complete).toBe(false);
    const two = await s.api(`/documents/${id}/signatures`, {
      method: "POST",
      json: { partyType: "trustee", signatureData: sig },
    });
    expect(two.body.complete).toBe(true);
    const doc = await s.api(`/documents/${id}`);
    expect(doc.body.status).toBe("signed");
    expect(doc.body.signatures[0].signerId).toBe("u1"); // from the login, not the body
  });

  it("can't sign another firm's document", async () => {
    const s = await setup();
    const id = await upload(s, {}, "f2");
    const res = await s.api(`/documents/${id}/signatures`, {
      method: "POST",
      json: { partyType: "debtor", signatureData: "data:image/png;base64,AA==" },
    });
    expect(res.status).toBe(404);
  });
});

describe("tasks", () => {
  it("creates, closes and filters, scoped to the firm", async () => {
    const s = await setup();
    const t = await s.api("/tasks", { method: "POST", json: { title: "Call creditor" } });
    expect(t.status).toBe(201);
    expect((await s.api("/tasks", {}, "f2")).body).toEqual([]);
    expect(
      (
        await s.api(
          `/tasks/${t.body.id}`,
          { method: "PATCH", json: { status: "done" } },
          "f2",
        )
      ).status,
    ).toBe(404);
    const done = await s.api(`/tasks/${t.body.id}`, {
      method: "PATCH",
      json: { status: "done" },
    });
    expect(done.body.doneAt).toBeTruthy();
    expect((await s.api("/tasks?status=done")).body).toHaveLength(1);
  });
});

describe("notifications (replaces handle-notifications)", () => {
  it("users only read and clear their own", async () => {
    const s = await setup();
    // u1 notifies a colleague u2 (same firm)
    await s.api("/notifications", {
      method: "POST",
      json: {
        userId: "u2",
        title: "Mention",
        message: "See this file",
        actionUrl: "/docs/1",
      },
    });
    expect((await s.api("/notifications")).body).toEqual([]); // u1 has none
    await s.api("/notifications", { method: "DELETE" }); // clears u1's only
    const rows = await s.crm.ctx.db.select().from(notifications);
    expect(rows.map((r) => r.userId)).toEqual(["u2"]); // u2's is untouched
  });

  it("rejects links to other websites (phishing)", async () => {
    const s = await setup();
    for (const actionUrl of ["https://evil.test", "//evil.test"]) {
      const res = await s.api("/notifications", {
        method: "POST",
        json: { title: "Hi", message: "Click", actionUrl },
      });
      expect(res.status).toBe(400);
    }
  });
});

describe("ai helpers", () => {
  it("financial check flags overspending and jumps (replaces analyze-financial-data)", async () => {
    const s = await setup();
    const res = await s.api("/ai/financials", {
      method: "POST",
      json: {
        current: { monthly_income: 4000, total_expenses: 3900, rent_mortgage: 2000 },
        history: [{ monthly_income: 4000, total_expenses: 3000, rent_mortgage: 1200 }],
      },
    });
    expect(res.body.warnings.join(" ")).toMatch(/90%.*Housing/);
    expect(res.body.anomalies[0]).toMatchObject({ field: "Housing", severity: "high" });
  });

  it("chat validates input before calling Bedrock", async () => {
    const s = await setup();
    const res = await s.api("/ai/chat", { method: "POST", json: { message: "" } });
    expect(res.status).toBe(400);
  });
});
