import { type Address } from "viem";
import { formatDeviceError } from "./device-action.ts";
import { requestLedgerHid } from "./hid-request.ts";

const logEl = document.querySelector("#log") as HTMLPreElement;
const connectBtn = document.querySelector("#connect") as HTMLButtonElement;
const authorizeBtn = document.querySelector("#authorize") as HTMLButtonElement;
const revokeBtn = document.querySelector("#revoke") as HTMLButtonElement;

const EXECUTOR = import.meta.env.VITE_EXECUTOR_URL ?? "http://127.0.0.1:8787";
const RPC = import.meta.env.VITE_RPC_URL ?? `${EXECUTOR}/rpc`;
const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address;
const TOKEN = (import.meta.env.VITE_TOKEN_ADDRESS || BASE_SEPOLIA_USDC) as Address;
const TEST_OWNER = new URLSearchParams(location.search).get("testOwner") === "1";

let ledger: {
  address: Address;
  account: import("viem/accounts").LocalAccount;
  disconnect: () => Promise<void>;
} | null = null;

function log(line: string) {
  logEl.textContent = `${logEl.textContent}\n${line}`.trim();
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${EXECUTOR}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(String(body.error ?? body.message ?? response.status));
  return body;
}

connectBtn.addEventListener("click", async () => {
  connectBtn.disabled = true;
  connectBtn.textContent = "Connecting…";
  try {
    if (ledger) {
      log(`Already connected: ${ledger.address}. Click Authorize session.`);
      authorizeBtn.disabled = false;
      revokeBtn.disabled = false;
      return;
    }
    if (TEST_OWNER) {
      const { DEMO_RECIPIENT, PER_CALL_MAX_ATOMIC, SESSION_TTL_SECONDS } = await import("../../delegation/src/config.ts");
      log("TEST_ONLY path. This is not Ledger integration. Production sudo is the Ledger EOA.");
      await api("/session/dev-activate", {
        method: "POST",
        body: JSON.stringify({
          token: TOKEN || undefined,
          recipient: DEMO_RECIPIENT,
          perCallMaxAtomic: PER_CALL_MAX_ATOMIC.toString(),
          validUntil: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
        }),
      });
      const session = await api("/session");
      log(JSON.stringify(session, null, 2));
      authorizeBtn.disabled = true;
      revokeBtn.disabled = false;
      return;
    }
    await requestLedgerHid(log);
    connectBtn.textContent = "Talking to Ledger…";
    const { connectLedger } = await import("./ledger.ts");
    ledger = await connectLedger(log, { hidAlreadyGranted: true });
    authorizeBtn.disabled = false;
    revokeBtn.disabled = false;
  } catch (error) {
    log(formatDeviceError(error));
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Ledger Flex";
  }
});

authorizeBtn.addEventListener("click", async () => {
  if (!ledger) {
    log("Connect Ledger first.");
    return;
  }
  authorizeBtn.disabled = true;
  try {
    const config = await import("../../delegation/src/config.ts");
    const validUntil = Math.floor(Date.now() / 1000) + config.SESSION_TTL_SECONDS;
    log("Preparing Kernel session on the executor. Keep the Ethereum app open.");
    const prepared = await api("/session/prepare", {
      method: "POST",
      body: JSON.stringify({
        ownerAddress: ledger.address,
        token: TOKEN,
        recipient: config.DEMO_RECIPIENT,
        perCallMaxAtomic: config.PER_CALL_MAX_ATOMIC.toString(),
        validUntil,
      }),
    });
    log(`Session public key: ${prepared.sessionKeyAddress}`);
    log(`Kernel ${prepared.kernelAddress}`);
    log(`Policy: ERC-20 transfer of at most 1 USDC (${TOKEN}) to ${config.DEMO_RECIPIENT}, 1 hour.`);
    log("On the Flex: approve the EIP-712 Kernel authorization. Do not refresh this tab.");
    const enableSignature = await ledger.account.signTypedData(
      prepared.typedData as Parameters<typeof ledger.account.signTypedData>[0],
    );
    const activated = await api("/session/activate", {
      method: "POST",
      body: JSON.stringify({
        enableSignature,
        ownerAddress: ledger.address,
        kernelAddress: prepared.kernelAddress,
        token: TOKEN,
        recipient: config.DEMO_RECIPIENT,
        perCallMaxAtomic: config.PER_CALL_MAX_ATOMIC.toString(),
        validUntil,
      }),
    });
    log(`Kernel authorized: ${prepared.kernelAddress}`);
    log("Send Base Sepolia ETH and USDC to that Kernel address from Ledger Live. Leave a little ETH on the Ledger EOA to pay the send.");
    log(JSON.stringify(activated, null, 2));
  } catch (error) {
    log(formatDeviceError(error));
  } finally {
    authorizeBtn.disabled = false;
  }
});

revokeBtn.addEventListener("click", async () => {
  try {
    const result = await api("/session/revoke", { method: "POST", body: "{}" });
    log(JSON.stringify(result, null, 2));
  } catch (error) {
    log(error instanceof Error ? error.message : String(error));
  }
});

connectBtn.dataset.bound = "1";
log("Connect is ready. Click Connect Ledger Flex.");
