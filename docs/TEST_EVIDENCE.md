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

## Kernel session — Anvil fork of Base Sepolia

Command: `delegation/scripts/run-onchain.sh`  
Fork: Base Sepolia (`84532`) via Anvil `--fork-url https://sepolia.base.org`  
Owner in these tests: **TEST_ONLY** Anvil account #1  
Kernel: `0xEC4b217240f0292c65Bf136b341e400e2D28cA6F`  
Token: LedpayTestToken `0xa733341b32834ea841ff6de1d6be706fc62ea27c` (mock)

| Case | Result | Tx / UserOp |
| --- | --- | --- |
| Allowed `transfer` of 1_000_000 | PASS | tx `0x624f333592459b698db8e0617dedfbfa5a239ef488315211d5011349997e42ed` |
| Over-limit 1_000_001 | on-chain revert | userOp `0xaf650149ec4871c867022874cce7a1dc6f38a2af993bd04906a670e379b6d0af` |
| Wrong recipient `0x2222…` | on-chain revert | userOp `0xfe4b3f433eb5cfdec5589109e6c851978345a3f051db8de80f4d0d0b0ebfed9b` |
| Revoke permission plugin | PASS | tx `0x2ed030b257d37e79df124b52355dc533abf45738369faf6da76de40eae41de61` |
| Replay after revoke | on-chain revert | userOp `0x1ccd475b21bef90de0cf1297bf3c33c014abc3dd699490b3c794eb8e8a475651` |
| Expired `validUntil` | on-chain revert | userOp `0x49494878502f7dbcd5969de8b237e5d10bacbff580e671d683c044e2c5a07978` |

Rejects are `UserOperationEvent.success = false` on EntryPoint 0.7.

## Kernel session — live Ledger Flex (Base Sepolia)

| Step | Result |
| --- | --- |
| WebHID address verify on device | Ledger `0x09822659d2174b61F3A1936301Fa1bf815525caD` |
| Kernel sudo owner | `0x2E0821fFA3E9BEeCe6c6665Fd10cc5D782DE4878` |
| Session permission signed on Flex | USDC `transfer` to `0x1111…1111`, `<= 1e6`, `valueLimit = 0` |
| Permitted 1 USDC UserOp, no second Flex prompt | tx [`0x649721683e063001bcbad78ed3432bf198f856734ee6daeb0134f5486d1b0185`](https://sepolia.basescan.org/tx/0x649721683e063001bcbad78ed3432bf198f856734ee6daeb0134f5486d1b0185), userOp `0x9bac143ef5344d7681447f63866bce615aff5736dfff147ce332da95b555bdf2` |

## Out of scope for this evidence pack

- Hosted PayBox portal checks (developer login / KYC)
- Wallet simulation / broadcast of the sample 0-USDC proposal in the portal
- Mainnet authorizations or spends
