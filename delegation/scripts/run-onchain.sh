#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.local/node-v24.18.0-linux-x64/bin:$HOME/.foundry/bin:$PATH"
cd "$(dirname "$0")/.."
echo "anvil=$(command -v anvil)"
echo "node=$(command -v node) $(node -v)"
node scripts/compile-token.mjs
export BASE_SEPOLIA_RPC_URL="${BASE_SEPOLIA_RPC_URL:-https://sepolia.base.org}"
echo "fork=$BASE_SEPOLIA_RPC_URL"
exec npx tsx tests/onchain.test.ts
