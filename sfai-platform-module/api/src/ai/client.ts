// One Claude-on-Bedrock client per Lambda instance, shared by every AI feature.
// IAM-signed with the Lambda's role (needs bedrock-mantle:CreateInference).
// If Claude declines a request, the middleware retries it once on the fallback model.
import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";
import { betaRefusalFallbackMiddleware } from "@anthropic-ai/sdk";
import type { Ctx } from "../context.js";

let client: AnthropicBedrockMantle | undefined;

export const bedrock = (ctx: Ctx) =>
  (client ??= new AnthropicBedrockMantle({
    awsRegion: ctx.cfg.bedrock.region,
    middleware: [
      betaRefusalFallbackMiddleware([{ model: ctx.cfg.bedrock.fallbackModel }]),
    ],
  }));
