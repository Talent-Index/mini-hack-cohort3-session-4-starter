// ChainKit as an MCP server, wired into an agent
//
// Before running this, start the ChainKit MCP server in another terminal:
//   npm run mcp-server
//   (which runs: chainkit `mcp start --transport sse --port 2718`)
// The SSE transport's stream endpoint is at /sse, so set:
//   CHAINKIT_MCP_URL=http://localhost:2718/sse   (in your .env)
//
// NOTE: @avalanche-sdk/chainkit@0.3.13's bundled MCP server ships a bug that
// crashes it on startup ("Schema method literal must be a string" — its zod-v4
// literal reader looks at def.value instead of def.values[0]). This repo patches
// it via patch-package (see patches/), applied automatically on npm install.
//
// This agent then asks a plain-English question, the model decides to
// call a ChainKit tool, and the tool call is forwarded straight to the
// running MCP server, no manual SDK calls in this file at all.

import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { createModelClient } from "./model-provider.js";

const SYSTEM_PROMPT = "You are Mini Hack Assistant. Use tools when they genuinely help; otherwise answer directly.";

async function connectChainkitMcp() {
  const url = process.env.CHAINKIT_MCP_URL;
  if (!url) throw new Error("Set CHAINKIT_MCP_URL in your .env first, from the running mcp-server output.");

  const mcpClient = new Client({ name: "mini-hack-agent", version: "1.0.0" });
  // ChainKit's `mcp start --transport sse` serves the legacy MCP SSE transport
  // (GET /sse to open the stream, POST /message to send), not Streamable HTTP —
  // so connect with the matching SSE client transport.
  const transport = new SSEClientTransport(new URL(url));
  await mcpClient.connect(transport);
  return mcpClient;
}

async function main() {
  const rl = readline.createInterface({ input, output });
  const messages = [];

  const client = await createModelClient();
  const mcpClient = await connectChainkitMcp();
  const { tools } = await mcpClient.listTools();

  console.log(`Mini Hack on-chain agent using ${client.provider}, connected to ChainKit MCP. Type 'exit' to quit.\n`);

  while (true) {
    const userInput = await rl.question("You: ");
    if (userInput.trim().toLowerCase() === "exit") break;

    messages.push({ role: "user", content: userInput });

    let response = await client.generateText({ systemPrompt: SYSTEM_PROMPT, messages, tools });

    while (response.stopReason === "tool_use") {
      messages.push({ role: "assistant", content: response.raw.content });

      const toolResults = [];
      for (const call of response.toolCalls) {
        try {
          const result = await mcpClient.callTool({ name: call.name, arguments: call.input });
          toolResults.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(result.content) });
        } catch (err) {
          toolResults.push({ type: "tool_result", tool_use_id: call.id, content: `Error: ${err.message}`, is_error: true });
        }
      }

      messages.push({ role: "user", content: toolResults });
      response = await client.generateText({ systemPrompt: SYSTEM_PROMPT, messages, tools });
    }

    console.log(`\nAssistant: ${response.text}\n`);
    messages.push({ role: "assistant", content: response.raw.content });
  }

  rl.close();
  // Close the MCP client too — its SSE stream is a live connection that would
  // otherwise keep the event loop (and this process) alive after "exit".
  await mcpClient.close();
}

main().catch((err) => {
  console.error("Agent error:", err.message);
  process.exit(1);
});
