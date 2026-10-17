import { baseSepolia } from "viem/chains";

export const LEDPAY_CHAIN = baseSepolia;
export const LEDPAY_CHAIN_ID = 84532;
export const ENTRY_POINT_VERSION = "0.7" as const;

/** Demo allowlisted recipient used in on-chain tests. */
export const DEMO_RECIPIENT = "0x1111111111111111111111111111111111111111" as const;

/** 1 token with 6 decimals. */
export const PER_CALL_MAX_ATOMIC = 1_000_000n;

export const SESSION_TTL_SECONDS = 3600;

/**
 * Anvil account #1. TEST_ONLY owner for local Kernel tests.
 * Never used as a production Ledger stand-in. Production sudo is the Ledger EOA.
 */
export const TEST_ONLY_OWNER_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;

/** Anvil account #0 — local bundler / gas sponsor. */
export const LOCAL_BUNDLER_KEY =
  "0xac0974bec39a17d36e8366d7b4ea9dfcbb88cc8185cb3b0ba29ba79b7129ad0a" as const;

export const TEST_TOKEN_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintTo",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
