# LedgerGuard — GrokBuild Implementation PRD

**Version:** 1.0 | **Date:** 2026-10-15 | **Project type:** PayBox Marketplace Plugin | **Builder:** GrokBuild | **Target:** MoonPay PayBox Hackathon Chapter 1 (Oct 16–17, 2026 EDT)

## 0. Product summary

**One-liner:** LedgerGuard lets PayBox-connected AI agents spend small, explicitly authorized amounts from a Ledger-owned smart account without repeated physical approvals.

**Distribution is the product:** This must be a reusable **PayBox marketplace plugin**, available to PayBox-connected agents such as ChatGPT, not merely a stand-alone dashboard or an MCP server marketed as a PayBox integration. Validate the actual PayBox listing/submission/plugin interface first.

**User story:** A user connects a Ledger Flex, creates an EVM smart account owned by that Ledger address, sets and authorizes a limited USDC spending permission for a session key, funds the smart account with test tokens, installs/enables LedgerGuard in PayBox, and asks ChatGPT, "Use LedgerGuard to pay 1 USDC to 0x... on Base Sepolia." The agent invokes LedgerGuard through PayBox. LedgerGuard validates the request and executes a bounded ERC-4337 user operation using the scoped session key. The user does **not** need to touch the physical Ledger for each permitted payment. The agent gets a status, transaction hash and audit receipt. An over-limit/expired/unauthorized transfer fails.

**Security truth:** The Ledger **does not** remotely sign each automatic payment. The user authorizes a separate session key via the Ledger-controlled smart account. Funds are kept in the smart account, separate from the user's underlying Ledger EOA. The delegated key must not have unlimited permissions or access to the user's entire hardware wallet balance.

### Hackathon hard requirements
- Live PayBox marketplace plugin, functioning end-to-end.
- Short demo video posted to X.
- Registration, MoonPay KYC and product onboarding completed (participant must verify eligibility themselves).
- Deadline: Saturday October 17, 2026 at 8 PM EDT = Sunday October 18, 2026 at 1 AM WAT.
- Official: https://developer.paybox.sh/ ; docs https://docs.paybox.sh/ .

## 1. Success criteria / proof of value

P0 demo (must work):
1. On desktop Chromium, connect a physical Ledger Flex over USB/HID and display/verify an EVM address.
2. Create or link a Kernel ERC-4337 smart account whose owner/sudo authorization derives from the **actual Ledger address**, with real on-device signing where required. No dummy owner in the production path.
3. Grant a restrictive session permission, with owner approval using the Ledger (never export the Ledger seed or key).
4. PayBox-connected ChatGPT/agent discovers and invokes the published LedgerGuard plugin, with an authenticated user-to-account binding.
5. A permitted test-token transfer is executed without a second Ledger confirmation, and receipt is returned via PayBox.
6. A disallowed transaction is **rejected by on-chain permission validation**, not solely by backend logic.
7. Revoke or expire delegation and demonstrate that replay/continued spending fails.
8. Video shows PayBox integration, Ledger onboarding, permitted spend, rejected spend, receipt.

P1 after all P0s: balances, spending history, graphical policy editor, signed downloadable receipt, optional x402 monetization. Do NOT add multi-chain, swaps, mainnet automation, or generalized smart-contract calls during hackathon.

## 2. Decision gates (resolve BEFORE frontend polish)

**Gate A — PayBox publishing:** Check PayBox docs/app/hackathon community for EXACT current submission and marketplace plugin creation workflow, discoverability, invocation schema, auth, x402 endpoint rules, provider registration, and testing. Search actual reference/CLI before inventing `registerPlugin`, `publishPlugin`, or assuming an external MCP server automatically appears in the marketplace. Record supported APIs in `docs/PAYBOX_INTEGRATION.md` with evidence and links. If publishing is not publicly available, ask the organizers via official support; implement a standards-based adapter and clearly label an unverified integration. A separate MCP server is useful as fallback, but does NOT by itself satisfy the competition requirement.

**Gate B — Ledger owner:** Prove Ledger Flex USB connection, getAddress, and on-device signing of the exact owner authorization required by the selected Kernel/permission version. Audit compatibility of EIP-712, message signing, and UserOp validation. Do not use old `@ledgerhq/hw-app-eth` on modern firmware. If the SDK or Clear Signing doesn't support a safe readable permission approval, stop and report/block hardware authorization; do not require blind signing or impersonate owner with a demo key.

**Gate C — On-chain policy:** Select the *currently supported* ZeroDev Kernel version + compatible `@zerodev/permissions` + bundler; verify deploys and true on-chain enforcement of contract target, function selector, recipient, max per transaction, aggregate spending bound, validity window, and revocation. Do not claim daily aggregate caps if only backend-tracked. If a built-in policy does not support an exact bound, use supported on-chain policy composition or clearly reduce scope to what can be enforced safely. ZeroDev docs are version-sensitive: pin tested compatible versions.

**Gate D — Chain and token:** Try Base Sepolia (chain ID 84532), deployed Kernel factory / validator availability, usable RPC/bundler/paymaster and trusted test ERC-20. DO NOT assume mainnet USDC address is valid on testnet. Source all token addresses from official chain/deployer documentation and put them in chain config. If unavailable, deploy a clearly labeled mock ERC-20 test token (not branded as genuine USDC), and make the demo transparent. Mainnet is NOT a prerequisite.

## 3. System architecture

```
User's ChatGPT / agent
  -> authenticated PayBox MCP / marketplace
  -> LedgerGuard marketplace plugin endpoint (server)
  -> ownership/authentication, policy preflight, replay control, audit
  -> ZeroDev Kernel smart account with scoped session key
  -> ERC-4337 bundler/paymaster -> Base Sepolia
  -> UserOp receipt -> PayBox -> ChatGPT

One-time onboarding (separate browser flow on user's desktop):
Ledger Flex --USB/WebHID--> LedgerGuard onboarding web app
  -> Ledger Ethereum Signer Kit signs ownership / permission authorization
  -> Kernel account configured with Ledger-controlled owner
  -> session key enabled with on-chain limitations
  -> test funds deposited in Kernel account
```

Key separation:
- **Ledger hardware key**: remains on device; controls owner/sudo/recovery.
- **Session key**: dedicated, short-lived signer created per user/account/agent; managed via protected server-side key service (or appropriate remote signer). Never expose in chat, browser localStorage, logs or source code. Cannot change account owner or policies, or grant new rights.
- **PayBox credentials**: handled by PayBox; don't request raw PayBox secrets or private keys from users. Plugin uses only documented delegated auth/token interfaces.
- **LedgerGuard backend**: never receives raw Ledger private key or seed; signs only as limited session signer.

## 4. Technology choices

| Area | Primary choice | Notes |
| --- | --- | --- |
| App + API | Next.js App Router + TypeScript (strict) | Split signing/device code into client-only modules; hosted HTTPS deployment |
| Styling | Tailwind CSS + shadcn/ui + Lucide | Clean security-first interface, mobile dashboard; desktop USB onboarding |
| Hardware wallet | `@ledgerhq/device-management-kit`, `@ledgerhq/device-transport-kit-web-hid`, `@ledgerhq/device-signer-kit-ethereum`, `rxjs` | Current DMK; Flex over WebHID / USB. BLE optional, not MVP |
| Chain client | `viem` | Bigint for base units; safe ABI encoding and typed RPC |
| Smart account | ZeroDev Kernel (`@zerodev/sdk`, `@zerodev/permissions`, compatible signer modules) | Validate current documented versions and owner integration before coding; don't blindly copy deprecated examples |
| ERC-4337 infra | ZeroDev project bundler/paymaster (or compatible Pimlico) | Confirm chain/account/version support and quotas |
| Database | Supabase Postgres | Accounts, policy records, execution requests, idempotency, audit |
| Auth | Auth.js / Supabase Auth for onboarding; secure OAuth mapping for PayBox | Verify user-scoped PayBox identity, no caller-supplied account IDs trusted |
| Validation | Zod | Address, amount, chain, recipient, schema |
| Testing | Vitest + Playwright; Anvil/local EVM when feasible | Unit, integration, contract policy, browser smoke, physical device manual tests |
| Hosting | Vercel + Supabase | Durable jobs/queue needed for async UserOp polling, not in-memory timers |
| Agent interface | PayBox marketplace adapter first; standalone MCP endpoint only if helpful | Use *documented* marketplace contract |
| Optional pricing | x402 | Only after real marketplace path is verified |

Links:
- PayBox Hackathon: https://developer.paybox.sh/
- PayBox Docs: https://docs.paybox.sh/
- PayBox MCP: https://docs.paybox.sh/connect/mcp
- PayBox MCP tools: https://docs.paybox.sh/reference/mcp-tools
- PayBox API: https://docs.paybox.sh/api-reference
- Ledger DMK: https://developers.ledger.com/docs/device-interaction/getting-started
- Ledger Flex USB/BLE: https://developers.ledger.com/docs/device-interaction/dmk-ts/beginner/ble_flex_stax
- Ledger Ethereum Signer: https://developers.ledger.com/docs/device-interaction/dmk-ts/references/signers/eth
- Ledger Clear Signing: https://developers.ledger.com/docs/clear-signing/for-wallets
- Ledger SDK migration: https://developers.ledger.com/docs/device-interaction/dmk-ts/integration/migrations/signers/eth/hw_app_eth_to_dmk
- ZeroDev overview: https://docs.zerodev.app/smart-accounts/permissions/intro
- ZeroDev transaction automation: https://docs.zerodev.app/smart-accounts/permissions/transaction-automation
- ZeroDev session keys: https://docs.zerodev.app/smart-accounts/permissions/session-keys
- ZeroDev initial permission install: https://docs.zerodev.app/smart-accounts/permissions/install-with-init-config
- viem: https://viem.sh/
- ERC-4337: https://eips.ethereum.org/EIPS/eip-4337
- Permissionless reference: https://docs.pimlico.io/references/permissionless
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Base docs: https://docs.base.org/

## 5. Flows and UX

### Onboarding (desktop)
1. Sign in, see clear disclaimer: test funds only; smart account is NOT same as Ledger EOA; automated spending permission is a real key grant.
2. Connect Ledger Flex via HTTPS Chromium WebHID, open Ethereum app, verify owner address on device.
3. Show deterministic counterfactual Kernel address, network, source of owner validation, and deployment status.
4. Create ephemeral/remote session key **without sharing private key**; bind key address to account and agent.
5. Configure narrowly scoped permissions; show human-readable exact chain, token, allowed recipients, per-action amount, aggregate cap (if proven on-chain), expiry and revocation mechanism.
6. Authorize permission on the physical Ledger. Ensure owner signature and wallet derivation match; don't silently swap signer.
7. Confirm permission activated on-chain; direct user to fund the **Kernel address**, not arbitrary PayBox account; test amount only.
8. Connect authenticated PayBox account/agent to plugin using documented marketplace flow.
9. Show connection status and optional copyable safe example ChatGPT prompt.

### Spending
1. PayBox calls plugin with amount as decimal string, chain, verified token, recipient, idempotency key and PayBox-authenticated agent identity.
2. Server resolves authenticated user → permitted smart account; never accepts account ID selected only by untrusted agent.
3. Strict validation and backend preflight; re-check permission against on-chain state; record immutable request fingerprint.
4. Simulate UserOp; send via scoped signer; store UserOp hash and poll durable task for receipt.
5. Return pending/success/rejected with opaque request ID, UserOp + transaction hash, explorer URL, reason code and sanitized receipt. No secrets.
6. On network timeout, use idempotency and on-chain lookup before any retry; never double-spend.

### Example policy / demo
- Chain: Base Sepolia only.
- Token: verified official test token or transparent mock ERC-20.
- Allowlisted recipient: one demo test address only.
- Max spend: 1 token per operation (or smaller suitable amount).
- Max cumulative: 3 tokens during 1-hour session ONLY if on-chain policy supports atomic cumulative enforcement.
- Expires in one hour.
- Disable delegatecall, arbitrary target calls, account upgrades, withdrawals from Ledger EOA, approvals to third-party spenders, session key self-extension and permission grants.
- Demo: valid 1-token payment #1; valid payment #2; invalid amount > limit; invalid recipient; expired/revoked key. Optionally cumulative cap rejection.

## 6. PayBox plugin interface (PROPOSED internal contract; adapt to actual PayBox spec)

**Do not assume these names are official marketplace tool names.** Implement as internal domain service first, then map to verified provider requirements.

- `ledgerguard_get_accounts`: return user's linked smart accounts, chain, policy summaries and session status.
- `ledgerguard_get_policy`: return current on-chain delegation details and remaining verified allowance.
- `ledgerguard_send_token`: initiate permitted transfer; input `{chainId, recipient, token, amount, idempotencyKey}`; no raw private key; output `{requestId, status, userOpHash?, txHash?, explorerUrl?}`.
- `ledgerguard_get_transaction`: fetch status and sanitized receipt by request ID.
- `ledgerguard_get_setup_link`: return short-lived authenticated URL for one-time Ledger onboarding (auth-bound; do not embed bearer credentials in shareable long-lived URLs).
- `ledgerguard_revoke_session`: request revocation; where owner authority required, return hardware approval URL, don't claim instant revocation without actual chain finality.

Suggested REST backend routes (NOT PayBox API assumptions):
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `GET /api/accounts`
- `GET /api/permissions`
- `POST /api/session/revoke-request`
- `GET /api/health`

Async statuses: `awaiting_setup`, `ready`, `validating`, `submitted`, `confirmed`, `rejected`, `expired`, `failed`.

Never allow chat instructions to create or widen spending permissions without explicit Ledger owner approval.

## 7. Data model

`users(id, auth_subject, created_at)`
`paybox_links(id, user_id, paybox_subject, encrypted_token_ref, linked_at, revoked_at)`
`ledger_wallets(id, user_id, address, derivation_path, verified_at)`
`smart_accounts(id, user_id, chain_id, account_address, ledger_owner_address, kernel_version, deployed_at)`
`session_permissions(id, account_id, public_key, validator_address, policy_hash, chain_id, valid_after, valid_until, status, onchain_install_tx, onchain_revoke_tx)`
`policy_rules(id, permission_id, token_address, recipient_allowlist_json, per_call_max_base_units, total_max_base_units, enforced_onchain BOOLEAN)`
`transactions(id, user_id, smart_account_id, permission_id, external_request_id, payload_hash, destination, token_address, amount_base_units, status, user_op_hash, tx_hash, failure_code, created_at, updated_at)`
`audit_events(id, user_id, actor_type, action, object_ref, metadata_json_redacted, created_at)`

Add per-user row-level isolation, uniqueness `(user_id, external_request_id)`, append-only audit where possible. Store amounts as decimal strings/NUMERIC, never float. Encrypt any session-key material through a managed secrets/KMS facility; in demo mode prefer test-only signer and clearly disclose its limited use.

## 8. Security requirements / threat tests

Mandatory:
- No seed phrases, owner private keys, raw PayBox credentials or session private keys in agent prompts, front-end code, logs, telemetry, `.env.example` or GitHub.
- No backend route should use the Ledger key; only on-device signing for owner operations.
- Never turn on blind signing automatically; where permission configuration cannot be meaningfully reviewed on Ledger, fail closed and report limitation.
- Enforce contract target + ERC-20 `transfer` selector + recipient + amount + time on-chain, with proven policy semantics; no arbitrary `approve`, `transferFrom`, `delegatecall`, unlimited call or policy modification by session signer.
- Proper multi-tenant auth: a PayBox caller must not invoke someone else's account by supplying a wallet address.
- Replay-resistant nonce/idempotency; bounded gas; rate limits; typed input; recipient checksum/address parsing; chain pinning.
- Defend against prompt injection: untrusted agent messages are **requests**, not policy updates; server and on-chain checks authoritative.
- Disable all real-money mainnet functionality by default; explicit opt-in and separate review after hackathon.
- No unattended owner signing; owner policy escalation/revoke requests require real owner authorization where needed.
- Handle interrupted/rejected Ledger prompts gracefully.

Tests:
1. Allowed token + recipient + valid amount succeeds.
2. Wrong token, recipient, chain, smart account, or selector blocked.
3. One over-limit payment blocked **on-chain**.
4. Expired or revoked key cannot spend.
5. Repeated idempotency key never sends a second transaction.
6. Concurrent requests cannot evade aggregate bound.
7. Cross-user PayBox auth mapping rejected.
8. Wrong Ledger address cannot enable permission for another owner.
9. Contract revert, no gas, RPC outage, timeout, duplicate UserOp all recover without false success.
10. Secret scan and logs review pass.

## 9. Milestones (strict order, GrokBuild can proceed without repeated user intervention)

**M0 — integration research (first):** Verify current PayBox marketplace spec and eligibility, compatible chain, ZeroDev packages, Ledger permission approval. Add `docs/TECHNICAL_SPIKE.md` with exact sources and any blockers. Do not fake successful provider integration.

**M1 — deployable skeleton:** App shell, auth, env validation, DB migrations, RPC configuration, CI, health check; no payments.

**M2 — hardware + owner:** Ledger Flex WebHID connect, address verification, real owner authorization, reproducible device test.

**M3 — smart account + delegated session:** Kernel account creation, restricted key generation, on-chain policy installation, funding instructions, on-chain rejection tests.

**M4 — permissioned transactions:** Secure backend agent action, ERC-20 transfer, simulation, UserOp submission, durable receipt polling, idempotent execution.

**M5 — PayBox plugin:** Exact official listing/registration adapter, PayBox auth, discover-and-invoke through connected ChatGPT or supported agent; documented proof in screen recording. If official publishing is gated, preserve working external adapter and flag `BLOCKED_PROVIDER_ACCESS` rather than misrepresenting completion.

**M6 — polish/demo:** Minimal onboarding UI, audit view, test documentation, all negative tests, deploy, 60–120s X demo script/video checklist, public readme, submission checklist.

### Priority if time is running out
1. Working PayBox marketplace endpoint + proof of invocation.
2. Real session-key on-chain limits and autonomous test transaction.
3. Ledger Flex owner onboarding and approval.
4. Nice UI, reporting, additional features.

If any core dependency is blocked, produce a demonstrable, accurately labeled partial implementation, with a concise blocker report. Never counterfeit signatures, blockchain receipts, PayBox plugin listings, or tests.

## 10. Expected repository structure

```
ledgerguard/
  app/(marketing)/page.tsx
  app/(dashboard)/dashboard/page.tsx
  app/onboard/page.tsx
  app/api/{accounts,transactions,permissions,health}/...
  components/{ledger,policy,transaction,ui}/...
  lib/ledger/{transport,signer,owner-adapter}.ts
  lib/chain/{config,clients,tokens}.ts
  lib/smart-account/{kernel,delegation,execute,receipt}.ts
  lib/paybox/{adapter,authentication,tools}.ts
  lib/security/{authorization,validation,idempotency}.ts
  lib/db/{client,queries}.ts
  db/migrations/
  tests/{unit,integration,e2e,policies}/
  docs/{TECHNICAL_SPIKE,PAYBOX_INTEGRATION,THREAT_MODEL,DEMO,DEPLOYMENT}.md
  .env.example
  README.md
```

## 11. Environment variables (names illustrative; verify SDK)

```
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
BASE_SEPOLIA_RPC_URL=
BUNDLER_RPC_URL=
PAYMASTER_RPC_URL=
ZERODEV_PROJECT_ID=
PAYBOX_OAUTH_CLIENT_ID=
PAYBOX_OAUTH_CLIENT_SECRET=
PAYBOX_WEBHOOK_SIGNING_SECRET=
SESSION_SIGNER_KMS_KEY_ID=
ALLOWED_TEST_TOKEN_ADDRESS=
DEMO_RECIPIENT_ADDRESS=
```

No real secrets in `.env.example`. If PayBox doesn't use those auth fields, delete unused ones instead of inventing integration. Build with real provider-issued env names after verification.

## 12. Required deliverables

- Source repo with tagged demo commit.
- Hosted testnet demo.
- Actually working PayBox marketplace integration with discoverability and invocation proof.
- Real Ledger Flex owner setup, if physically tested; remote GrokBuild cannot itself press Ledger buttons.
- UserOp/tx proof links, policy rejection evidence, clean audit.
- README install steps, architecture graphic, threat model and limitations.
- Short X demo video + published X URL; submission page details.

## 13. Non-goals

No direct remote signing by Ledger EOA. No automatic spending directly from all Ledger-held funds. No unbounded agent power. No seed phrase import. No custodial pooled funds. No mainnet by default. No pretended partnership or use of restricted Ledger backend APIs. No direct ChatGPT-only plugin replacing the PayBox marketplace requirement.

## 14. GrokBuild operator notes

- Continue phase to phase without asking for approval over implementation choices; prefer smallest secure testable implementation.
- Search and read official docs before choosing APIs; don't hallucinate signatures or package names.
- Pin compatible package versions and record them; use current Ledger DMK API and avoid deprecated LedgerJS Ethereum packages.
- Run lint, typecheck, unit, integration and E2E tests after each milestone; fix failures before proceeding.
- Commit by milestone with concise changelogs.
- Never execute real-money payments, on-chain mainnet authorizations, publish X posts, deploy to production with unrestricted access, or expose secrets without explicit user authorization. Testnet actions with test funds can be automated if credentials are supplied with clear scope.
- The user must personally connect and confirm their Ledger Flex at the hardware interaction stage. Prepare instructions and ask only then, if physical interaction is necessary.
- If marketplace publishing or Ledger hardware authentication is blocked, communicate exact blocker and preserve partial work instead of working around security.

## 15. References verified at planning time

- Official hackathon mission says **build a plugin for PayBox marketplace**, and requires live plugin + X demo: https://developer.paybox.sh/
- PayBox docs describe MCP, OAuth, agent vault and MPC-backed wallet signing (distinct from Ledger): https://docs.paybox.sh/
- Ledger Flex supports WebHID via DMK and Ethereum Signer Kit for hardware interactions: https://developers.ledger.com/docs/device-interaction/dmk-ts/beginner/ble_flex_stax
- Ledger docs warn old `@ledgerhq/hw-app-eth` migration required after Sep 2026: https://developers.ledger.com/docs/device-interaction/dmk-ts/integration/migrations/signers/eth/hw_app_eth_to_dmk
- ZeroDev docs show session key delegation, authorization and revocation for ERC-4337 Kernel: https://docs.zerodev.app/smart-accounts/permissions/transaction-automation

**Status:** Architecture proposal, not proof of completed integration. Explicit high-risk unknowns are Gate A (PayBox marketplace publishing), Gate B (Ledger owner approval for the chosen smart-account flow), Gate C (atomic on-chain aggregate spend cap).
