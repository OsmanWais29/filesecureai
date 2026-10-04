// Local dev server: `npm run dev` -> http://localhost:3000/api
// Uses PGlite (data kept in ./.data), demo login headers and a local encryption key.
// Email/SMS/S3 calls are logged instead of sent unless AWS credentials are configured.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createSfaiModule, devAuth, toNodeHandler } from "../index.js";
import { connect } from "../db/client.js";
import { localDb } from "../db/local.js";
import { migrateDb } from "../db/migrate.js";
import { seed } from "../db/seed.js";
import { ensureFirm } from "../domain/firm.js";
import type { NewUser } from "../integrations/identity.js";
import { records } from "../db/schema.js";

// Fixed dev-only key so encrypted demo data survives restarts.
// Never used on AWS: KMS encrypts there.
process.env.LOCAL_ENCRYPTION_KEY ??= "00".repeat(32);

// DATABASE_URL -> your Postgres (migrated on start); otherwise PGlite in ./.data
const db = process.env.DATABASE_URL ? await connect() : await localDb("./.data");
if (process.env.DATABASE_URL) await migrateDb(db);
const live = process.env.DEV_LIVE_AWS === "true"; // opt in to real SES/SNS/S3
// Local accounts: email -> user. Demo login: trustee@demo.test / demo-password
const devUsers = new Map<string, NewUser & { id: string }>([
  [
    "trustee@demo.test",
    {
      id: "dev-user",
      email: "trustee@demo.test",
      name: "Dev Trustee",
      password: "demo-password",
      firmId: "demo-firm",
      role: "trustee",
    },
  ],
]);

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
          remove: async (keys) => {
            for (const k of keys) await rm(`./.data/files/${k}`, { force: true });
          },
          list: async (prefix) => {
            const dir = `./.data/files/${prefix}`;
            const names = await readdir(dir).catch(() => [] as string[]);
            return Promise.all(
              names.map(async (n) => {
                const st = await stat(dir + n);
                return {
                  key: prefix + n,
                  size: st.size,
                  updated: st.mtime.toISOString(),
                };
              }),
            );
          },
        },
        // Logins: kept in memory (no Cognito locally), see devLogin below
        identity: {
          roleOf: async (email) => devUsers.get(email)?.role ?? null,
          createUser: async (u) => {
            const id = crypto.randomUUID();
            devUsers.set(u.email, { ...u, id });
            console.log(`[login] ${u.role} account created for ${u.email}`);
            return id;
          },
        },
      },
});

await ensureFirm(crm.ctx, "demo-firm", "Demo Trustee Firm");
await seed(db, "demo-firm");
// The demo trustee's profile + role rows (what sign-up creates for real users)
for (const [tbl, data] of [
  [
    "profiles",
    {
      id: "dev-user",
      user_id: "dev-user",
      email: "trustee@demo.test",
      full_name: "Dev Trustee",
    },
  ],
  ["user_roles", { id: "dev-user-role", user_id: "dev-user", role: "trustee" }],
] as const) {
  await db
    .insert(records)
    .values({ firmId: "demo-firm", tbl, id: data.id, ownerId: "dev-user", data })
    .onConflictDoNothing();
}

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

// Stand-in for Cognito sign-in: email + password -> an unsigned dev token that
// only devAuth accepts. The web app's dev mode calls this instead of Cognito.
async function devLogin(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method !== "POST") return res.writeHead(204).end(); // CORS preflight
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const { email = "", password = "" } = JSON.parse(
    Buffer.concat(chunks).toString() || "{}",
  );
  const u = devUsers.get(String(email).toLowerCase());
  const json = { "content-type": "application/json" };
  if (!u || u.password !== password) {
    return res
      .writeHead(401, json)
      .end(JSON.stringify({ error: "Incorrect email or password" }));
  }
  const user = { id: u.id, firmId: u.firmId, email: u.email, name: u.name, role: u.role };
  const token = "dev." + Buffer.from(JSON.stringify(user)).toString("base64url");
  res.writeHead(200, json).end(JSON.stringify({ token, user }));
}

const api = toNodeHandler(crm);
createServer((req, res) =>
  req.url?.startsWith("/fake-s3/")
    ? fakeS3(req, res)
    : req.url === "/dev-login"
      ? devLogin(req, res)
      : api(req, res),
).listen(3000, () =>
  console.log(
    "SFAI API on http://localhost:3000/api (demo login: trustee@demo.test / demo-password)",
  ),
);
