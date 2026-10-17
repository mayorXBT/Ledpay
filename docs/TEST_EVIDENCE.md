# Test evidence

Ran 2026-10-17 on WSL2 Ubuntu, Node v24.18.0, pnpm 11.11.0, starter 1.0.2.

## Policy unit tests

```
pnpm exec tsx src/policy.test.ts
policy tests passed
```

Covers: 0-USDC sample calldata, 1 USDC allow, 1.000001 reject, extra decimals reject, allowlist miss, invalid max fails closed to 0.

## Official PayBox `pnpm test` (after session tools)

```json
{
  "reportVersion": 1,
  "starterVersion": "1.0.2",
  "protocolVersion": "2026-07-28",
  "toolchain": { "node": "24.18.0", "platform": "linux", "arch": "x64" },
  "durationMs": 107653,
  "status": "passed",
  "sampleCall": { "tool": "ledpay_send_usdc", "status": "passed" },
  "artifact": {
    "bytes": 406039,
    "sha256": "5345334bc2e3bab715f44782f37eacf9faacbdab53f0b633b9a661f85a2bfc79"
  },
  "discoveredToolCount": 8
}
```

Kernel session on-chain evidence is in `docs/P0_STATUS.md`. Passing plugin conformance is not PRD completion.

Sample arguments: recipient `0x1111111111111111111111111111111111111111`, `amountUsdc` `"0"`.

## Extra MCP calls against `dist/plugin.mjs`

| Call | Result |
| --- | --- |
| `ledpay_get_policy` | passed, product Ledpay |
| `ledpay_check_payment` 0.5 USDC | allowed |
| `ledpay_check_payment` 2 USDC | `amount_exceeds_max` |
| `ledpay_send_usdc` 2 USDC | `isError: true`, no proposal |
| `ledpay_get_setup` | no network hosts |
| `ledpay_get_setup_link` | passed |
| `ledpay_get_session` | `awaiting_setup` without executor |

## Kernel session (Anvil fork of Base Sepolia)

`delegation/scripts/run-onchain.sh` passed: allow / over-limit / wrong recipient / revoke / expire. Owner is TEST_ONLY Anvil #1. Hashes in `docs/P0_STATUS.md`.

## Not run here

- Hosted PayBox portal checks (needs developer login / KYC)
- Wallet simulation / broadcast of the sample 0-USDC proposal
- Physical Ledger Flex confirmation (P0.1–3 production path)
- Hosted ZeroDev/Pimlico bundler on public Base Sepolia
