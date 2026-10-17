# Test evidence

Ran 2026-10-17 on WSL2 Ubuntu, Node v24.18.0, pnpm 11.11.0, starter 1.0.2.

## Policy unit tests

```
pnpm exec tsx src/policy.test.ts
policy tests passed
```

Covers: 0-USDC sample calldata, 1 USDC allow, 1.000001 reject, extra decimals reject, allowlist miss, invalid max fails closed to 0.

## Official PayBox `pnpm test`

```json
{
  "reportVersion": 1,
  "starterVersion": "1.0.2",
  "protocolVersion": "2026-07-28",
  "toolchain": { "node": "24.18.0", "platform": "linux", "arch": "x64" },
  "durationMs": 59045,
  "status": "passed",
  "sampleCall": { "tool": "ledpay_send_usdc", "status": "passed" },
  "artifact": {
    "bytes": 400506,
    "sha256": "3ee074abd517641fa5fc3916916054447367dcd0975e7a24a8d6b1ff1926c2c1"
  },
  "discoveredToolCount": 4
}
```

Sample arguments: recipient `0x1111111111111111111111111111111111111111`, `amountUsdc` `"0"`.

## Extra MCP calls against `dist/plugin.mjs`

| Call | Result |
| --- | --- |
| `ledpay_get_policy` | passed, product Ledpay |
| `ledpay_check_payment` 0.5 USDC | allowed |
| `ledpay_check_payment` 2 USDC | `amount_exceeds_max` |
| `ledpay_send_usdc` 2 USDC | `isError: true`, no proposal |
| `ledpay_get_setup` | no network hosts |

## Not run here

- Hosted PayBox portal checks (needs developer login / KYC)
- Wallet simulation / broadcast
- Physical Ledger Flex confirmation
