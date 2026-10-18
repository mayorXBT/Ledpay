# Ledpay threat model

## Plugin (PayBox sandbox)

- Never accepts, stores, or logs private keys, seeds, or PayBox secrets.
- Untrusted agent arguments are requests. Policy in `src/policy.ts` is authoritative inside the tool; PayBox signing is the second gate for sample proposals.
- Sample path: chain pinned to Base (`eip155:8453`), token pinned to canonical Base USDC, calldata is ERC-20 `transfer` only. No `approve`, `transferFrom`, `delegatecall`, or arbitrary `to`.
- Over-limit amounts and non-allowlisted recipients return `isError` with no transaction proposal.
- Invalid `LEDPAY_MAX_AMOUNT_USDC` fails closed to a 0 cap.
- No native ETH value (`value` is always `0`).
- A proposal is not a receipt. Retry only after checking PayBox request status or `ledpay_get_transaction`.

## Session executor

- Holds the **session** private key only. The Ledger sudo key never leaves the device and is never sent to the executor.
- On-chain ZeroDev call + timestamp policies enforce token, recipient, per-call amount, and `valueLimit = 0`.
- `GET /session` and receipts are sanitized: no private key in responses.
- `LEDPAY_ALLOW_TEST_OWNER=1` enables a TEST_ONLY Anvil owner path for local forks. Keep it off for Ledger demos.
- Exposing the executor on a public tunnel widens the attack surface to anyone who can reach that URL. Treat the tunnel hostname as a credential: rotate it, and prefer short-lived quick tunnels for demos.
- Hosted PayBox does not inject an authenticated end-user subject into plugin args. Multi-tenant binding to a caller-supplied address is unsupported; the executor binds to the onboarded Kernel.
