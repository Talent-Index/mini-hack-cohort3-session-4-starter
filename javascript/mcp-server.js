// Launcher for the ChainKit MCP server (SSE transport).
//
// The `mcp` CLI only accepts the Glacier API key via its --api-key flag, and
// npm scripts don't auto-load .env — so this thin wrapper loads .env and forwards
// the key. Started via `npm run mcp-server`. Serves the SSE stream at:
//   http://localhost:2718/sse   → put that in CHAINKIT_MCP_URL for the agent.
import "dotenv/config";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pkgRoot = dirname(require.resolve("@avalanche-sdk/chainkit/package.json"));
const bin = join(pkgRoot, "bin", "mcp-server.js");

const apiKey = process.env.GLACIER_API_KEY;
if (!apiKey) {
  console.error("GLACIER_API_KEY is not set in .env — the MCP server needs it to authenticate ChainKit calls.");
  process.exit(1);
}

const port = process.env.MCP_PORT || "2718";
const child = spawn(
  process.execPath,
  [bin, "start", "--transport", "sse", "--port", port, "--api-key", apiKey],
  { stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 0));
