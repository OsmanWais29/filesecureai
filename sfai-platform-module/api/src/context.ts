// The shared "context" handed to every route and job: database, config, services.
// Services are swappable so tests (or a host project) can replace any of them.
import type { Config } from "./config.js";
import type { Db } from "./db/client.js";
import { createCrypto, type Crypto } from "./lib/crypto.js";
import { createMailer, type Mailer } from "./integrations/email.js";
import { createSms, type Sms } from "./integrations/sms.js";
import { createStorage, type Storage } from "./integrations/storage.js";
import { createIdentity, type Identity } from "./integrations/identity.js";
import { createQueue, type Queue } from "./jobs/queue.js";
import { runJob } from "./jobs/run.js";
import { readDocument, type ReadDocument } from "./ai/analyze.js";

export interface Services {
  crypto: Crypto; // encrypt SIN / tokens
  mail: Mailer; // sends via Gmail, Outlook or SES
  sms: Sms; // sends via Twilio or SNS
  storage: Storage; // S3 presigned upload/download links
  fetch: typeof fetch; // outbound HTTP (OAuth, calendars, Twilio)
  queue: Queue; // background jobs (SQS -> worker Lambda)
  identity: Identity; // client-portal logins (Cognito)
  readDocument: ReadDocument; // Claude reads one file (swapped out in tests)
}

export interface Ctx {
  db: Db;
  cfg: Config;
  svc: Services;
}

export function createContext(
  db: Db,
  cfg: Config,
  overrides: Partial<Services> = {},
): Ctx {
  const ctx = { db, cfg, svc: {} as Services };
  const crypto = overrides.crypto ?? createCrypto(cfg);
  ctx.svc = {
    crypto,
    fetch: overrides.fetch ?? fetch,
    storage: overrides.storage ?? createStorage(cfg),
    mail: overrides.mail ?? createMailer(ctx),
    sms: overrides.sms ?? createSms(ctx),
    // No SQS locally: run the job now; a failure is saved on the document, not thrown
    queue:
      overrides.queue ??
      createQueue(cfg, (job) => runJob(ctx, job).catch((e) => console.error("Job", e))),
    identity: overrides.identity ?? createIdentity(cfg),
    readDocument: overrides.readDocument ?? readDocument,
  };
  return ctx;
}
