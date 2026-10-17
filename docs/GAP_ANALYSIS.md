# Ledpay P0 gap analysis

Date: 2026-10-17. Sources: PRD §§0–5, 8–9, 13–14; PayBox skill/requirements 1.0.2; Ledger Agent Intent; Ledger DMK Skills; ZeroDev Kernel v3 permissions.

## Two Ledger products (do not mix)

| | Ledger Agent Intent | ZeroDev session keys (PRD) |
| --- | --- | --- |
| What it is | Agent proposes; human approves every chain tx on the signer | Owner once-authorizes a scoped key; agent spends inside that scope |
| Autonomy | None. Physical confirm per send/swap | Yes, after permission install |
| Keys | Agent identity key only. Wallet keys stay on device | Session private key held by executor; Ledger key never leaves device |
| PayBox fit | Per-tx approval queue, not PayBox plugin sandbox | Executor signs UserOps; PayBox plugin is the marketplace front door |
| Use in Ledpay | Not the spend path. Optional later for owner-only revoke UX | **This is the product** |

Ledger DMK Skills / Ethereum Signer Kit are the **onboarding** stack (WebHID, getAddress, signTypedData / UserOp). They are human-in-the-loop by design. Ledpay uses them only to authorize Kernel sudo + session install, never to sign each agent payment.

## PayBox runtime (Gate A — verified)

Hosted plugin = `dist/plugin.mjs`, no WebHID, no disk, 10s, HTTPS to configured hosts only. PayBox signs **plugin-returned** EVM proposals from the user's PayBox wallet. That path is **not** Ledger-owned Kernel spending.

Keep the existing proposal tools so marketplace upload still passes. Session spending must call an external executor over HTTPS.

PayBox does not inject an authenticated user subject into plugin tool args. Multi-tenant PayBox identity binding is **unsupported** in the hosted runtime; the executor binds to the onboarded Kernel, not a caller-supplied address.

## P0 scoreboard (after this correction)

See `docs/P0_STATUS.md` for hashes. Automated Kernel tests use a TEST_ONLY Anvil owner. Physical Ledger P0.1–3 remain blocked.

## P0 scoreboard (before this correction)

| # | Requirement | Status then | Why |
| --- | ---: | --- | --- |
| 1 | Ledger Flex USB/HID address verify | unsupported in plugin; not built | WebHID cannot run in PayBox sandbox |
| 2 | Kernel owned by real Ledger address | not implemented | Plugin proposed PayBox-wallet USDC |
| 3 | Restrictive session permission, Ledger-approved | not implemented | Plugin-side cap only |
| 4 | PayBox discover/invoke + user-account bind | partial | Tools exist; no Kernel binding |
| 5 | Permitted transfer without second Ledger confirm | not implemented | PayBox still signs each proposal |
| 6 | Disallowed tx rejected **on-chain** | not implemented | Backend/plugin checks only |
| 7 | Revoke/expire stops further spend on-chain | not implemented | |
| 8 | Demo video | blocked | Participant + hardware |

## What this correction builds

1. Isolated `delegation/` Kernel v3.3 session stack (call + timestamp policies).
2. Local EntryPoint bundler + Anvil tests proving allow / over-limit / wrong recipient / expired / revoke **on-chain**.
3. Executor that holds the session key and never the Ledger key.
4. Separate Chromium onboarding app using Ledger DMK WebHID.
5. PayBox tools that call the executor when `LEDPAY_EXECUTOR_URL` is set; existing sample tools unchanged.

## Expected blockers (honest)

- Physical Ledger Flex button: required for P0.1–3 production path.
- ZeroDev/Pimlico API key: not required for Anvil; required for hosted Base Sepolia bundler/paymaster.
- PayBox-authenticated user subject: not provided to plugins.
- Ledger Agent Intent: mainnet, per-tx approval; not used for autonomous spend.
