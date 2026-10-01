// All settings come from environment variables (never hardcoded).
// On AWS, secrets live in Secrets Manager and are loaded once per cold start.
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export interface Config {
  region: string; // AWS region for S3, KMS, SES, SNS
  basePath: string; // where the module is mounted, e.g. "/api"
  appUrl: string; // front-end URL (CORS + OAuth redirect back)
  publicApiUrl: string; // this API's public URL (OAuth callbacks, embed script)
  docsBucket: string; // S3 bucket for client documents
  kmsKeyId?: string; // KMS key for SIN + OAuth tokens (local key used if unset)
  localKey?: string; // dev/test only: 32-byte hex key instead of KMS
  emailFrom: string; // default "from" address for SES
  stateSecret: string; // signs OAuth "state" values
  cognito?: { userPoolId: string; clientId: string };
  bedrock: {
    region: string;
    model: string; // "Ask your CRM" agent + chat
    analysisModel: string; // document analysis (set a cheaper model here if you like)
    fallbackModel: string;
  };
  queueUrl?: string; // SQS queue for background jobs (runs inline when unset: local dev)
  google?: { clientId: string; clientSecret: string };
  microsoft?: { clientId: string; clientSecret: string; tenant: string };
}

const env = (k: string, fallback = "") => process.env[k] ?? fallback;

// Pair of env vars -> object, or undefined when either is missing
const pair = (id: string, secret: string) =>
  env(id) && env(secret) ? { clientId: env(id), clientSecret: env(secret) } : undefined;

export function loadConfig(): Config {
  const region = env("AWS_REGION", "ca-central-1");
  const ms = pair("MS_CLIENT_ID", "MS_CLIENT_SECRET");
  return {
    region,
    basePath: env("API_BASE_PATH", "/api"),
    appUrl: env("APP_URL", "http://localhost:5173"),
    publicApiUrl: env("PUBLIC_API_URL", "http://localhost:3000"),
    docsBucket: env("DOCS_BUCKET"),
    kmsKeyId: env("KMS_KEY_ID") || undefined,
    localKey: env("LOCAL_ENCRYPTION_KEY") || undefined,
    emailFrom: env("EMAIL_FROM", "no-reply@example.com"),
    stateSecret: env("OAUTH_STATE_SECRET", "dev-only-state-secret"),
    cognito: env("COGNITO_USER_POOL_ID")
      ? { userPoolId: env("COGNITO_USER_POOL_ID"), clientId: env("COGNITO_CLIENT_ID") }
      : undefined,
    bedrock: {
      // ca-central-1 serves Claude via Global or US routing (no Canada-only option)
      region: env("BEDROCK_REGION", region),
      model: env("BEDROCK_MODEL_ID", "anthropic.claude-opus-5-5"),
      analysisModel: env(
        "ANALYSIS_MODEL_ID",
        env("BEDROCK_MODEL_ID", "anthropic.claude-opus-5-5"),
      ),
      fallbackModel: env("BEDROCK_FALLBACK_MODEL_ID", "anthropic.claude-opus-4-8"),
    },
    queueUrl: env("JOBS_QUEUE_URL") || undefined,
    google: pair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
    microsoft: ms && { ...ms, tenant: env("MS_TENANT", "common") },
  };
}

// Copy a Secrets Manager JSON secret into process.env (once per Lambda cold start).
// Lets OAuth client secrets etc. stay out of plain Lambda environment variables.
export async function loadSecretsIntoEnv(secretArn = env("CRM_SECRET_ARN")) {
  if (!secretArn) return;
  const sm = new SecretsManagerClient({});
  const res = await sm.send(new GetSecretValueCommand({ SecretId: secretArn }));
  const values = JSON.parse(res.SecretString ?? "{}") as Record<string, string>;
  for (const [k, v] of Object.entries(values)) process.env[k] ??= v;
}
