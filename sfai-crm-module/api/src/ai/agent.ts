// "Ask your CRM": Claude on Amazon Bedrock, answering from the firm's own data.
//
// How the agent loop works:
//   1. The user's question (plus earlier turns) goes to Claude with the CRM tools.
//   2. Claude decides which tools to call (e.g. search_clients, list_deadlines).
//   3. The SDK's tool runner runs those tools here, against this firm's data only,
//      and sends the results back. Steps 2-3 repeat until Claude can answer.
//   4. Emails are only ever DRAFTED; a person approves them in the CRM.
//
// Runs IAM-signed in the Lambda's role (needs bedrock-mantle:CreateInference).
import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";
import { betaRefusalFallbackMiddleware } from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { Ctx } from "../context.js";
import { crmTools } from "./tools.js";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}
export interface AgentReply {
  text: string;
  draftIds: string[]; // drafts created during this answer (approve via /drafts)
}

const SYSTEM = `You are the assistant inside a CRM used by a Canadian Licensed Insolvency
Trustee (LIT) practice. Staff ask about clients, deadlines, leads, pipeline and reports.

- Answer only from tool results. If the data doesn't say, say you don't know.
- Look things up before answering; don't guess client names, numbers or dates.
- Keep answers short and scannable: a sentence, then bullets with names and figures.
- Money is in CAD. Statutory (BIA) deadlines matter most; mention overdue ones first.
- To email clients, use draft_email. Nothing is sent until staff approve the draft.
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
  const draftIds: string[] = [];

  // The shared CRM tools, in the shape the Claude SDK's tool runner expects
  const tools = crmTools(ctx, firmId, "assistant", (id) => draftIds.push(id)).map((t) =>
    betaZodTool({
      name: t.name,
      description: t.description,
      inputSchema: t.input,
      run: t.run,
    }),
  );

  // Earlier turns are sent as plain text, so the history is always append-only
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({
    role: t.role,
    content: t.text,
  }));

  // Steps 2-3 above: the tool runner loops until Claude has a final answer
  const final = await bedrock(ctx).beta.messages.toolRunner({
    model: ctx.cfg.bedrock.model,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort: "medium" }, // routine lookups; raise for harder analysis
    tools,
    messages,
    max_iterations: 10, // safety cap on tool rounds
  });

  if (final.stop_reason === "refusal") {
    return { text: "I can't help with that request. Try rephrasing it.", draftIds: [] };
  }
  const text = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return { text: text || "I couldn't find an answer to that.", draftIds };
}
