// /mcp: the CRM as an MCP server, so Claude Desktop, Claude Code or any other
// MCP-capable agent can use it (Streamable HTTP transport).
//
// - Same login as the app: send "Authorization: Bearer <Cognito ID token>".
// - Same tools as "Ask your CRM" (ai/tools.ts), scoped to the caller's firm.
// - Stateless: a fresh server per request, so it runs fine on Lambda.
// - draft_email only saves a draft; a person approves it in the CRM.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as http from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Ctx } from "../context.js";
import { crmTools } from "../ai/tools.js";
import { router } from "../lib/http.js";

export default (ctx: Ctx) =>
  router().all("/", async (c) => {
    const server = new McpServer({ name: "sfai-crm", version: "0.1.0" });

    // Register each shared tool; results go back as text
    for (const t of crmTools(ctx, c.get("user").firmId, "mcp")) {
      server.registerTool(
        t.name,
        {
          description: t.description,
          inputSchema: t.input,
          annotations: { readOnlyHint: t.readOnly, openWorldHint: false },
        },
        async (args: unknown) => ({
          content: [{ type: "text", text: await t.run(args) }],
        }),
      );
    }

    // JSON responses (no long-lived stream) suit Lambda + API Gateway
    const transport = new http.WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });
