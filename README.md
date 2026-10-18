# Ledpay

**Ledger-owned spend for AI agents.** A PayBox marketplace plugin that lets an agent pay USDC from a ZeroDev Kernel smart account whose sudo owner is a Ledger. The owner authorizes a narrow session once. Policy is enforced on-chain. The Ledger private key never leaves the device.

## Why this exists

PayBox plugins run in a sandbox. They cannot talk to a Ledger over USB, and they should not hold wallet keys. Ledpay keeps those jobs apart:

| Piece | Role |
| --- | --- |
| **PayBox plugin** (`dist/plugin.mjs`) | Discoverable tools. Sample `ledpay_send_usdc` proposes unsigned Base USDC for marketplace checks. Session tools call a configured executor over HTTPS. |
| **Executor** (`delegation/`) | Holds the session key only. Builds and submits ERC-4337 UserOps inside the on-chain permission. |
| **Onboarding** (`onboard/`) | Desktop Chromium + Ledger Device Management Kit (WebHID). Verifies the address on device and signs the Kernel permission. |

This is not Ledger Agent Intent. Agent Intent asks for a physical approve on every chain transaction. Ledpay uses a ZeroDev session: one Ledger authorization, then permitted spends without a second Flex prompt.

## Tools

**Marketplace sample** (PayBox wallet proposal)

- `ledpay_get_policy`
- `ledpay_check_payment`
- `ledpay_send_usdc`
- `ledpay_get_setup`

**Kernel session** (requires `LEDPAY_EXECUTOR_URL`)

- `ledpay_get_setup_link` — open the Chromium onboarding app
- `ledpay_get_session` — Kernel, session key, and policy view
- `ledpay_session_send` — scoped UserOp through the executor
- `ledpay_get_transaction` — sanitized receipt by request id

## Quick start

```bash
pnpm install --frozen-lockfile
pnpm exec tsx src/policy.test.ts
pnpm test
```

`pnpm test` type-checks, builds a reproducible `dist/plugin.mjs`, and runs official PayBox conformance against `paybox-plugin.json`.

Upload `dist/plugin.mjs` in the [PayBox developer portal](https://developer.paybox.sh/).

### Portal config

| Setting | Value |
| --- | --- |
| Network hosts | None for sample tools. Add the executor HTTPS hostname when using session tools. |
| `LEDPAY_MAX_AMOUNT_USDC` | Optional. Default `1`. |
| `LEDPAY_ALLOWED_RECIPIENTS` | Optional. Comma-separated `0x` addresses. |
| `LEDPAY_EXECUTOR_URL` | Session executor origin, e.g. `https://<tunnel>.trycloudflare.com` |
| `LEDPAY_ONBOARD_URL` | Optional. Ledger WebHID app origin. Default `http://localhost:5173` |

Secrets: none in the plugin. Do not put private keys in PayBox variables.

## Kernel session (local)

```bash
# Terminal 1 — executor (Base Sepolia RPC for live Ledger path)
cd delegation
npm install
LEDPAY_RPC_URL=https://sepolia.base.org npm run executor
# listens on http://127.0.0.1:8787

# Terminal 2 — optional public tunnel for PayBox
cloudflared tunnel --url http://localhost:8787

# Terminal 3 — Ledger onboarding (desktop Chrome)
cd onboard
npm install
npm run dev
# open http://localhost:5173
```

On-chain policy tests (Anvil fork of Base Sepolia):

```bash
cd delegation
node scripts/compile-token.mjs
npx tsx tests/onchain.test.ts
```

Those tests use a labeled **TEST_ONLY** Anvil owner. Production sudo is the Ledger EOA.

## What we proved

- Official PayBox `pnpm test` **passed** (starter 1.0.2, 8 tools, sample `ledpay_send_usdc` 0-USDC). See `docs/TEST_EVIDENCE.md`.
- Policy unit tests: allow / over-limit / allowlist / fail-closed max.
- Anvil fork: allowed transfer, over-limit revert, wrong-recipient revert, revoke, expire.
- Live Ledger Flex path on Base Sepolia: address verified on device, Kernel owned by that Ledger, session authorized on Flex, then a permitted 1 USDC UserOp with **no second Ledger prompt**.

Live Base Sepolia spend (executor path):

- Kernel: `0x2E0821fFA3E9BEeCe6c6665Fd10cc5D782DE4878`
- Tx: [`0x649721683e063001bcbad78ed3432bf198f856734ee6daeb0134f5486d1b0185`](https://sepolia.basescan.org/tx/0x649721683e063001bcbad78ed3432bf198f856734ee6daeb0134f5486d1b0185)
- UserOp: `0x9bac143ef5344d7681447f63866bce615aff5736dfff147ce332da95b555bdf2`

## Security posture

- Plugin never accepts or logs private keys, seeds, or PayBox secrets.
- Agent args are untrusted. `src/policy.ts` is the first gate; PayBox signing is the second for sample proposals; on-chain Kernel permissions gate session spends.
- Sample path is pinned to Base (`eip155:8453`) and canonical Base USDC `transfer` only.
- Session path: call policy + timestamp policy. Token, recipient, per-call cap, and `valueLimit = 0` are enforced by the permission plugin.
- A successful tool call is not a chain receipt. Check `ledpay_get_transaction` or an explorer.

More detail: `docs/THREAT_MODEL.md`, `docs/PAYBOX_INTEGRATION.md`.

## Layout

```
src/           PayBox plugin
dist/          plugin.mjs (upload this)
delegation/    Executor + on-chain session tests
onboard/       Ledger WebHID onboarding UI
docs/          Integration, threat model, test evidence
```

## Honest limits

- Hosted PayBox does not inject an authenticated end-user subject into plugin tool args. The executor binds to the onboarded Kernel, not a caller-supplied account id.
- Session sends need a reachable executor (and a bundler that speaks the ZeroDev gas-price method your stack expects).
- No mainnet authorizations or spends were submitted for this demo.
