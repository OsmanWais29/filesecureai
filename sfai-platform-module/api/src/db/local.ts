// In-process Postgres (PGlite) for local dev and tests: no Docker, no AWS.
// Pass a folder to keep data between restarts, or nothing for in-memory.
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from "./client.js";
import { migrationsFolder, migrationsSchema } from "./migrate.js";
import * as schema from "./schema.js";

export async function localDb(dataDir?: string): Promise<Db> {
  const db = drizzle(new PGlite(dataDir), { schema });
  await migrate(db, { migrationsFolder, migrationsSchema });
  return db as unknown as Db;
}
