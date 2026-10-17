import { createServer, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createPublicClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  LEDPAY_CHAIN,
  DEMO_RECIPIENT,
  PER_CALL_MAX_ATOMIC,
  SESSION_TTL_SECONDS,
  TEST_ONLY_OWNER_KEY,
} from "./config.js";
import {
  approveSession,
  completeLedgerApproval,
  createSessionKey,
  prepareLedgerApproval,
  revokeSession,
  sendSessionTransfer,
} from "./session.js";
import { describePolicy, type SpendPolicyInput } from "./policies.js";

type PersistedPolicy = {
  token: Address;
  recipient: Address;
  perCallMaxAtomic: string;
  validUntil: number;
  validAfter?: number;
};

type Store = {
  ownerAddress?: Address;
  kernelAddress?: Address;
  sessionKeyAddress?: Address;
  sessionPrivateKey?: Hex;
  approval?: string;
  token?: Address;
  policy?: PersistedPolicy;
  status: "awaiting_setup" | "ready" | "revoked";
  ownerPath?: "ledger" | "TEST_ONLY";
  transactions: Array<{
    id: string;
    idempotencyKey: string;
    status: string;
    recipient: string;
    amount: string;
    userOpHash?: string;
    txHash?: string;
    error?: string;
  }>;
};

const DATA = resolve(import.meta.dirname, "../.data/session.json");
const RPC = process.env.LEDPAY_RPC_URL ?? "http://127.0.0.1:8545";
const BUNDLER = process.env.LEDPAY_BUNDLER_URL ?? "http://127.0.0.1:4337";
const PORT = Number(process.env.LEDPAY_EXECUTOR_PORT ?? "8787");
const ALLOW_TEST_OWNER = process.env.LEDPAY_ALLOW_TEST_OWNER === "1";
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};
const idempotency = new Map<string, string>();

function toSpendPolicy(policy: PersistedPolicy): SpendPolicyInput {
  return {
    token: policy.token,
    recipient: policy.recipient,
    perCallMaxAtomic: BigInt(policy.perCallMaxAtomic),
    validUntil: policy.validUntil,
    validAfter: policy.validAfter,
  };
}

async function load(): Promise<Store> {
  try {
    return JSON.parse(await readFile(DATA, "utf8")) as Store;
  } catch {
    return { status: "awaiting_setup", transactions: [] };
  }
}

async function save(store: Store) {
  await mkdir(resolve(DATA, ".."), { recursive: true });
  await writeFile(DATA, JSON.stringify(store, (_, v) => typeof v === "bigint" ? v.toString() : v, 2));
}

function publicView(store: Store) {
  return {
    status: store.status,
    ownerAddress: store.ownerAddress ?? null,
    kernelAddress: store.kernelAddress ?? null,
    sessionKeyAddress: store.sessionKeyAddress ?? null,
    token: store.token ?? null,
    policy: store.policy ? describePolicy(toSpendPolicy(store.policy)) : null,
    ownerPath: store.ownerPath ?? null,
    signingModel: "ZeroDev Kernel session key. Ledger private key is never on this server.",
    message:
      store.status === "ready"
        ? "Kernel session is active. Permitted UserOps do not prompt the Ledger."
        : "Open the Ledpay onboarding app, connect Ledger Flex, and authorize the session.",
  };
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json", ...CORS });
  res.end(JSON.stringify(body, (_, v) => typeof v === "bigint" ? v.toString() : v));
}

function persistPolicy(body: Record<string, unknown>): PersistedPolicy {
  return {
    token: String(body.token) as Address,
    recipient: (body.recipient ? String(body.recipient) : DEMO_RECIPIENT) as Address,
    perCallMaxAtomic: String(body.perCallMaxAtomic ?? PER_CALL_MAX_ATOMIC.toString()),
    validUntil: Number(body.validUntil ?? Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS),
    validAfter: body.validAfter ? Number(body.validAfter) : 0,
  };
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  let body: Record<string, unknown> = {};
  try {
    body = raw ? JSON.parse(raw) as Record<string, unknown> : {};
  } catch {
    json(res, 400, { error: "invalid json" });
    return;
  }
  const store = await load();

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      json(res, 200, { ok: true, product: "Ledpay", status: store.status });
      return;
    }
    if (req.method === "POST" && url.pathname === "/rpc") {
      const upstream = await fetch(RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: raw,
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, { "content-type": "application/json", ...CORS });
      res.end(text);
      return;
    }
    if (req.method === "GET" && url.pathname === "/session") {
      json(res, 200, publicView(store));
      return;
    }
    if (req.method === "POST" && url.pathname === "/session/create") {
      const key = createSessionKey();
      store.sessionPrivateKey = key.privateKey;
      store.sessionKeyAddress = key.address;
      store.status = "awaiting_setup";
      store.ownerPath = undefined;
      await save(store);
      json(res, 200, { sessionKeyAddress: key.address });
      return;
    }
    if (req.method === "POST" && url.pathname === "/session/prepare") {
      if (!body.ownerAddress || !body.token) {
        json(res, 400, { error: "ownerAddress and token are required" });
        return;
      }
      if (!store.sessionPrivateKey || !store.sessionKeyAddress) {
        const key = createSessionKey();
        store.sessionPrivateKey = key.privateKey;
        store.sessionKeyAddress = key.address;
      }
      const policy = persistPolicy(body);
      const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC) });
      const prepared = await prepareLedgerApproval({
        publicClient,
        ownerAddress: String(body.ownerAddress) as Address,
        sessionKeyAddress: store.sessionKeyAddress,
        policy: toSpendPolicy(policy),
      });
      store.ownerAddress = String(body.ownerAddress) as Address;
      store.kernelAddress = prepared.kernelAddress;
      store.token = policy.token;
      store.policy = policy;
      store.status = "awaiting_setup";
      store.ownerPath = "ledger";
      await save(store);
      json(res, 200, {
        sessionKeyAddress: store.sessionKeyAddress,
        kernelAddress: prepared.kernelAddress,
        typedData: prepared.typedData,
        policy: describePolicy(toSpendPolicy(policy)),
      });
      return;
    }
    if (req.method === "POST" && url.pathname === "/session/activate") {
      if (!store.sessionKeyAddress || !store.sessionPrivateKey) {
        json(res, 400, { error: "create a session key first" });
        return;
      }
      if (typeof body.enableSignature === "string" && !body.approval) {
        if (!body.ownerAddress || !body.token) {
          json(res, 400, { error: "ownerAddress and token are required with enableSignature" });
          return;
        }
        const policy = persistPolicy(body);
        const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC) });
        const completed = await completeLedgerApproval({
          publicClient,
          ownerAddress: String(body.ownerAddress) as Address,
          sessionKeyAddress: store.sessionKeyAddress,
          policy: toSpendPolicy(policy),
          enableSignature: body.enableSignature as Hex,
        });
        store.approval = completed.approval;
        store.ownerAddress = String(body.ownerAddress) as Address;
        store.kernelAddress = completed.kernelAddress;
        store.token = policy.token;
        store.policy = policy;
        store.ownerPath = "ledger";
        store.status = "ready";
        await save(store);
        json(res, 200, publicView(store));
        return;
      }
      if (!body.approval || !body.ownerAddress || !body.kernelAddress || !body.token) {
        json(res, 400, { error: "approval, ownerAddress, kernelAddress, and token are required" });
        return;
      }
      store.approval = String(body.approval);
      store.ownerAddress = String(body.ownerAddress) as Address;
      store.kernelAddress = String(body.kernelAddress) as Address;
      store.token = String(body.token) as Address;
      store.policy = persistPolicy(body);
      store.ownerPath = "ledger";
      store.status = "ready";
      await save(store);
      json(res, 200, publicView(store));
      return;
    }
    if (req.method === "POST" && url.pathname === "/session/dev-activate") {
      if (!ALLOW_TEST_OWNER) {
        json(res, 403, {
          error: "TEST_ONLY disabled",
          message: "Set LEDPAY_ALLOW_TEST_OWNER=1 for local Anvil demos. Production sudo is the Ledger EOA.",
        });
        return;
      }
      if (!body.token) {
        json(res, 400, { error: "token is required" });
        return;
      }
      if (!store.sessionPrivateKey || !store.sessionKeyAddress) {
        const key = createSessionKey();
        store.sessionPrivateKey = key.privateKey;
        store.sessionKeyAddress = key.address;
      }
      const owner = privateKeyToAccount(TEST_ONLY_OWNER_KEY);
      const policy = persistPolicy(body);
      const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC) });
      const approved = await approveSession({
        publicClient,
        owner,
        sessionKeyAddress: store.sessionKeyAddress,
        policy: toSpendPolicy(policy),
      });
      store.approval = approved.approval;
      store.ownerAddress = owner.address;
      store.kernelAddress = approved.kernelAddress;
      store.token = policy.token;
      store.policy = policy;
      store.ownerPath = "TEST_ONLY";
      store.status = "ready";
      await save(store);
      json(res, 200, { ...publicView(store), warning: "TEST_ONLY Anvil owner. Not a Ledger." });
      return;
    }
    if (req.method === "POST" && url.pathname === "/session/send") {
      if (store.status !== "ready" || !store.approval || !store.sessionPrivateKey || !store.token || !store.policy) {
        json(res, 409, { error: "awaiting_setup", setup: "Open the Ledpay onboarding app and authorize the session on Ledger." });
        return;
      }
      const idempotencyKey = String(body.idempotencyKey ?? `${Date.now()}`);
      const existing = idempotency.get(idempotencyKey);
      if (existing) {
        const tx = store.transactions.find((t) => t.id === existing);
        json(res, 200, tx);
        return;
      }
      const id = `tx_${store.transactions.length + 1}`;
      const recipient = (body.recipient ? String(body.recipient) as Address : store.policy.recipient);
      const amount = BigInt(String(body.amountAtomic ?? "0"));
      try {
        const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC) });
        const result = await sendSessionTransfer({
          publicClient,
          bundlerUrl: BUNDLER,
          approval: store.approval,
          sessionPrivateKey: store.sessionPrivateKey,
          token: store.token,
          recipient,
          amount,
        });
        const row = {
          id,
          idempotencyKey,
          status: result.success ? "confirmed" : "failed",
          recipient,
          amount: amount.toString(),
          userOpHash: result.userOpHash,
          txHash: result.txHash,
        };
        store.transactions.push(row);
        idempotency.set(idempotencyKey, id);
        await save(store);
        json(res, 200, row);
      } catch (error) {
        const message = error instanceof Error ? error.message : "send failed";
        const row = {
          id,
          idempotencyKey,
          status: "rejected",
          recipient,
          amount: amount.toString(),
          error: message,
        };
        store.transactions.push(row);
        idempotency.set(idempotencyKey, id);
        await save(store);
        json(res, 200, row);
      }
      return;
    }
    if (req.method === "GET" && url.pathname.startsWith("/transactions/")) {
      const id = url.pathname.split("/")[2];
      const tx = store.transactions.find((t) => t.id === id);
      json(res, tx ? 200 : 404, tx ?? { error: "not found" });
      return;
    }
    if (req.method === "POST" && url.pathname === "/session/revoke") {
      if (!store.ownerAddress || !store.sessionKeyAddress || !store.policy) {
        json(res, 409, { error: "no session" });
        return;
      }
      if (!body.ownerPrivateKey) {
        json(res, 200, {
          status: "needs_owner",
          message: "Revoke requires the Kernel sudo owner (Ledger) to uninstall the permission plugin. Open the onboarding app.",
        });
        return;
      }
      const publicClient = createPublicClient({ chain: LEDPAY_CHAIN, transport: http(RPC) });
      const result = await revokeSession({
        publicClient,
        bundlerUrl: BUNDLER,
        owner: privateKeyToAccount(body.ownerPrivateKey as Hex),
        sessionKeyAddress: store.sessionKeyAddress,
        policy: toSpendPolicy(store.policy),
      });
      store.status = "revoked";
      await save(store);
      json(res, 200, { status: "revoked", ...result });
      return;
    }
    json(res, 404, { error: "not found" });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "executor error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.error(`Ledpay executor http://127.0.0.1:${PORT}`);
});
