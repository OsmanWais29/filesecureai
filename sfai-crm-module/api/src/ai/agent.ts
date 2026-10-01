// "Ask your CRM": Claude on Amazon Bedrock, answering from the firm's own data.
// Runs IAM-signed in the Lambda's role (needs bedrock-mantle:CreateInference).
import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";
import { betaRefusalFallbackMiddleware } from "@anthropic-ai/sdk";
import type Anthropic from "@anthropic-ai/sdk";
import type { Ctx } from "../context.js";
import { crmTools, type EmailDraft } from "./tools.js";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}
export interface AgentReply {
  text: string;
  drafts: EmailDraft[];
}

const SYSTEM = `You are the assistant inside a CRM used by a Canadian Licensed Insolvency
Trustee (LIT) practice. Staff ask about clients, deadlines, leads, pipeline and reports.

- Answer only from tool results. If the data doesn't say, say you don't know.
- Look things up before answering; don't guess client names, numbers or dates.
- Keep answers short and scannable: a sentence, then bullets with names and figures.
- Money is in CAD. Statutory (BIA) deadlines matter most; mention overdue ones first.
- To email clients, use draft_email. Nothing is sent until the user confirms in the app.
- Never reveal or ask for a SIN. Don't give legal advice; suggest the trustee review.`;

// One client per Lambda instance. If Claude declines a request, the SDK
// middleware retries it once on the fallback model.
let client: AnthropicBedrockMantle | undefined;
const bedrock = (ctx: Ctx) =>
  (client ??= new AnthropicBedrockMantle({
    awsRegion: ctx.cfg.bedrock.region,
    middleware: [
      betaRefusalFallbackMiddleware([{ model: ctx.cfg.bedrock.fallbackModel }]),
    ],
  }));

export async function ask(
  ctx: Ctx,
  firmId: string,
  history: ChatTurn[],
): Promise<AgentReply> {
  const drafts: EmailDraft[] = [];
  // Earlier turns are sent as plain text, so the history is always append-only
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({
    role: t.role,
    content: t.text,
  }));

  // The SDK's tool runner calls our tools and loops until Claude has an answer
  const final = await bedrock(ctx).beta.messages.toolRunner({
    model: ctx.cfg.bedrock.model,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort: "medium" }, // routine lookups; raise for harder analysis
    tools: crmTools(ctx, firmId, drafts),
    messages,
    max_iterations: 10,
  });

  if (final.stop_reason === "refusal") {
    return { text: "I can't help with that request. Try rephrasing it.", drafts: [] };
  }
  const text = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return { text: text || "I couldn't find an answer to that.", drafts };
}
