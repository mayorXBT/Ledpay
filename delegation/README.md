# Ledpay Kernel session stack

Isolated from the root PayBox plugin so `pnpm test --frozen-lockfile` stays intact.

Kernel session stack for Ledpay:

- ZeroDev Kernel v3.1, EntryPoint 0.7
- Agent-created ECDSA session key
- Owner (Ledger in production, labeled TEST_ONLY Anvil key in local tests) authorizes `call` + `timestamp` policies
- Executor holds the session private key and never the Ledger key
- Local bundler submits UserOps with `EntryPoint.handleOps`

## Commands

```bash
cd delegation
npm install
node scripts/compile-token.mjs
npx tsx tests/onchain.test.ts
npx tsx src/executor.ts
```

On-chain tests fork Base Sepolia (`84532`) so the Kernel factory exists. Override RPC with `BASE_SEPOLIA_RPC_URL`.

`TEST_ONLY_OWNER_KEY` is Anvil account #1. It is **not** a production Ledger stand-in.

## Executor

`127.0.0.1:8787`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | liveness |
| GET | `/session` | public session view (no private key) |
| POST | `/session/create` | create session key, return address |
| POST | `/session/activate` | store Ledger-signed approval |
| POST | `/session/dev-activate` | TEST_ONLY Anvil owner, gated by `LEDPAY_ALLOW_TEST_OWNER=1` |
| POST | `/session/send` | scoped UserOp |
| GET | `/transactions/:id` | sanitized receipt |
| POST | `/session/revoke` | sudo uninstall; without owner key returns `needs_owner` |
