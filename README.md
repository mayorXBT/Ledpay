# Ledpay

PayBox marketplace plugin that lets an AI agent spend from a **Ledger-owned ZeroDev Kernel** smart account using a narrowly scoped session key. Restrictions are enforced on-chain. The Ledger owner authorizes the delegation once. The agent never receives the Ledger private key.

The hosted PayBox plugin (`dist/plugin.mjs`) is the marketplace front door. Ledger WebHID and session signing cannot run inside that sandbox, so Ledpay splits into three pieces:

1. **PayBox plugin** — discoverable tools; sample `ledpay_send_usdc` still proposes unsigned Base USDC for marketplace checks.
2. **Executor** (`delegation/`) — holds the session private key, submits ERC-4337 UserOps.
3. **Onboarding app** (`onboard/`) — desktop Chromium + Ledger DMK WebHID to verify the address on device and authorize the Kernel permission.

Ledger Agent Intent is a per-transaction human-approval product. Ledpay does not use it for autonomous spend.

## Tools

Marketplace sample (PayBox wallet proposal; not the PRD spend path):

- `ledpay_get_policy`
- `ledpay_check_payment`
- `ledpay_send_usdc`
- `ledpay_get_setup`

Kernel session (PRD spend path; requires `LEDPAY_EXECUTOR_URL`):

- `ledpay_get_setup_link` — Chromium onboarding URL
- `ledpay_get_session` — Kernel / session / policy view
- `ledpay_session_send` — scoped UserOp via the executor
- `ledpay_get_transaction`

## Local plugin checks (WSL2 / macOS / Linux, Node 24, pnpm 11.11.0)

```bash
pnpm install --frozen-lockfile
pnpm exec tsx src/policy.test.ts
pnpm test
```

`pnpm test` type-checks, builds `dist/plugin.mjs` twice for identical bytes, then runs official conformance against `paybox-plugin.json`.

## Kernel session tests

```bash
cd delegation
npm install
node scripts/compile-token.mjs
npx tsx tests/onchain.test.ts
```

These fork Base Sepolia and prove allow / over-limit / wrong recipient / expire / revoke **on-chain**. The owner in that test is a labeled TEST_ONLY Anvil key. Production sudo is the Ledger EOA.

## Upload

1. Upload `dist/plugin.mjs` in the [PayBox developer portal](https://developer.paybox.sh/).
2. Network hosts: none for the sample tools. Add the executor HTTPS origin when using session tools.
3. Optional variables: `LEDPAY_MAX_AMOUNT_USDC`, `LEDPAY_ALLOWED_RECIPIENTS`, `LEDPAY_EXECUTOR_URL`, `LEDPAY_ONBOARD_URL`.
4. Run hosted checks. Validate the sample 0-USDC proposal.
5. Complete Ledger onboarding in Chromium, then invoke `ledpay_session_send`.

## Honest limits

See `docs/P0_STATUS.md`. Passing plugin conformance is not completion of the PRD. Physical Ledger approval, a hosted bundler/paymaster credential, and PayBox-authenticated user binding remain separate gates.
