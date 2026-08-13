# Session 4 Starter — JavaScript

The Smart Wallet Advisor, human-in-the-loop design, and audit logging.
Builds on Session 3's on-chain data methods and the model-provider
pattern from Sessions 1 and 2.

## Setup

```bash
npm install
cp .env.example .env
# fill in ANTHROPIC_API_KEY, GLACIER_API_KEY, WALLET_ADDRESS at minimum
```

## Files

| File | What it does |
|---|---|
| `model-provider.js` | Same provider abstraction from Session 2, carried forward unchanged |
| `direct-rpc.js` | Method 1: raw RPC via `ethers.js`, `getBalance`/`getBlock`/`getTransactionCount` |
| `chainkit-fetch.js` | Method 2: structured wallet history via the real `@avalanche-sdk/chainkit` SDK |
| `chainkit-mcp-agent.js` | ChainKit running as an MCP server, wired into a tool-calling agent |
| `advisor.js` | Session 4: the Smart Wallet Advisor, fetch, normalize, summarize, with a human-in-the-loop checkpoint and audit logging |
| `normalize.js` | Shared wei-to-AVAX, hex-to-decimal, Unix-to-ISO8601 conversion, used by all data methods |

## Running each one

```bash
npm run direct-rpc          # Method 1, no API key needed beyond the RPC endpoint itself
npm run fetch-transactions  # Method 2, needs GLACIER_API_KEY
npm run mcp-agent           # ChainKit as MCP, needs the mcp-server running separately first
npm run advisor -- <wallet-address>   # Session 4: the full Smart Wallet Advisor
```

For `mcp-agent`, start the ChainKit MCP server in another terminal
first:

```bash
npx -y @avalanche-sdk/chainkit mcp-server
```

It prints the local URL it's running on. Put that in `CHAINKIT_MCP_URL`
in your `.env` before running the agent.

## Model provider

Same as Session 2: `MODEL_PROVIDER` in `.env` picks the provider
(`anthropic`, `openai`, `gemini`, or `ollama`), defaulting to
`anthropic` if unset. Only the Anthropic path implements tool calling,
required for `chainkit-mcp-agent.js` to work at all, the other three are
plain text chat.

## Submission

1. Test everything yourself, confirm your advisor actually flags a large transaction and waits for approval before continuing.
2. Screenshot the working test, including the human-in-the-loop prompt and your approval.
3. Open your PR, screenshot that too.
4. Post on X with both screenshots, tag **@code_mwangi** and **@AvaxAfrica**.
5. Copy your post link, submit it on the quest page once it's live.

Discord `#week-2-cohort3` for anything you get stuck on.
