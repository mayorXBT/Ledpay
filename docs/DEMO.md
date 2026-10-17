# Demo script (60–120s)

1. Show `dist/plugin.mjs` and a passing `pnpm test` report.
2. Upload the bundle in the PayBox developer portal and wait for discovery of the four Ledpay tools.
3. Run `ledpay_get_policy`.
4. Run `ledpay_check_payment` with 0.5 USDC to a valid address (allowed) and with 2 USDC (rejected).
5. Run `ledpay_send_usdc` with a permitted amount. Show the unsigned proposal (`to` = USDC, `data` starts with `0xa9059cbb`).
6. If a Base wallet is connected, validate the proposal in the portal. Do not claim on-chain success unless a hash exists.
7. State limits: plugin-side policy, PayBox signs, no Ledger USB inside the sandbox.

Suggested agent prompt after install:

```
Use Ledpay to check and then propose paying 0.5 USDC on Base to 0x1111111111111111111111111111111111111111.
```
