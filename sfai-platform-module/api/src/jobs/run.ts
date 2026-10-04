// Runs one background job. Called by the worker Lambda for each SQS message,
// or directly (inline) in local dev and tests.
import type { Ctx } from "../context.js";
import { analyzeDocument } from "../ai/analyze.js";
import { analyzeRecord } from "../ai/analyzeRecord.js";
import type { Job } from "./queue.js";

export async function runJob(ctx: Ctx, job: Job) {
  if (job.type === "analyze") await analyzeDocument(ctx, job.firmId, job.documentId);
  if (job.type === "analyze-record") await analyzeRecord(ctx, job.firmId, job.documentId);
}
