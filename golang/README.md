# Session 4 Starter — Go

The Smart Wallet Advisor, human-in-the-loop design, and audit logging.
Compiled, statically typed, no runtime dependency install needed once
you've built it.

## Setup

```bash
go mod download
cp .env.example .env
# fill in ANTHROPIC_API_KEY, GLACIER_API_KEY, WALLET_ADDRESS at minimum
```

Requires Go 1.23 or newer.

## Layout

Go doesn't allow multiple `func main()` in one package, so each
runnable example lives in its own subdirectory, and the shared code
lives in its own packages:

| Path | What it is |
|---|---|
| `modelprovider/` | Provider abstraction package: `NewModelClient()`, four providers, one shared interface |
| `normalize/` | Shared wei-to-AVAX, hex-to-decimal, Unix-to-ISO8601 conversion package |
| `direct-rpc/` | Method 1: raw JSON-RPC over plain HTTP, no SDK at all |
| `chainkit-fetch/` | Method 2: calls the Glacier REST API directly (there is no official ChainKit Go package, see the note in the file) |
| `chainkit-mcp-agent/` | ChainKit as MCP server, using `github.com/mark3labs/mcp-go` |
| `advisor/` | Session 4: the Smart Wallet Advisor, fetch, normalize, summarize, with a human-in-the-loop checkpoint and audit logging |

## Running each one

```bash
go run ./direct-rpc
go run ./chainkit-fetch
go run ./chainkit-mcp-agent
go run ./advisor <wallet-address>   # Session 4: the full Smart Wallet Advisor
```

For `chainkit-mcp-agent`, start the ChainKit MCP server in another
terminal first (needs Node.js, ChainKit itself is JS-only):

```bash
npx -y @avalanche-sdk/chainkit mcp-server
```

Put the URL it prints into `CHAINKIT_MCP_URL` in your `.env`.

## A note on dependency versions

`go.mod` pins slightly older versions of a couple of dependencies
(`mark3labs/mcp-go` and its own transitive deps) than the very latest
available. That's deliberate, newer versions require a newer Go
toolchain than this was built and verified against. If you're on a
newer Go version yourself, feel free to run `go get -u ./...` to bump
everything, just re-test the MCP agent afterward since its API has
changed across versions before.

## Model provider

`MODEL_PROVIDER` in `.env` picks the provider (`anthropic`, `openai`,
`gemini`, or `ollama`), defaulting to `anthropic`. Only the Anthropic
path implements tool calling, required for `chainkit-mcp-agent`, the
other three are plain text chat, clearly marked as such in
`modelprovider/modelprovider.go`. Note also that the Gemini client here
talks to the REST API directly rather than through Google's official Go
SDK, that SDK couldn't be verified to compile in the environment this
was built in, plain REST avoids the dependency entirely and is
documented as such in the code.

## Submission

1. Test everything yourself, confirm your advisor actually flags a large transaction and waits for approval before continuing.
2. Screenshot the working test, including the human-in-the-loop prompt and your approval.
3. Open your PR, screenshot that too.
4. Post on X with both screenshots, tag **@code_mwangi** and **@AvaxAfrica**.
5. Copy your post link, submit it on the quest page once it's live.

Discord `#week-2-cohort3` for anything you get stuck on.
