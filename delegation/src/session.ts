import {
  type Address,
  type Hex,
  type LocalAccount,
  type TypedDataDefinition,
  encodeFunctionData,
  erc20Abi,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { addressToEmptyAccount, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toECDSASigner } from "@zerodev/permissions/signers";
import {
  deserializePermissionAccount,
  serializePermissionAccount,
  toPermissionValidator,
} from "@zerodev/permissions";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { toLedpayPolicies, type SpendPolicyInput } from "./policies.js";
import { ENTRY_POINT_VERSION, LEDPAY_CHAIN } from "./config.js";
import { bundlerTransport } from "./bundler-transport.js";
import type { PublicClient } from "viem";

export const kernelVersion = KERNEL_V3_1;
export const entryPoint = getEntryPoint(ENTRY_POINT_VERSION);

export function createSessionKey() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address, account };
}

async function permissionKernel(opts: {
  publicClient: PublicClient;
  ownerAddress: Address;
  sessionKeyAddress: Address;
  policy: SpendPolicyInput;
}) {
  const ecdsaValidator = await signerToEcdsaValidator(opts.publicClient, {
    entryPoint,
    signer: addressToEmptyAccount(opts.ownerAddress),
    kernelVersion,
  });
  const emptySessionKeySigner = await toECDSASigner({
    signer: addressToEmptyAccount(opts.sessionKeyAddress),
  });
  const permissionPlugin = await toPermissionValidator(opts.publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: toLedpayPolicies(opts.policy),
  });
  const account = await createKernelAccount(opts.publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
  });
  return { account, permissionPlugin };
}

export async function prepareLedgerApproval(opts: {
  publicClient: PublicClient;
  ownerAddress: Address;
  sessionKeyAddress: Address;
  policy: SpendPolicyInput;
}) {
  const { account } = await permissionKernel(opts);
  const typedData = await account.kernelPluginManager.getPluginsEnableTypedData(account.address);
  return {
    kernelAddress: account.address,
    typedData,
  };
}

export async function completeLedgerApproval(opts: {
  publicClient: PublicClient;
  ownerAddress: Address;
  sessionKeyAddress: Address;
  policy: SpendPolicyInput;
  enableSignature: Hex;
}) {
  const { account, permissionPlugin } = await permissionKernel(opts);
  const approval = await serializePermissionAccount(account, undefined, opts.enableSignature);
  return {
    approval,
    kernelAddress: account.address,
    permissionPlugin,
  };
}

export async function approveSession(opts: {
  publicClient: PublicClient;
  owner: LocalAccount;
  sessionKeyAddress: Address;
  policy: SpendPolicyInput;
}) {
  const prepared = await prepareLedgerApproval({
    publicClient: opts.publicClient,
    ownerAddress: opts.owner.address,
    sessionKeyAddress: opts.sessionKeyAddress,
    policy: opts.policy,
  });
  const enableSignature = await opts.owner.signTypedData(prepared.typedData as TypedDataDefinition);
  return completeLedgerApproval({
    publicClient: opts.publicClient,
    ownerAddress: opts.owner.address,
    sessionKeyAddress: opts.sessionKeyAddress,
    policy: opts.policy,
    enableSignature,
  });
}

export async function sessionClient(opts: {
  publicClient: PublicClient;
  bundlerUrl: string;
  approval: string;
  sessionPrivateKey: Hex;
}) {
  const sessionKeySigner = await toECDSASigner({
    signer: privateKeyToAccount(opts.sessionPrivateKey),
  });
  const account = await deserializePermissionAccount(
    opts.publicClient,
    entryPoint,
    kernelVersion,
    opts.approval,
    sessionKeySigner,
  );
  const client = createKernelAccountClient({
    account,
    chain: LEDPAY_CHAIN,
    bundlerTransport: bundlerTransport(opts.bundlerUrl),
    client: opts.publicClient,
  });
  return { account, client };
}

export async function sendSessionTransfer(opts: {
  publicClient: PublicClient;
  bundlerUrl: string;
  approval: string;
  sessionPrivateKey: Hex;
  token: Address;
  recipient: Address;
  amount: bigint;
}) {
  const { account, client } = await sessionClient(opts);
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [opts.recipient, opts.amount],
  });
  const userOpHash = await client.sendUserOperation({
    callData: await account.encodeCalls([{ to: opts.token, value: 0n, data }]),
  });
  const receipt = await client.waitForUserOperationReceipt({ hash: userOpHash });
  if (!receipt.success) {
    throw new Error(`user operation reverted on-chain userOpHash=${userOpHash}`);
  }
  return {
    userOpHash,
    txHash: receipt.receipt.transactionHash,
    success: receipt.success,
  };
}

export async function revokeSession(opts: {
  publicClient: PublicClient;
  bundlerUrl: string;
  owner: LocalAccount;
  sessionKeyAddress: Address;
  policy: SpendPolicyInput;
}) {
  const ecdsaValidator = await signerToEcdsaValidator(opts.publicClient, {
    entryPoint,
    signer: opts.owner,
    kernelVersion,
  });
  const sudoAccount = await createKernelAccount(opts.publicClient, {
    plugins: { sudo: ecdsaValidator },
    entryPoint,
    kernelVersion,
  });
  const client = createKernelAccountClient({
    account: sudoAccount,
    chain: LEDPAY_CHAIN,
    bundlerTransport: bundlerTransport(opts.bundlerUrl),
    client: opts.publicClient,
  });
  const emptySessionKeySigner = await toECDSASigner({
    signer: addressToEmptyAccount(opts.sessionKeyAddress),
  });
  const permissionPlugin = await toPermissionValidator(opts.publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: toLedpayPolicies(opts.policy),
  });
  const userOpHash = await client.uninstallPlugin({ plugin: permissionPlugin });
  const receipt = await client.waitForUserOperationReceipt({ hash: userOpHash });
  return { userOpHash, txHash: receipt.receipt.transactionHash };
}
