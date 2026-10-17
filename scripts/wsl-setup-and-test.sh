#!/usr/bin/env bash
set -euo pipefail
export PATH="${HOME}/.local/node-v24.18.0-linux-x64/bin:${PATH}"
cd /mnt/c/Users/hp/Downloads/Ledpay
echo "node $(node -v) pnpm coming up"
corepack enable
corepack prepare pnpm@11.11.0 --activate
echo "pnpm $(pnpm -v)"
# Normalize CRLF from Windows downloads so lockfile and scripts stay Unix.
find . -type f \( -name '*.ts' -o -name '*.mjs' -o -name '*.json' -o -name '*.yaml' -o -name '*.md' -o -name '.gitignore' -o -name '.env.example' \) -print0 \
  | xargs -0 sed -i 's/\r$//'
pnpm install --frozen-lockfile
pnpm exec tsx src/policy.test.ts
pnpm test
