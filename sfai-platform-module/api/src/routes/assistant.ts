// /assistant: chat with "Ask your CRM". Drafted emails come back for confirmation;
// the front end sends confirmed drafts to POST /messages/email.
import { z } from "zod";
import type { Ctx } from "../context.js";
import type { AgentReply, ChatTurn } from "../ai/agent.js";
import { body, router } from "../lib/http.js";

// The agent is injectable so tests don't call Bedrock
export type Ask = (ctx: Ctx, firmId: string, history: ChatTurn[]) => Promise<AgentReply>;

const Chat = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40), // keep conversations bounded
});

export default (ctx: Ctx, ask: Ask) =>
  router().post("/", async (c) => {
    const { messages } = await body(c, Chat);
    if (messages.at(-1)?.role !== "user")
      return c.json({ error: "Last turn must be the user" }, 400);
    return c.json(await ask(ctx, c.get("user").firmId, messages));
  });
