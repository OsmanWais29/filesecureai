// /ai: general AI helpers.
//   POST /ai/chat        the trustee assistant chat (replaces deepseek-chat)
//   POST /ai/financials  monthly budget check (replaces analyze-financial-data)
// For questions about the firm's own data, use /assistant (it has CRM tools).
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { Ctx } from "../context.js";
import { bedrock } from "../ai/client.js";
import { checkFinancials } from "../domain/financials.js";
import { body, router } from "../lib/http.js";

const SYSTEM = `You are an assistant for staff at a Canadian Licensed Insolvency Trustee
practice. You explain the BIA, OSB forms and directives, consumer proposals and
bankruptcies in plain language. Be concise. You are not a lawyer: for decisions on
a specific file, say the trustee should review. Never ask for or repeat a SIN.`;

const Month = z.object({
  monthly_income: z.number().min(0),
  total_expenses: z.number().min(0),
  rent_mortgage: z.number().min(0).optional(),
  food: z.number().min(0).optional(),
  transportation: z.number().min(0).optional(),
});

export default (ctx: Ctx) =>
  router()
    .post("/chat", async (c) => {
      const { message, history, category } = await body(
        c,
        z.object({
          message: z.string().min(1).max(8000),
          category: z.string().max(50).optional(), // topic hint from the screen
          history: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                text: z.string().min(1).max(8000),
              }),
            )
            .max(20)
            .default([]),
        }),
      );
      const messages: Anthropic.MessageParam[] = [
        ...history.map((t) => ({ role: t.role, content: t.text })),
        { role: "user", content: category ? `[${category}] ${message}` : message },
      ];
      const res = await bedrock(ctx).messages.create({
        model: ctx.cfg.bedrock.model,
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { effort: "low" }, // chat: quick answers
        messages,
      });
      if (res.stop_reason === "refusal") {
        return c.json({ response: "I can't help with that. Try rephrasing it." });
      }
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      return c.json({ response: text });
    })

    .post("/financials", async (c) => {
      const { current, history } = await body(
        c,
        z.object({ current: Month, history: z.array(Month).max(36).default([]) }),
      );
      return c.json(checkFinancials(current, history));
    });
