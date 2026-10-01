// Lambda that applies database migrations. CDK runs it after every deploy.
import { loadSecretsIntoEnv } from "../config.js";
import { connect } from "../db/client.js";
import { migrateDb } from "../db/migrate.js";

export const handler = async () => {
  await loadSecretsIntoEnv();
  await migrateDb(await connect());
  return { ok: true };
};
