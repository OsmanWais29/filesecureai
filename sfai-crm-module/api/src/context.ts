// The shared "context" handed to every route and job: database, config, services.
// Services are swappable so tests (or a host project) can replace any of them.
import type { Config } from "./config.js";
import type { Db } from "./db/client.js";
import { createCrypto, type Crypto } from "./lib/crypto.js";
import { createMailer, type Mailer } from "./integrations/email.js";
import { createSms, type Sms } from "./integrations/sms.js";
import { createStorage, type Storage } from "./integrations/storage.js";

export interface Services {
  crypto: Crypto; // encrypt SIN / tokens
  mail: Mailer; // sends via Gmail, Outlook or SES
  sms: Sms; // sends via Twilio or SNS
  storage: Storage; // S3 presigned upload/download links
  fetch: typeof fetch; // outbound HTTP (OAuth, calendars, Twilio)
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
  };
  return ctx;
}
