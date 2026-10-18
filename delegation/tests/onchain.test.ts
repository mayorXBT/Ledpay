import { spawn } from "node:child_process";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  LEDPAY_CHAIN,
  DEMO_RECIPIENT,
  PER_CALL_MAX_ATOMIC,
  TEST_ONLY_OWNER_KEY,
  LOCAL_BUNDLER_KEY,
  SESSION_TTL_SECONDS,
} from "../src/config.js";
import { startLocalBundler } from "../src/bundler.js";
import { approveSession, createSessionKey, revokeSession, sendSessionTransfer, kernelVersion } from "../src/session.js";
import { deployTestToken } from "../src/token.js";
import { KernelVersionToAddressesMap } from "@zerodev/sdk/constants";
import { entryPoint07Address } from "viem/account-abstraction";

const RPC_PORT = process.env.LEDPAY_ANVIL_PORT ?? "18545";
const RPC = `http://127.0.0.1:${RPC_PORT}`;
const FORK = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
const EXPECTED_CHAIN = "0x14a34";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function spawnFork(cmd: string, args: string[]) {
  const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
  let stderr = "";
  child.stderr?.on("data", (c) => { stderr += c.toString(); });
  child.stdout?.on("data", (c) => { stderr += c.toString(); });
  child.on("error", (error) => { stderr += error.message; });
  return { child, getStderr: () => stderr };
}

async function waitForRpc(child: ReturnType<typeof spawn>, getStderr: () => string, ms: number) {
  const started = Date.now();
  while (Date.now() - started < ms) {
    if (child.exitCode !== null) {
      throw new Error(`fork process exited ${child.exitCode}: ${getStderr()}`);
    }
    try {
      const res = await fetch(RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      });
      const json = await res.json() as { result?: string };
      if (json.result?.toLowerCase() === EXPECTED_CHAIN) return child;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  child.kill("SIGKILL");
  throw new Error(`fork node did not start: ${getStderr()}`);
}

async function startAnvil() {
  const anvil = spawnFork("anvil", [
    "--fork-url", FORK,
    "--port", RPC_PORT,
    "--host", "127.0.0.1",
    "--chain-id", "84532",
    "--accounts", "10",
    "--balance", "10000",
    "--timeout", "60000",
    "--retries", "8",
    "--silent",
  ]);
  try {
    return await waitForRpc(anvil.child, anvil.getStderr, 90_000);
  } catch (error) {
    anvil.child.kill("SIGKILL");
    throw new Error(`anvil fork failed: ${error instanceof Error ? error.message : error}`);
  }
}

async function expectFailure(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`PASS ${label}: on-chain rejection (${message.slice(0, 180)})`);
    return;
  }
  throw new Error(`FAIL ${label}: expected on-chain rejection`);
}

async function main() {
  console.error("owner_path=TEST_ONLY local Anvil key; production sudo is Ledger EOA");
  const anvil = await startAnvil();
  try {
    const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC, { timeout: 120_000 }) });
    const owner = privateKeyToAccount(TEST_ONLY_OWNER_KEY);
    const deployer = privateKeyToAccount(LOCAL_BUNDLER_KEY);
    console.error(`deployer=${deployer.address} owner=${owner.address} rpc=${RPC}`);
    const wallet = createWalletClient({ account: deployer, chain: LEDPAY_CHAIN, transport: http(RPC, { timeout: 120_000 }) });
    for (const address of [deployer.address, owner.address]) {
      await fetch(RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "anvil_setBalance",
          params: [address, "0x56BC75E2D63100000"],
        }),
      });
    }
    const funded = await publicClient.getBalance({ address: deployer.address });
    assert(funded > 0n, `deployer ${deployer.address} has 0 balance on ${RPC}`);

    const token = await deployTestToken(wallet, publicClient);
    const session = createSessionKey();
    const validUntil = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const policy = {
      token,
      recipient: DEMO_RECIPIENT,
      perCallMaxAtomic: PER_CALL_MAX_ATOMIC,
      validUntil,
    };

    const approved = await approveSession({
      publicClient,
      owner,
      sessionKeyAddress: session.address,
      policy,
    });
    console.error(`kernel=${approved.kernelAddress} session=${session.address} token=${token}`);

    await wallet.sendTransaction({ to: approved.kernelAddress, value: 10n ** 16n });
    await wallet.writeContract({
      address: token,
      abi: parseAbi(["function mintTo(address to, uint256 amount)"]),
      functionName: "mintTo",
      args: [approved.kernelAddress, 10n * PER_CALL_MAX_ATOMIC],
    });

    const factory = KernelVersionToAddressesMap[kernelVersion];
    await publicClient.getCode({ address: entryPoint07Address });
    if (factory.factoryAddress) await publicClient.getCode({ address: factory.factoryAddress });
    if (factory.accountImplementationAddress) {
      await publicClient.getCode({ address: factory.accountImplementationAddress });
    }
    const bundler = await startLocalBundler({ rpcUrl: RPC, publicClient, port: 4337 });
    try {
      const allowed = await sendSessionTransfer({
        publicClient,
        bundlerUrl: bundler.url,
        approval: approved.approval,
        sessionPrivateKey: session.privateKey,
        token,
        recipient: DEMO_RECIPIENT,
        amount: PER_CALL_MAX_ATOMIC,
      });
      assert(allowed.success, "allowed transfer must succeed on-chain");
      console.error(`PASS allowed transfer tx=${allowed.txHash}`);

      await expectFailure("over-limit", () => sendSessionTransfer({
        publicClient,
        bundlerUrl: bundler.url,
        approval: approved.approval,
        sessionPrivateKey: session.privateKey,
        token,
        recipient: DEMO_RECIPIENT,
        amount: PER_CALL_MAX_ATOMIC + 1n,
      }));

      const altRecipient = await sendSessionTransfer({
        publicClient,
        bundlerUrl: bundler.url,
        approval: approved.approval,
        sessionPrivateKey: session.privateKey,
        token,
        recipient: "0x2222222222222222222222222222222222222222",
        amount: 1n,
      });
      assert(altRecipient.success, "any-recipient transfer must succeed on-chain");
      console.error(`PASS any-recipient transfer tx=${altRecipient.txHash}`);

      const revoked = await revokeSession({
        publicClient,
        bundlerUrl: bundler.url,
        owner,
        sessionKeyAddress: session.address,
        policy,
      });
      console.error(`PASS revoke tx=${revoked.txHash}`);

      await expectFailure("revoked session", () => sendSessionTransfer({
        publicClient,
        bundlerUrl: bundler.url,
        approval: approved.approval,
        sessionPrivateKey: session.privateKey,
        token,
        recipient: DEMO_RECIPIENT,
        amount: 1n,
      }));

      const expiredSession = createSessionKey();
      const expired = await approveSession({
        publicClient,
        owner,
        sessionKeyAddress: expiredSession.address,
        policy: { ...policy, validUntil: Math.floor(Date.now() / 1000) - 10 },
      });
      await wallet.sendTransaction({ to: expired.kernelAddress, value: 10n ** 16n });
      await expectFailure("expired session", () => sendSessionTransfer({
        publicClient,
        bundlerUrl: bundler.url,
        approval: expired.approval,
        sessionPrivateKey: expiredSession.privateKey,
        token,
        recipient: DEMO_RECIPIENT,
        amount: 1n,
      }));
    } finally {
      await bundler.close();
    }
  } finally {
    anvil.kill("SIGKILL");
  }
  console.error("on-chain Kernel session tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
