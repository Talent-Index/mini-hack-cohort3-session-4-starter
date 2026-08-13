# Mini Hack — Cohort 3, Session 4 Starter

**Building Agentic Solutions on Avalanche** · Team1 Kenya

The Smart Wallet Advisor, human-in-the-loop design, and audit logging,
in four languages. This builds directly on the Session 3 starter, same
model-provider layer, same normalize function, same three ways to query
on-chain data, now assembled into one real product: an agent that reads
a wallet and tells you what is actually happening in it, with a human
checkpoint before anything gets flagged.

## What's new this session

Every language folder gets one new file, `advisor` (`advisor.js`,
`advisor.py`, `advisor/main.go`, `src/bin/advisor.rs`), which does five
things:

1. Fetches a wallet's transaction history (same Glacier approach as
   Session 3's `chainkit-fetch`)
2. Normalizes it (the same `normalize` module from Session 3, unchanged)
3. Builds a summarization prompt asking for total AVAX in/out, most
   frequent counterparty, primary token, and one notable pattern
4. Sends it to the model and prints the structured summary
5. Runs a human-in-the-loop checkpoint on any transaction of 5 AVAX or
   more, asking for explicit approval before flagging it, and logs
   every decision along the way as a structured audit entry

Everything else, the model provider layer, direct RPC, ChainKit fetch,
ChainKit as an MCP server, is carried forward unchanged from Session 3.

## Why human-in-the-loop matters here specifically

This is the one concept the curriculum calls non-negotiable for
anything that touches money: the agent reasons, the human decides, the
system executes. The advisor's HITL checkpoint is deliberately simple,
a yes/no prompt in the terminal, but the pattern is what matters, not
the interface. A Telegram approve/reject bot or a signed email link
follows the exact same shape: show the reasoning, wait for a real human
decision, only then act.

## Running the advisor

```bash
# JavaScript
cd javascript && npm run advisor -- <wallet-address>

# Python
cd python && python advisor.py <wallet-address>

# Go
cd golang && go run ./advisor <wallet-address>

# Rust
cd rust && cargo run --bin advisor -- <wallet-address>
```

All four need `GLACIER_API_KEY` and your active model provider's key
set in `.env`, same as Session 3.

## Picking a language

Same guidance as Session 3, pick the one you're building your Week 2
deliverable in:

| Language | Folder |
|---|---|
| JavaScript | [`javascript/`](./javascript) |
| Python | [`python/`](./python) |
| Go | [`golang/`](./golang) |
| Rust | [`rust/`](./rust) |

## Submission

Same flow as Week 1: test it yourself, screenshot the working test and
your PR, post on X tagging **@code_mwangi** and **@AvaxAfrica**, then
submit that link on the quest page. Full steps are in each language
folder's README.

## A note on how this was verified

Same standard as Session 3: every advisor file was actually compiled
(or, for Python, imported and logic-tested with real fake transaction
data, not just syntax-checked) before it shipped. The Go and Rust
modules were renamed from their Session 3 identifiers to keep naming
consistent, and every file was rebuilt afterward to confirm the rename
didn't break anything, not assumed safe.
