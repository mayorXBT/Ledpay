import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  DEMO_RECIPIENT,
  LEDPAY_CHAIN,
  PER_CALL_MAX_ATOMIC,
  TEST_ONLY_OWNER_KEY,
} from "../src/config.js";
import { completeLedgerApproval, createSessionKey, prepareLedgerApproval } from "../src/session.js";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const RPC = process.env.LEDPAY_RPC_URL ?? "https://sepolia.base.org";

describe("prepareLedgerApproval", () => {
  it("builds a Kernel address and an EIP-712 payload a software owner can sign", async () => {
    const owner = privateKeyToAccount(TEST_ONLY_OWNER_KEY);
    const session = createSessionKey();
    const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC) });
    const prepared = await prepareLedgerApproval({
      publicClient,
      ownerAddress: owner.address,
      sessionKeyAddress: session.address,
      policy: {
        token: USDC,
        recipient: DEMO_RECIPIENT,
        perCallMaxAtomic: PER_CALL_MAX_ATOMIC,
        validUntil: Math.floor(Date.now() / 1000) + 3600,
      },
    });
    assert.match(prepared.kernelAddress, /^0x[0-9a-fA-F]{40}$/);
    assert.equal(prepared.typedData.primaryType, "Enable");
    const enableSignature = await owner.signTypedData(prepared.typedData);
    const completed = await completeLedgerApproval({
      publicClient,
      ownerAddress: owner.address,
      sessionKeyAddress: session.address,
      policy: {
        token: USDC,
        recipient: DEMO_RECIPIENT,
        perCallMaxAtomic: PER_CALL_MAX_ATOMIC,
        validUntil: Math.floor(Date.now() / 1000) + 3600,
      },
      enableSignature,
    });
    assert.equal(completed.kernelAddress, prepared.kernelAddress);
    assert.ok(completed.approval.length > 20);
  });
});
