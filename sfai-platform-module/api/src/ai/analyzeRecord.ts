// Analysis for the FileSecure app's documents (crm.records, table "documents").
// Same Claude call as ai/analyze.ts; the results go where the app's screens read them:
//   document_analysis.content   { extracted_info, risks, summary, ... }
//   documents.ai_processing_status + metadata (formType, analysis_status...)
//   tasks                       one per medium/high risk
//   notifications               "Document analyzed" for the uploader
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { records } from "../db/schema.js";
import { ANALYZABLE, MAX_BYTES } from "./analyze.js";

type Row = Record<string, unknown>;
const now = () => new Date().toISOString();

// File type from the stored type, or from the file name
const EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain",
  csv: "text/csv",
};
const typeOf = (d: Row) => {
  const t = String(d.type ?? "");
  if (t.includes("/")) return t;
  const ext = String(d.storage_path ?? d.title ?? "")
    .split(".")
    .pop()!
    .toLowerCase();
  return EXT[ext] ?? t;
};

export async function analyzeRecord(ctx: Ctx, firmId: string, documentId: string) {
  const where = (tbl: string, id: string) =>
    and(eq(records.firmId, firmId), eq(records.tbl, tbl), eq(records.id, id));
  const merge = (id: string, data: Row) =>
    ctx.db
      .update(records)
      .set({
        data: sql`${records.data} || ${JSON.stringify({ ...data, updated_at: now() })}::jsonb`,
        updatedAt: new Date(),
      })
      .where(where("documents", id));
  const add = (tbl: string, data: Row, ownerId?: unknown) => {
    const id = randomUUID();
    return ctx.db.insert(records).values({
      firmId,
      tbl,
      id,
      ownerId: typeof ownerId === "string" ? ownerId : null,
      data: { id, created_at: now(), updated_at: now(), ...data },
    });
  };

  const [row] = await ctx.db.select().from(records).where(where("documents", documentId));
  if (!row) return; // deleted meanwhile
  const doc = row.data as Row;
  const metadata = (doc.metadata ?? {}) as Row;
  const contentType = typeOf(doc);

  await merge(documentId, { ai_processing_status: "processing" });
  try {
    if (!doc.storage_path) throw new Error("Document has no file");
    if (!ANALYZABLE.includes(contentType)) throw new Error("File type not supported");
    if (Number(doc.size ?? 0) > MAX_BYTES)
      throw new Error("File is too large to analyze (20 MB max)");
    const bytes = await ctx.svc.storage.read(`${firmId}/documents/${doc.storage_path}`);
    const a = await ctx.svc.readDocument(
      ctx,
      { name: String(doc.title ?? "document"), contentType },
      bytes,
    );
    const info = a.extracted_info;
    const high = a.risks.some((r) => r.severity === "high");

    // One analysis row per document (replace the previous one)
    await ctx.db
      .delete(records)
      .where(
        and(
          eq(records.firmId, firmId),
          eq(records.tbl, "document_analysis"),
          sql`${records.data}->>'document_id' = ${documentId}`,
        ),
      );
    await add(
      "document_analysis",
      {
        document_id: documentId,
        user_id: doc.user_id,
        content: { ...a, timestamp: now() },
        form_type: info.formType,
        form_number: info.formNumber,
        client_name: info.clientName,
        estate_number: info.estateNumber,
        risk_level: high ? "high" : a.risks.length ? "medium" : "low",
      },
      doc.user_id,
    );

    await merge(documentId, {
      ai_processing_status: "complete",
      metadata: {
        ...metadata,
        formType: info.formType,
        formNumber: info.formNumber,
        clientName: info.clientName,
        suggestedFolder: a.suggestedFolder,
        has_analysis: true,
        analysis_status: "complete",
        analysis_completed_at: now(),
      },
    });

    for (const r of a.risks.filter((x) => x.severity !== "low")) {
      await add("tasks", {
        title: r.requiredAction || r.description,
        description: r.description,
        priority: r.severity,
        severity: r.severity,
        status: "pending",
        regulation: r.regulation,
        solution: r.requiredAction,
        due_date: r.deadline && !isNaN(Date.parse(r.deadline)) ? r.deadline : null,
        document_id: documentId,
        form_number: info.formNumber,
        ai_generated: true,
        created_by: doc.user_id,
      });
    }
    if (doc.user_id) {
      await add(
        "notifications",
        {
          user_id: doc.user_id,
          title: "Document analyzed",
          message: `${doc.title}: ${a.risks.length} risk(s) found.`,
          type: high ? "warning" : "info",
          priority: high ? "high" : "normal",
          action_url: `/document/${documentId}`,
          read: false,
          metadata: { documentId, category: "file_activity" },
        },
        doc.user_id,
      );
    }
  } catch (e) {
    await merge(documentId, {
      ai_processing_status: "failed",
      metadata: {
        ...metadata,
        analysis_status: "failed",
        analysis_error: (e as Error).message,
      },
    });
    throw e; // the queue retries
  }
}
