#!/usr/bin/env bash
set -euo pipefail
BODY="$(dirname "$0")/rpc-probe.json"
for url in https://sepolia.base.org https://base-sepolia-rpc.publicnode.com https://base-sepolia.g.alchemy.com/public; do
  echo "=== $url ==="
  curl -sS --max-time 15 -X POST "$url" -H "content-type: application/json" --data-binary @"$BODY" || echo "FAIL $url"
  echo
done
