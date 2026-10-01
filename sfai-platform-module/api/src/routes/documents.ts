// /documents: upload (S3), list, search, AI analysis and e-signatures.
// Every query is scoped to the caller's firm; ids from the URL are validated.
import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Ctx } from "../context.js";
import { documents, signatures } from "../db/schema.js";
import { ANALYZABLE } from "../ai/analyze.js";
import { getClient, logActivity } from "../domain/firm.js";
import { body, fail, found, router, uuidParam } from "../lib/http.js";

const MAX_UPLOAD = 25 * 1024 * 1024; // 25 MB per file
// What may be uploaded: readable by Claude, plus Word/Excel for storage
const ALLOWED = [
  ...ANALYZABLE,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Never send the S3 key to the browser
const view = ({ s3Key, ...d }: typeof documents.$inferSelect) => d;

export default (ctx: Ctx) => {
  // Load one of the firm's documents, or 404
  const load = async (firmId: string, id: string) => {
    const [d] = await ctx.db
      .select()
      .from(documents)
      .where(and(eq(documents.firmId, firmId), eq(documents.id, id)));
    return found(d, "Document");
  };

  return (
    router()
      // List: all of the firm's documents, or one client's (?clientId=)
      .get("/", async (c) => {
        const { firmId } = c.get("user");
        const clientId = z.uuid().optional().safeParse(c.req.query("clientId"));
        if (!clientId.success) throw fail(400, "clientId must be a UUID");
        const rows = await ctx.db
          .select()
          .from(documents)
          .where(
            and(
              eq(documents.firmId, firmId),
              clientId.data ? eq(documents.clientId, clientId.data) : undefined,
            ),
          )
          .orderBy(desc(documents.createdAt))
          .limit(500);
        return c.json(rows.map(view));
      })

      // Search names + what the AI found (replaces smart-search). ?q=words
      .get("/search", async (c) => {
        const { firmId } = c.get("user");
        const q = (c.req.query("q") ?? "").trim().slice(0, 200);
        if (!q) return c.json([]);
        const doc = sql`to_tsvector('english', ${documents.name} || ' ' ||
          coalesce(${documents.searchText}, ''))`;
        const query = sql`websearch_to_tsquery('english', ${q})`;
        const rows = await ctx.db
          .select()
          .from(documents)
          .where(and(eq(documents.firmId, firmId), sql`${doc} @@ ${query}`))
          .orderBy(sql`ts_rank(${doc}, ${query}) desc`)
          .limit(20);
        return c.json(rows.map(view));
      })

      // Step 1: get a presigned link; the browser PUTs the file straight to S3
      .post("/upload-url", async (c) => {
        const user = c.get("user");
        const data = await body(
          c,
          z.object({
            clientId: z.uuid().optional(),
            name: z.string().min(1).max(200),
            folder: z.string().max(100).optional(),
            contentType: z.enum(ALLOWED as [string, ...string[]]),
            size: z.number().int().positive().max(MAX_UPLOAD),
          }),
        );
        if (data.clientId) {
          found(await getClient(ctx, user.firmId, data.clientId), "Client");
        }
        const s3Key = `${user.firmId}/${data.clientId ?? "firm"}/${randomUUID()}`;
        const [doc] = await ctx.db
          .insert(documents)
          .values({ ...data, firmId: user.firmId, s3Key, uploadedBy: user.id })
          .returning();
        const url = await ctx.svc.storage.uploadUrl(s3Key, data.contentType);
        return c.json({ id: doc.id, url }, 201);
      })

      // Step 2: browser confirms the upload; analysis starts in the background
      // unless {"analyze": false} is sent
      .post("/:id/complete", async (c) => {
        const user = c.get("user");
        const id = uuidParam(c);
        const { analyze = true } = await body(
          c,
          z.object({ analyze: z.boolean().optional() }),
        );
        const doc = await load(user.firmId, id);
        const queued = analyze && ANALYZABLE.includes(doc.contentType);
        const [row] = await ctx.db
          .update(documents)
          .set({ status: "uploaded", analysisStatus: queued ? "queued" : "none" })
          .where(eq(documents.id, doc.id))
          .returning();
        if (doc.clientId) {
          await logActivity(ctx, user.firmId, {
            clientId: doc.clientId,
            type: "note",
            text: `Document uploaded: ${doc.name}`,
            actor: user.id,
          });
        }
        if (queued) {
          await ctx.svc.queue({ type: "analyze", firmId: user.firmId, documentId: id });
        }
        return c.json(view(row));
      })

      // One document with its analysis and signatures
      .get("/:id", async (c) => {
        const { firmId } = c.get("user");
        const doc = await load(firmId, uuidParam(c));
        const signed = await ctx.db
          .select()
          .from(signatures)
          .where(eq(signatures.documentId, doc.id));
        return c.json({ ...view(doc), signatures: signed });
      })

      // Rename, file into a folder, link to a client, set who must sign
      .patch("/:id", async (c) => {
        const { firmId } = c.get("user");
        const doc = await load(firmId, uuidParam(c));
        const patch = await body(
          c,
          z
            .object({
              name: z.string().min(1).max(200),
              folder: z.string().max(100).nullable(),
              clientId: z.uuid().nullable(),
              requiredParties: z.array(z.string().min(1).max(40)).max(10),
            })
            .partial()
            .refine((p) => Object.keys(p).length, "Nothing to change"),
        );
        if (patch.clientId) found(await getClient(ctx, firmId, patch.clientId), "Client");
        const [row] = await ctx.db
          .update(documents)
          .set(patch)
          .where(eq(documents.id, doc.id))
          .returning();
        return c.json(view(row));
      })

      // Re-run the AI analysis
      .post("/:id/analyze", async (c) => {
        const { firmId } = c.get("user");
        const doc = await load(firmId, uuidParam(c));
        if (doc.status === "pending") throw fail(409, "Upload not finished");
        if (!ANALYZABLE.includes(doc.contentType)) {
          throw fail(400, "This file type can't be analyzed (use PDF, image or text)");
        }
        await ctx.db
          .update(documents)
          .set({ analysisStatus: "queued", analysisError: null })
          .where(eq(documents.id, doc.id));
        await ctx.svc.queue({ type: "analyze", firmId, documentId: doc.id });
        return c.json({ status: "queued" }, 202);
      })

      .get("/:id/download-url", async (c) => {
        const { firmId } = c.get("user");
        const doc = await load(firmId, uuidParam(c));
        if (doc.status === "pending") throw fail(409, "Upload not finished");
        return c.json({ url: await ctx.svc.storage.downloadUrl(doc.s3Key, doc.name) });
      })

      // Sign as the logged-in user (replaces process-document "sign").
      // When every required party has signed, the document is marked signed.
      .post("/:id/signatures", async (c) => {
        const user = c.get("user");
        const doc = await load(user.firmId, uuidParam(c));
        const { partyType, signatureData } = await body(
          c,
          z.object({
            partyType: z.string().min(1).max(40),
            signatureData: z
              .string()
              .regex(/^data:image\/(png|jpeg|svg\+xml);base64,/, "Must be an image")
              .max(300_000),
          }),
        );
        const need = doc.requiredParties;
        if (need.length && !need.includes(partyType)) {
          throw fail(400, `This document needs: ${need.join(", ")}`);
        }
        await ctx.db
          .insert(signatures)
          .values({
            firmId: user.firmId,
            documentId: doc.id,
            signerId: user.id,
            signerName: user.name ?? user.email ?? null,
            partyType,
            signatureData,
            ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
          })
          .onConflictDoNothing(); // signing twice changes nothing

        const done = await ctx.db
          .select({ party: signatures.partyType })
          .from(signatures)
          .where(eq(signatures.documentId, doc.id));
        const parties = new Set(done.map((s) => s.party));
        const complete = need.length > 0 && need.every((p) => parties.has(p));
        if (complete) {
          await ctx.db
            .update(documents)
            .set({ status: "signed" })
            .where(eq(documents.id, doc.id));
        }
        return c.json({ signed: [...parties], complete }, 201);
      })
  );
};
