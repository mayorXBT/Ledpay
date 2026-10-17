import { atomicAmount } from "./paybox.js";

export const LEDPAY_VERSION = "0.1.0";
export const BASE_CHAIN = "eip155:8453" as const;
export const BASE_CHAIN_NAME = "Base";
export const BASE_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as const;
export const USDC_SYMBOL = "USDC" as const;
export const USDC_DECIMALS = 6;
export const DEFAULT_MAX_AMOUNT_USDC = "1";
export const ERC20_TRANSFER_SELECTOR = "a9059cbb";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const DECIMAL_RE = /^(0|[1-9][0-9]*)(?:\.[0-9]+)?$/;

export type Policy = {
  chain: typeof BASE_CHAIN;
  chainName: typeof BASE_CHAIN_NAME;
  tokenAddress: typeof BASE_USDC;
  tokenSymbol: typeof USDC_SYMBOL;
  decimals: typeof USDC_DECIMALS;
  maxAmountUsdc: string;
  maxAmountAtomic: string;
  allowedRecipients: string[];
};

export type PolicyAccept = {
  allowed: true;
  code: "allowed";
  recipient: `0x${string}`;
  amountUsdc: string;
  amountAtomic: string;
  maxAmountUsdc: string;
  maxAmountAtomic: string;
  tokenAddress: typeof BASE_USDC;
  chain: typeof BASE_CHAIN;
};

export type PolicyReject = {
  allowed: false;
  code:
    | "invalid_recipient"
    | "recipient_not_allowlisted"
    | "invalid_amount"
    | "amount_exceeds_max"
    | "invalid_policy";
  message: string;
};

export type PolicyDecision = PolicyAccept | PolicyReject;

export function loadPolicy(env: NodeJS.ProcessEnv = process.env): Policy {
  const maxAmountUsdc = parseMaxAmountUsdc(env.LEDPAY_MAX_AMOUNT_USDC);
  return {
    chain: BASE_CHAIN,
    chainName: BASE_CHAIN_NAME,
    tokenAddress: BASE_USDC,
    tokenSymbol: USDC_SYMBOL,
    decimals: USDC_DECIMALS,
    maxAmountUsdc,
    maxAmountAtomic: atomicAmount(maxAmountUsdc, USDC_DECIMALS),
    allowedRecipients: parseAllowlist(env.LEDPAY_ALLOWED_RECIPIENTS),
  };
}

export function checkPayment(input: {
  recipient: string;
  amountUsdc: string;
  policy?: Policy;
}): PolicyDecision {
  const policy = input.policy ?? loadPolicy();
  if (!ADDRESS_RE.test(input.recipient)) {
    return {
      allowed: false,
      code: "invalid_recipient",
      message: "Recipient must be a 20-byte 0x-prefixed EVM address.",
    };
  }

  const recipient = input.recipient.toLowerCase() as `0x${string}`;
  if (policy.allowedRecipients.length > 0 && !policy.allowedRecipients.includes(recipient)) {
    return {
      allowed: false,
      code: "recipient_not_allowlisted",
      message: "Recipient is outside the configured Ledpay allowlist.",
    };
  }

  if (!DECIMAL_RE.test(input.amountUsdc)) {
    return {
      allowed: false,
      code: "invalid_amount",
      message: "Amount must be a nonnegative USDC decimal string, for example 0, 0.5, or 1.",
    };
  }

  let amountAtomic: string;
  try {
    amountAtomic = atomicAmount(input.amountUsdc, USDC_DECIMALS);
  } catch {
    return {
      allowed: false,
      code: "invalid_amount",
      message: "Amount has more than 6 decimal places or is not a valid USDC quantity.",
    };
  }

  if (BigInt(amountAtomic) > BigInt(policy.maxAmountAtomic)) {
    return {
      allowed: false,
      code: "amount_exceeds_max",
      message: `Amount exceeds the Ledpay per-call cap of ${policy.maxAmountUsdc} USDC.`,
    };
  }

  return {
    allowed: true,
    code: "allowed",
    recipient,
    amountUsdc: input.amountUsdc,
    amountAtomic,
    maxAmountUsdc: policy.maxAmountUsdc,
    maxAmountAtomic: policy.maxAmountAtomic,
    tokenAddress: policy.tokenAddress,
    chain: policy.chain,
  };
}

export function encodeErc20Transfer(recipient: `0x${string}`, amountAtomic: string): `0x${string}` {
  const addressWord = recipient.slice(2).toLowerCase().padStart(64, "0");
  const amountWord = BigInt(amountAtomic).toString(16).padStart(64, "0");
  return `0x${ERC20_TRANSFER_SELECTOR}${addressWord}${amountWord}`;
}

function parseMaxAmountUsdc(raw: string | undefined): string {
  const value = raw?.trim() || DEFAULT_MAX_AMOUNT_USDC;
  if (!DECIMAL_RE.test(value)) return "0";
  try {
    atomicAmount(value, USDC_DECIMALS);
    return value;
  } catch {
    return "0";
  }
}

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const recipients: string[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (!ADDRESS_RE.test(value)) continue;
    const normalized = value.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    recipients.push(normalized);
  }
  return recipients;
}
