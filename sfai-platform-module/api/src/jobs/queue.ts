// Background jobs (document analysis). Analysis can take a minute, longer than
// API Gateway's 30-second limit, so the API puts a job on SQS and returns at once.
// A worker Lambda picks it up (retries 3 times, then the dead-letter queue).
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import type { Config } from "../config.js";

export type Job = { type: "analyze"; firmId: string; documentId: string };
export type Queue = (job: Job) => Promise<void>;

// SQS when configured; otherwise `runInline` (local dev and tests)
export function createQueue(cfg: Config, runInline: Queue): Queue {
  if (!cfg.queueUrl) return runInline;
  const sqs = new SQSClient({ region: cfg.region });
  return async (job) => {
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: cfg.queueUrl,
        MessageBody: JSON.stringify(job),
      }),
    );
  };
}
