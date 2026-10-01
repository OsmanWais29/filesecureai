// Local dev server: `npm run dev` -> http://localhost:3000/crm
// Uses PGlite (data kept in ./.data), demo login headers and a local encryption key.
// Email/SMS/S3 calls are logged instead of sent unless AWS credentials are configured.
import { createServer } from "node:http";
import { createCrmModule, devAuth, toNodeHandler } from "../index.js";
import { connect } from "../db/client.js";
import { localDb } from "../db/local.js";
import { migrateDb } from "../db/migrate.js";
import { seed } from "../db/seed.js";
import { ensureFirm } from "../domain/firm.js";

// Fixed dev-only key so encrypted demo data survives restarts.
// Never used on AWS: KMS encrypts there.
process.env.LOCAL_ENCRYPTION_KEY ??= "00".repeat(32);

// DATABASE_URL -> your Postgres (migrated on start); otherwise PGlite in ./.data
const db = process.env.DATABASE_URL ? await connect() : await localDb("./.data");
if (process.env.DATABASE_URL) await migrateDb(db);
const live = process.env.DEV_LIVE_AWS === "true"; // opt in to real SES/SNS/S3

const crm = await createCrmModule({
  db,
  authenticate: devAuth, // trusts x-dev-firm / x-dev-user headers: local only!
  services: live
    ? {}
    : {
        mail: async (firmId, e) => {
          console.log(`[email] ${firmId} -> ${e.to}: ${e.subject}`);
          return { via: "ses", id: crypto.randomUUID(), threadId: null };
        },
        sms: async (firmId, to, text) => (
          console.log(`[sms] ${firmId} -> ${to}: ${text}`),
          "sns"
        ),
        storage: {
          uploadUrl: async (key) => `http://localhost:3000/fake-s3/${key}`,
          downloadUrl: async (key) => `http://localhost:3000/fake-s3/${key}`,
        },
      },
});

await ensureFirm(crm.ctx, "demo-firm", "Demo Trustee Firm");
await seed(db, "demo-firm");

createServer(toNodeHandler(crm)).listen(3000, () =>
  console.log("SFAI CRM API on http://localhost:3000/crm (firm: demo-firm)"),
);
