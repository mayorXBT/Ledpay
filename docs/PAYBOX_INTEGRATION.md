# PayBox integration

Ledpay is a PayBox marketplace plugin. Agents invoke it through PayBox `discover_plugins` / `get_plugin` / `use_plugin`, not as a standalone MCP server.

## Artifact

Upload only `dist/plugin.mjs` after `pnpm test` passes.

## Tools

| Tool | Purpose |
| --- | --- |
| `ledpay_get_policy` | Current chain, USDC token, per-call cap, allowlist |
| `ledpay_check_payment` | Dry-run policy check |
| `ledpay_send_usdc` | Unsigned Base USDC `transfer` proposal if policy allows |
| `ledpay_get_setup` | Portal config and example agent prompt |

Sample call used by local/hosted checks:

```json
{
  "tool": "ledpay_send_usdc",
  "arguments": {
    "recipient": "0x1111111111111111111111111111111111111111",
    "amountUsdc": "0"
  }
}
```

## Portal configuration

- Network hosts: none. Tools do not call the network.
- Secrets: none. Do not add private keys.
- Optional environment variables:
  - `LEDPAY_MAX_AMOUNT_USDC` (default `1`)
  - `LEDPAY_ALLOWED_RECIPIENTS` (comma-separated `0x` addresses)

## Signing

`ledpay_send_usdc` returns `io.paybox/transactionProposal` with `kind: "evm"`, `chain: "eip155:8453"`, `to` = Base USDC, `value` = `0`, `data` = ERC-20 `transfer(recipient, amount)`. PayBox simulates, asks for approval, signs, and broadcasts. A successful tool call is not a confirmed payment.

## Local vs hosted

`pnpm test` proves protocol compatibility and the sample proposal. It does not prove hosted wallet simulation, user approval, or on-chain settlement.
