import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { evmOutputSchema, proposeEvm } from "./paybox.js";
import {
  BASE_CHAIN,
  BASE_USDC,
  LEDPAY_VERSION,
  checkPayment,
  encodeErc20Transfer,
  loadPolicy,
} from "./policy.js";

const PROTOCOL_VERSION = "2026-07-28";
const evmAddress = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const amountUsdc = z.string().regex(/^(0|[1-9][0-9]*)(?:\.[0-9]{1,6})?$/).max(32);

const policyOutputSchema = z.object({
  product: z.literal("Ledpay"),
  version: z.string(),
  chain: z.literal(BASE_CHAIN),
  chainName: z.literal("Base"),
  tokenSymbol: z.literal("USDC"),
  tokenAddress: z.literal(BASE_USDC),
  decimals: z.literal(6),
  maxAmountUsdc: z.string(),
  maxAmountAtomic: z.string(),
  allowedRecipients: z.array(z.string()),
  allowlistActive: z.boolean(),
  signingModel: z.string(),
  persistentState: z.literal(false),
}).strict();

const checkOutputSchema = z.object({
  allowed: z.boolean(),
  code: z.string(),
  message: z.string(),
  chain: z.literal(BASE_CHAIN),
  tokenAddress: z.literal(BASE_USDC),
  recipient: z.string(),
  amountUsdc: z.string(),
  amountAtomic: z.string(),
  maxAmountUsdc: z.string(),
  maxAmountAtomic: z.string(),
}).strict();

const setupOutputSchema = z.object({
  product: z.literal("Ledpay"),
  portalUpload: z.string(),
  requiredHosts: z.array(z.string()),
  environmentVariables: z.array(z.object({
    name: z.string(),
    required: z.boolean(),
    description: z.string(),
  })),
  agentPrompt: z.string(),
}).strict();

function createServer() {
  const server = new McpServer(
    { name: "ledpay", version: LEDPAY_VERSION },
    { supportedProtocolVersions: [PROTOCOL_VERSION] },
  );

  server.registerTool(
    "ledpay_get_policy",
    {
      title: "Get Ledpay spending policy",
      description:
        "Returns the current Ledpay policy for Base USDC transfers: chain, token, per-call cap, and optional recipient allowlist. This plugin never holds private keys; PayBox selects the wallet and signs approved proposals.",
      inputSchema: z.object({}).strict(),
      outputSchema: policyOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const policy = loadPolicy();
      const structuredContent = {
        product: "Ledpay" as const,
        version: LEDPAY_VERSION,
        chain: policy.chain,
        chainName: policy.chainName,
        tokenSymbol: policy.tokenSymbol,
        tokenAddress: policy.tokenAddress,
        decimals: policy.decimals,
        maxAmountUsdc: policy.maxAmountUsdc,
        maxAmountAtomic: policy.maxAmountAtomic,
        allowedRecipients: policy.allowedRecipients,
        allowlistActive: policy.allowedRecipients.length > 0,
        signingModel:
          "PayBox wallet approval. Ledpay proposes unsigned ERC-20 transfer calldata and never asks for, stores, or signs with a private key.",
        persistentState: false as const,
      };
      return {
        content: [{
          type: "text" as const,
          text: [
            "Ledpay policy: Base USDC transfers only.",
            `Per-call cap: ${policy.maxAmountUsdc} USDC (${policy.maxAmountAtomic} atomic).`,
            policy.allowedRecipients.length > 0
              ? `Allowlist: ${policy.allowedRecipients.join(", ")}.`
              : "Allowlist: any valid EVM address (set LEDPAY_ALLOWED_RECIPIENTS to restrict).",
            "PayBox must approve, sign, and submit. A proposal is not a receipt.",
          ].join(" "),
        }],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "ledpay_check_payment",
    {
      title: "Check a Ledpay payment against policy",
      description:
        "Dry-run a Base USDC transfer against Ledpay policy. Rejects invalid addresses, over-limit amounts, and non-allowlisted recipients. Does not create a transaction proposal.",
      inputSchema: z.object({ recipient: evmAddress, amountUsdc }).strict(),
      outputSchema: checkOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ recipient, amountUsdc: amount }) => {
      const policy = loadPolicy();
      const decision = checkPayment({ recipient, amountUsdc: amount, policy });
      const structuredContent = decision.allowed
        ? {
            allowed: true,
            code: decision.code,
            message: `Policy allows transferring ${decision.amountUsdc} USDC to ${decision.recipient}.`,
            chain: decision.chain,
            tokenAddress: decision.tokenAddress,
            recipient: decision.recipient,
            amountUsdc: decision.amountUsdc,
            amountAtomic: decision.amountAtomic,
            maxAmountUsdc: decision.maxAmountUsdc,
            maxAmountAtomic: decision.maxAmountAtomic,
          }
        : {
            allowed: false,
            code: decision.code,
            message: decision.message,
            chain: policy.chain,
            tokenAddress: policy.tokenAddress,
            recipient,
            amountUsdc: amount,
            amountAtomic: "0",
            maxAmountUsdc: policy.maxAmountUsdc,
            maxAmountAtomic: policy.maxAmountAtomic,
          };
      return {
        content: [{ type: "text" as const, text: structuredContent.message }],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "ledpay_send_usdc",
    {
      title: "Propose a policy-limited Base USDC transfer",
      description:
        "If the payment passes Ledpay policy, returns an unsigned Base USDC ERC-20 transfer for PayBox to validate, approve, sign, and submit. Amount is a USDC decimal string. Amount 0 is a construction-only proposal. This does not move funds.",
      inputSchema: z.object({ recipient: evmAddress, amountUsdc }).strict(),
      outputSchema: evmOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ recipient, amountUsdc: amount }) => {
      const decision = checkPayment({ recipient, amountUsdc: amount });
      if (!decision.allowed) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Ledpay rejected the payment: ${decision.message}` }],
        };
      }
      const data = encodeErc20Transfer(decision.recipient, decision.amountAtomic);
      const proposal = proposeEvm({
        chain: BASE_CHAIN,
        to: BASE_USDC,
        value: "0",
        data,
      });
      return {
        content: [{
          type: "text" as const,
          text: [
            `Ledpay proposed a Base USDC transfer of ${decision.amountUsdc} USDC`,
            `(${decision.amountAtomic} atomic) to ${decision.recipient}.`,
            "Calldata is ERC-20 transfer(recipient, amount) against the canonical Base USDC contract.",
            "PayBox must validate and obtain any required approval; nothing has been signed or paid.",
          ].join(" "),
        }],
        structuredContent: proposal.structuredContent,
      };
    },
  );

  server.registerTool(
    "ledpay_get_setup",
    {
      title: "Get Ledpay PayBox setup instructions",
      description:
        "Returns upload, configuration, and agent-invocation instructions for this Ledpay PayBox plugin. No network calls and no secrets.",
      inputSchema: z.object({}).strict(),
      outputSchema: setupOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const structuredContent = {
        product: "Ledpay" as const,
        portalUpload: "Upload dist/plugin.mjs in the PayBox developer portal. No network hosts are required for these tools.",
        requiredHosts: [] as string[],
        environmentVariables: [
          {
            name: "LEDPAY_MAX_AMOUNT_USDC",
            required: false,
            description: "Per-call USDC cap as a decimal string. Default 1. Invalid values fail closed to 0.",
          },
          {
            name: "LEDPAY_ALLOWED_RECIPIENTS",
            required: false,
            description: "Optional comma-separated 0x addresses. Empty means any valid recipient is allowed.",
          },
        ],
        agentPrompt:
          "Use Ledpay to pay 0.5 USDC on Base to 0x1111111111111111111111111111111111111111. Call ledpay_check_payment first, then ledpay_send_usdc only if allowed.",
      };
      return {
        content: [{
          type: "text" as const,
          text: [
            structuredContent.portalUpload,
            "Optional env: LEDPAY_MAX_AMOUNT_USDC, LEDPAY_ALLOWED_RECIPIENTS.",
            `Example agent prompt: ${structuredContent.agentPrompt}`,
          ].join(" "),
        }],
        structuredContent,
      };
    },
  );

  return server;
}

serveStdio(createServer, { legacy: "reject" });
