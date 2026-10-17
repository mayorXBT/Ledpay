# Ledpay P0 status

Date: 2026-10-17. Product: **Ledpay**. Passing plugin conformance is not PRD completion. Hosted PayBox upload and the X video remain participant steps.

Live Ledger owner: `0x09822659d2174b61F3A1936301Fa1bf815525caD`  
Live Kernel: `0x2E0821fFA3E9BEeCe6c6665Fd10cc5D782DE4878` (Base Sepolia)

Automated tests still use **TEST_ONLY Anvil account #1** (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`) for over-limit / revoke / expire.

## Scoreboard

| # | Requirement | Status | Evidence |
| --- | ---: | --- | --- |
| 1 | Chromium Ledger Flex USB/HID address verify | **done** | WebHID `getAddress({ checkOnDevice: true })`. Flex confirmed `0x09822659d2174b61F3A1936301Fa1bf815525caD`. |
| 2 | Kernel whose owner is the real Ledger address | **done** | Kernel `0x2E0821fFA3E9BEeCe6c6665Fd10cc5D782DE4878` sudo = that Ledger EOA. |
| 3 | Restrictive session permission authorized on Ledger | **done** | EIP-712 Enable signed on Flex. Policy: USDC `transfer` to `0x1111…1111`, `<= 1e6`, `valueLimit = 0`, 1 hour. |
| 4 | PayBox discover/invoke with user-account binding | **partial** | Plugin conformance passed (8 tools, sample `ledpay_send_usdc` 0-USDC). Hosted PayBox does not inject an authenticated user subject; executor binds to the onboarded Kernel. Multi-tenant PayBox identity is **unsupported**. |
| 5 | Permitted transfer without second Ledger confirm + receipt | **done** (executor; not hosted PayBox invoke) | 1 USDC UserOp from the Ledger Kernel, no second Flex prompt. tx [`0x64972168…0185`](https://sepolia.basescan.org/tx/0x649721683e063001bcbad78ed3432bf198f856734ee6daeb0134f5486d1b0185), userOp `0x9bac143ef5344d7681447f63866bce615aff5736dfff147ce332da95b555bdf2`. |
| 6 | Disallowed tx rejected on-chain | **tested** (Anvil fork) | Over-limit and wrong recipient UserOps mined in `handleOps` with `UserOperationEvent.success = false`. |
| 7 | Revoke/expire then replay fails | **tested** (Anvil fork) | Sudo `uninstallPlugin` then replay reverted. Expired `validUntil` session reverted. |
| 8 | Demo video | **blocked** | Participant: X video + PayBox Submit Project. |

## Passing plugin (marketplace sample — not the PRD spend path)

```
starter 1.0.2 / protocol 2026-07-28
status: passed
sample: ledpay_send_usdc
artifact: 406039 bytes
sha256: 5345334bc2e3bab715f44782f37eacf9faacbdab53f0b633b9a661f85a2bfc79
tools: 8
```

`scripts/extra-calls.mjs`: policy, 0.5 USDC allow, 2 USDC reject, setup hosts `[]`, `ledpay_get_session` → `awaiting_setup` without executor.

## On-chain Kernel session (PRD spend path)

Command: `delegation/scripts/run-onchain.sh`  
Fork: Base Sepolia (`84532`) via Anvil 1.5.1 `--fork-url https://sepolia.base.org`  
Kernel: `0xEC4b217240f0292c65Bf136b341e400e2D28cA6F`  
Token: LedpayTestToken `0xa733341b32834ea841ff6de1d6be706fc62ea27c` (mock, not USDC)

| Case | Result | Tx / UserOp |
| --- | --- | --- |
| Allowed `transfer` of 1_000_000 | PASS | tx `0x624f333592459b698db8e0617dedfbfa5a239ef488315211d5011349997e42ed` |
| Over-limit 1_000_001 | PASS on-chain revert | userOp `0xaf650149ec4871c867022874cce7a1dc6f38a2af993bd04906a670e379b6d0af` |
| Wrong recipient `0x2222…` | PASS on-chain revert | userOp `0xfe4b3f433eb5cfdec5589109e6c851978345a3f051db8de80f4d0d0b0ebfed9b` |
| Revoke permission plugin | PASS | tx `0x2ed030b257d37e79df124b52355dc533abf45738369faf6da76de40eae41de61` |
| Replay after revoke | PASS on-chain revert | userOp `0x1ccd475b21bef90de0cf1297bf3c33c014abc3dd699490b3c794eb8e8a475651` |
| Expired `validUntil` | PASS on-chain revert | userOp `0x49494878502f7dbcd5969de8b237e5d10bacbff580e671d683c044e2c5a07978` |

Rejects are `UserOperationEvent.success = false` on EntryPoint 0.7, not plugin-side `checkPayment`.

## Ledger Agent Intent vs this product

Ledger Agent Intent: every chain tx needs a physical approve. Not used for spend.  
ZeroDev Kernel permissions: owner authorizes a session key once; the executor signs UserOps inside the policy. This is the PRD path.

## Remaining blockers (need you)

1. PayBox portal: upload `dist/plugin.mjs`, hosted checks, Submit Project.
2. Demo video on X; MoonPay KYC.

No mainnet transactions or authorizations were sent.
