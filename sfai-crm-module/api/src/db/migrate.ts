// Applies SQL migrations from ./drizzle. Run on every deploy (CDK trigger) or locally:
//   npm run db:migrate
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { connect, type Db } from "./client.js";

// Migration bookkeeping lives in the "crm" schema too, away from the host's tables
export const migrationsSchema = "crm";
export const migrationsFolder = process.env.MIGRATIONS_DIR ?? "./drizzle";

export async function migrateDb(db: Db) {
  await migrate(db as unknown as NodePgDatabase, { migrationsFolder, migrationsSchema });
}

// CLI entry: `tsx src/db/migrate.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  await migrateDb(await connect());
  console.log("Migrations applied");
  process.exit(0);
}
