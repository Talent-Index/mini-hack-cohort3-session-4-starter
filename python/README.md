# Session 4 Starter — Python

The Smart Wallet Advisor, human-in-the-loop design, and audit logging.
Same pattern as the JavaScript starter, Python idioms throughout.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# fill in ANTHROPIC_API_KEY, GLACIER_API_KEY, WALLET_ADDRESS at minimum
```

## Files

| File | What it does |
|---|---|
| `model_provider.py` | Provider abstraction: `create_model_client()`, four providers, one shared async interface |
| `direct_rpc.py` | Method 1: raw JSON-RPC via `web3.py`, no external chain SDK needed |
| `chainkit_fetch.py` | Method 2: calls the Glacier REST API directly (there is no official ChainKit Python package, see the note in the file) |
| `chainkit_mcp_agent.py` | ChainKit as MCP server, using the official `mcp` Python SDK |
| `advisor.py` | Session 4: the Smart Wallet Advisor, fetch, normalize, summarize, with a human-in-the-loop checkpoint and audit logging |
| `normalize.py` | Shared wei-to-AVAX, hex-to-decimal, Unix-to-ISO8601 conversion |

## Running each one

```bash
python direct_rpc.py
python chainkit_fetch.py
python chainkit_mcp_agent.py
python advisor.py <wallet-address>   # Session 4: the full Smart Wallet Advisor
```

For `chainkit_mcp_agent.py`, start the ChainKit MCP server in another
terminal first (this still needs Node.js installed, ChainKit itself is
JS-only):

```bash
npx -y @avalanche-sdk/chainkit mcp-server
```

Put the URL it prints into `CHAINKIT_MCP_URL` in your `.env`.

## A note on ChainKit specifically

There is no official ChainKit SDK for Python. `chainkit_fetch.py` calls
the Glacier REST API that ChainKit itself wraps in JavaScript, directly.
Verify the exact endpoint shape against Glacier's current docs before
you build on this, it was written from the documented API shape, not
tested against a live key, that limitation is stated in the file itself
too.

## Model provider

`MODEL_PROVIDER` in `.env` picks the provider (`anthropic`, `openai`,
`gemini`, or `ollama`), defaulting to `anthropic`. Only the Anthropic
path implements tool calling, required for `chainkit_mcp_agent.py`, the
other three are plain text chat, clearly marked as such in
`model_provider.py`.

## Submission

1. Test everything yourself, confirm your advisor actually flags a large transaction and waits for approval before continuing.
2. Screenshot the working test, including the human-in-the-loop prompt and your approval.
3. Open your PR, screenshot that too.
4. Post on X with both screenshots, tag **@code_mwangi** and **@AvaxAfrica**.
5. Copy your post link, submit it on the quest page once it's live.

Discord `#week-2-cohort3` for anything you get stuck on.
