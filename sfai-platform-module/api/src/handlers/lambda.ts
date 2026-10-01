// AWS Lambda entry point (bundled by CDK). Built once per cold start.
import { createSfaiModule } from "../index.js";

const crm = await createSfaiModule();

export const handler = crm.lambda;
