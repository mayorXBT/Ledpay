# Ledpay

PayBox marketplace plugin for policy-limited Base USDC payments. An agent can check a spend against a cap and optional recipient allowlist, then return an unsigned ERC-20 transfer. PayBox selects the wallet, collects approval, signs, and submits. The plugin never holds keys.

## What this is

A PayBox plugin (`dist/plugin.mjs`), not a dashboard and not a standalone MCP server. Official PayBox requirements override the original LedgerGuard Next.js/USB design: hosted plugins cannot use Ledger WebHID, persist session keys, or sign transactions.

## Tools

- `ledpay_get_policy` — chain, USDC token, per-call cap, allowlist
- `ledpay_check_payment` — dry-run policy decision
- `ledpay_send_usdc` — unsigned Base USDC transfer proposal if allowed
- `ledpay_get_setup` — upload and configuration notes

## Local checks (WSL2 / macOS / Linux, Node 24, pnpm 11.11.0)

```bash
pnpm install --frozen-lockfile
pnpm exec tsx src/policy.test.ts
pnpm test
```

`pnpm test` type-checks, builds `dist/plugin.mjs` twice for identical bytes, then runs official conformance against `paybox-plugin.json`.

## Upload

1. Upload `dist/plugin.mjs` in the [PayBox developer portal](https://developer.paybox.sh/).
2. Network hosts: none.
3. Optional variables: `LEDPAY_MAX_AMOUNT_USDC` (default `1`), `LEDPAY_ALLOWED_RECIPIENTS`.
4. Run hosted checks. Validate the sample 0-USDC proposal with a Base-capable wallet.
5. Accept the terms and submit the project.

## Limits

- Policy is enforced in the plugin process. It is not a ZeroDev Kernel session key.
- No persistent cumulative cap (PayBox sandboxes are stateless).
- Sample `amountUsdc: "0"` constructs a proposal; it does not prove a live transfer.
- Ledger Flex button confirmation is a user step outside this bundle.
