# Ledpay onboarding (desktop Chromium)

Ledger USB/WebHID cannot run inside the hosted PayBox plugin sandbox. This Vite app is the owner flow.

## What it does

1. Connects a Ledger over **USB (WebHID)** or **Bluetooth (WebBLE via `@ledgerhq/hw-transport-web-ble`)**. Needs Chromium on desktop or Android (`localhost` or HTTPS, user gesture).
2. Derives and **verifies the EVM address on device**.
3. Asks the executor to create a session key (public address only).
4. Uses the Ledger as Kernel sudo to authorize a ZeroDev permission: ERC-20 `transfer` to any recipient, per-call cap, timestamp expiry.
5. Sends the serialized approval to the executor. The executor never receives the Ledger key.

## Run locally

```bash
cd onboard
npm install
npm run dev
```

Open `http://localhost:5173` in desktop Chrome (WebHID). Quit Ledger Live first. Unlock the Flex and open the Ethereum app. Click Connect, then select Ledger Flex in the Chrome picker at the **top of the tab**. Start `delegation` executor before Authorize.

Environment:

- `VITE_EXECUTOR_URL` (default `http://127.0.0.1:8787`)
- `VITE_RPC_URL` (default `http://127.0.0.1:8787/rpc`, proxied to Base Sepolia)
- `VITE_TOKEN_ADDRESS` (default official Base Sepolia USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`)

`?testOwner=1` hits `POST /session/dev-activate` and requires `LEDPAY_ALLOW_TEST_OWNER=1` on the executor. That path is labeled TEST_ONLY and is **not** Ledger integration.

## Notes

Physical Ledger button confirmation is required for address verify and permission signing. Transaction Checks (`originToken`) are omitted until Ledger issues one; `getAddress` / `signMessage` / `signTypedData` still run on device.
