# Ledpay technical spike

Sources checked 2026-10-17:

- https://developer.paybox.sh/skill.md
- https://developer.paybox.sh/requirements.md
- https://developer.paybox.sh/plugin-starter/v1.0.2/manifest.json
- https://docs.paybox.sh/reference/mcp-tools
- Official examples: echo, repository-info, base-transfer, x402-request

## Gate A — PayBox publishing

Official Chapter 1 plugin is a bundled MCP server: upload `dist/plugin.mjs` (starter 1.0.2, protocol `2026-07-28`) in the developer portal. There is no public `registerPlugin` API. PayBox discovers tools from the bundle, runs hosted checks, then **Submit Project**. A separate MCP server is not a marketplace plugin.

## Gate B — Ledger owner signing

The hosted plugin sandbox has no WebHID/USB, no browser, and no persistent disk. Ledger DMK cannot run inside `plugin.mjs`. PayBox selects the user's wallet, shows the unsigned proposal, and signs after approval. Ledpay never asks for a seed, owner key, or session private key.

## Gate C — On-chain Kernel session policy

ZeroDev Kernel session keys need a deployed smart account, bundler, and owner signature. The plugin cannot hold a session signer or persist cumulative spend. Ledpay enforces per-call policy in process (chain, USDC token, recipient allowlist, max amount) and returns `proposeEvm` calldata. PayBox wallet policy is the second gate. This is plugin-side enforcement, not Kernel on-chain validation.

## Gate D — Chain and token

Official EVM helper and x402 asset are Base mainnet (`eip155:8453`) USDC `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`. Base Sepolia is not the documented PayBox transaction rail, so Ledpay uses Base USDC. The local sample proposes a 0-USDC transfer for construction only.

## SDK pins

Starter 1.0.2: Node 24.x, pnpm 11.11.0, `@modelcontextprotocol/server@2.0.0`, `zod@4.4.3`, esbuild 0.28.2. ERC-20 calldata is encoded without viem so the lockfile stays frozen.
