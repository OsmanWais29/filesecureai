// Database connection. Works with any Postgres (RDS on AWS, Docker locally).
// The host project can also pass in its own Drizzle instance instead.
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import pg from "pg";
import * as schema from "./schema.js";

// Any Drizzle Postgres database (node-postgres, PGlite in tests, ...)
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

// DATABASE_URL wins; otherwise build it from the RDS-generated secret (DB_SECRET_ARN)
async function databaseUrl(): Promise<string> {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const arn = process.env.DB_SECRET_ARN;
  if (!arn) throw new Error("Set DATABASE_URL or DB_SECRET_ARN");
  const sm = new SecretsManagerClient({});
  const res = await sm.send(new GetSecretValueCommand({ SecretId: arn }));
  const s = JSON.parse(res.SecretString ?? "{}");
  const user = encodeURIComponent(s.username);
  const pass = encodeURIComponent(s.password);
  return `postgres://${user}:${pass}@${s.host}:${s.port}/${s.dbname ?? "postgres"}`;
}

// Small pool: each Lambda instance handles one request at a time
export async function connect(): Promise<Db> {
  const url = await databaseUrl();
  const local = /localhost|127\.0\.0\.1/.test(url);
  const pool = new pg.Pool({
    connectionString: url,
    max: 2,
    // RDS uses verified TLS. On Lambda, NODE_EXTRA_CA_CERTS loads the RDS CA bundle.
    ssl: local ? undefined : { rejectUnauthorized: true },
  });
  return drizzle(pool, { schema }) as unknown as Db;
}
