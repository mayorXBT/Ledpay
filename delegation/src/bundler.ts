import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  createWalletClient,
  http,
  type Hex,
  type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { parseEventLogs } from "viem";
import {
  entryPoint07Abi,
  entryPoint07Address,
  getUserOperationHash,
  toPackedUserOperation,
  type UserOperation,
} from "viem/account-abstraction";
import { LEDPAY_CHAIN, LOCAL_BUNDLER_KEY } from "./config.js";

type RpcReq = { id: number | string; method: string; params?: unknown[] };

const receipts = new Map<string, { txHash: Hex; userOp: UserOperation }>();

export function startLocalBundler(opts: {
  rpcUrl: string;
  publicClient: PublicClient;
  port?: number;
}) {
  const port = opts.port ?? 4337;
  const bundlerAccount = privateKeyToAccount(LOCAL_BUNDLER_KEY);
  const wallet = createWalletClient({
    account: bundlerAccount,
    chain: LEDPAY_CHAIN,
    transport: http(opts.rpcUrl, { timeout: 120_000 }),
  });

  const server = createServer((req, res) => {
    void handle(req, res).catch((error) => {
      process.stderr.write(`bundler handle crash: ${error instanceof Error ? error.message : error}\n`);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end();
      }
    });
  });

  function toRpc(value: unknown): unknown {
    if (typeof value === "bigint") return `0x${value.toString(16)}`;
    if (Array.isArray(value)) return value.map(toRpc);
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
        if (inner === undefined) continue;
        out[key] = key === "status" && inner === "success" ? "0x1"
          : key === "status" && inner === "reverted" ? "0x0"
          : toRpc(inner);
      }
      return out;
    }
    return value;
  }

  function rpc(res: ServerResponse, id: RpcReq["id"], payload: { result?: unknown; error?: { code: number; message: string } }) {
    if (res.headersSent) return;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", id, ...toRpc(payload) as object }));
  }

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    let body: RpcReq;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as RpcReq;
    } catch {
      if (!res.headersSent) {
        res.writeHead(400);
        res.end("invalid json");
      }
      return;
    }
    try {
      const result = await dispatch(body.method, body.params ?? []);
      rpc(res, body.id, { result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "bundler error";
      process.stderr.write(`bundler ${body.method} error: ${message}\n`);
      rpc(res, body.id, { error: { code: -32000, message } });
    }
  }

  async function dispatch(method: string, params: unknown[]): Promise<unknown> {
    if (method === "eth_chainId") return `0x${LEDPAY_CHAIN.id.toString(16)}`;
    if (method === "eth_supportedEntryPoints") return [entryPoint07Address];
    if (method === "eth_maxPriorityFeePerGas") return "0x3b9aca00";
    if (method === "pimlico_getUserOperationGasPrice" || method === "zd_getUserOperationGasPrice") {
      return {
        slow: { maxFeePerGas: "0x3b9aca00", maxPriorityFeePerGas: "0x3b9aca00" },
        standard: { maxFeePerGas: "0x3b9aca00", maxPriorityFeePerGas: "0x3b9aca00" },
        fast: { maxFeePerGas: "0x3b9aca00", maxPriorityFeePerGas: "0x3b9aca00" },
      };
    }
    if (method === "eth_estimateUserOperationGas") {
      return {
        preVerificationGas: "0x30000",
        verificationGasLimit: "0x200000",
        callGasLimit: "0x200000",
        paymasterVerificationGasLimit: "0x0",
        paymasterPostOpGasLimit: "0x0",
      };
    }
    if (method === "eth_sendUserOperation") {
      const userOp = params[0] as UserOperation;
      const packed = toPackedUserOperation(userOp);
      const userOpHash = getUserOperationHash({
        userOperation: userOp,
        entryPointAddress: entryPoint07Address,
        entryPointVersion: "0.7",
        chainId: LEDPAY_CHAIN.id,
      });
      process.stderr.write("bundler handleOps start\n");
      const txHash = await wallet.writeContract({
        address: entryPoint07Address,
        abi: entryPoint07Abi,
        functionName: "handleOps",
        args: [[packed], bundlerAccount.address],
        chain: LEDPAY_CHAIN,
        gas: 8_000_000n,
      });
      await opts.publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 });
      process.stderr.write(`bundler handleOps mined ${txHash}\n`);
      receipts.set(userOpHash, { txHash, userOp });
      return userOpHash;
    }
    if (method === "eth_getUserOperationReceipt") {
      const userOpHash = String(params[0]);
      const found = receipts.get(userOpHash);
      if (!found) return null;
      try {
        const receipt = await opts.publicClient.getTransactionReceipt({ hash: found.txHash });
        const events = parseEventLogs({
          abi: entryPoint07Abi,
          logs: receipt.logs,
          eventName: "UserOperationEvent",
        });
        const userOpSuccess = events.some((event) => event.args.success);
        return {
          success: userOpSuccess,
          actualGasCost: events[0]?.args.actualGasCost ?? "0x1",
          actualGasUsed: events[0]?.args.actualGasUsed ?? receipt.gasUsed,
          userOpHash,
          receipt,
        };
      } catch {
        return null;
      }
    }
    if (method === "eth_getUserOperationByHash") return null;
    throw new Error(`unsupported bundler method ${method}`);
  }

  return new Promise<{ url: string; close: () => Promise<void> }>((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}
