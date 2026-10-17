# Ledpay threat model

- Plugin never accepts, stores, or logs private keys, seeds, or PayBox secrets.
- Untrusted agent arguments are requests. Policy in `src/policy.ts` is authoritative inside the tool; PayBox signing is the second gate.
- Chain is pinned to Base (`eip155:8453`). Token is pinned to canonical Base USDC. Calldata is ERC-20 `transfer` only: no `approve`, `transferFrom`, `delegatecall`, or arbitrary `to`.
- Over-limit amounts and non-allowlisted recipients return `isError` with no transaction proposal.
- Invalid `LEDPAY_MAX_AMOUNT_USDC` fails closed to a 0 cap.
- No mainnet ETH value is sent (`value` is always `0`).
- No network hosts, so no brokered credential injection surface.
- A proposal is not a receipt. Retry only after checking the PayBox request status.
