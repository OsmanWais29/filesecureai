// AWS Lambda entry point (bundled by CDK). Built once per cold start.
import { createCrmModule } from "../index.js";

const crm = await createCrmModule();

export const handler = crm.lambda;
