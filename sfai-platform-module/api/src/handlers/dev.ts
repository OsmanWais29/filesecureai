// Local dev server: `npm run dev` -> http://localhost:3000/api
// Uses PGlite (data kept in ./.data), demo login headers and a local encryption key.
// Email/SMS/S3 calls are logged instead of sent unless AWS credentials are configured.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createSfaiModule, devAuth, toNodeHandler } from "../index.js";
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
const devUsers = new Set<string>();

const crm = await createSfaiModule({
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
          read: (key) => readFile(`./.data/files/${key}`),
        },
        // Portal logins: kept in memory (no Cognito locally)
        identity: {
          roleOf: async (email) => (devUsers.has(email) ? "client" : null),
          createClientUser: async (u) => {
            console.log(`[portal] login created for ${u.email}`);
            devUsers.add(u.email);
          },
        },
      },
});

await ensureFirm(crm.ctx, "demo-firm", "Demo Trustee Firm");
await seed(db, "demo-firm");

// Stand-in for S3 so uploads/downloads work offline: files go to ./.data/files
async function fakeS3(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, PUT");
  res.setHeader("access-control-allow-headers", "content-type");
  const file = `./.data/files/${decodeURIComponent(req.url!.split("?")[0].slice(9))}`;
  if (file.includes("..")) return res.writeHead(400).end();
  if (req.method === "PUT") {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, Buffer.concat(chunks));
    return res.writeHead(200).end();
  }
  if (req.method === "GET") {
    return readFile(file).then(
      (b) => res.writeHead(200).end(b),
      () => res.writeHead(404).end(),
    );
  }
  res.writeHead(204).end(); // CORS preflight
}

const api = toNodeHandler(crm);
createServer((req, res) =>
  req.url?.startsWith("/fake-s3/") ? fakeS3(req, res) : api(req, res),
).listen(3000, () =>
  console.log("SFAI CRM API on http://localhost:3000/api (firm: demo-firm)"),
);
