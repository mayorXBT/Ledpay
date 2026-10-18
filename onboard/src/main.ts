import { Buffer } from "buffer";
import { type Address, isAddress } from "viem";
import { formatDeviceError } from "./device-action.ts";
import { requestLedgerHid } from "./hid-request.ts";
import { connectLedgerBle } from "./ledger-ble.ts";

(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

const logEl = document.querySelector("#log") as HTMLPreElement;
const connectUsbBtn = document.querySelector("#connect-usb") as HTMLButtonElement;
const connectBleBtn = document.querySelector("#connect-ble") as HTMLButtonElement;
const authorizeBtn = document.querySelector("#authorize") as HTMLButtonElement;
const revokeBtn = document.querySelector("#revoke") as HTMLButtonElement;
const recipientInput = document.querySelector("#recipient") as HTMLInputElement;
const capUsdcInput = document.querySelector("#cap-usdc") as HTMLInputElement;
const ttlHoursInput = document.querySelector("#ttl-hours") as HTMLInputElement;
const policySummary = document.querySelector("#policy-summary") as HTMLParagraphElement;

const EXECUTOR = import.meta.env.VITE_EXECUTOR_URL ?? "http://127.0.0.1:8787";
const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address;
const TOKEN = (import.meta.env.VITE_TOKEN_ADDRESS || BASE_SEPOLIA_USDC) as Address;
const TEST_OWNER = new URLSearchParams(location.search).get("testOwner") === "1";
const USDC_DECIMALS = 6n;
const usbAvailable = "hid" in navigator && typeof navigator.hid?.requestDevice === "function";

let ledger: {
  address: Address;
  account: import("viem/accounts").LocalAccount;
  disconnect: () => Promise<void>;
} | null = null;

function log(line: string) {
  logEl.textContent = `${logEl.textContent}\n${line}`.trim();
}

function setConnectBusy(busy: boolean, active?: "usb" | "ble") {
  connectUsbBtn.disabled = busy || !usbAvailable;
  connectBleBtn.disabled = busy;
  if (!busy) {
    connectUsbBtn.textContent = "Connect via USB";
    connectBleBtn.textContent = "Connect via Bluetooth";
    return;
  }
  if (active === "usb") connectUsbBtn.textContent = "Connecting…";
  if (active === "ble") connectBleBtn.textContent = "Connecting…";
}

function readPolicyFromForm() {
  const recipientRaw = recipientInput.value.trim();
  if (recipientRaw && !isAddress(recipientRaw)) {
    throw new Error("Optional recipient must be a valid 0x address, or leave blank.");
  }
  const usdc = Number(capUsdcInput.value);
  if (!Number.isFinite(usdc) || usdc <= 0) {
    throw new Error("Per-call cap must be a positive USDC amount.");
  }
  const hours = Number(ttlHoursInput.value);
  if (!Number.isFinite(hours) || hours < 1) {
    throw new Error("Expiry must be at least 1 hour.");
  }
  const atomic = BigInt(Math.round(usdc * 10 ** Number(USDC_DECIMALS)));
  const ttlSeconds = Math.floor(hours * 3600);
  const validUntil = Math.floor(Date.now() / 1000) + ttlSeconds;
  const expiryLabel = new Date(validUntil * 1000).toISOString();
  return {
    recipient: recipientRaw ? (recipientRaw as Address) : undefined,
    perCallMaxAtomic: atomic.toString(),
    validUntil,
    usdc,
    hours,
    expiryLabel,
  };
}

function refreshSummary() {
  try {
    const policy = readPolicyFromForm();
    policySummary.textContent =
      `Your agent can pay any address, up to ${policy.usdc} USDC per payment, until ${policy.expiryLabel} (${policy.hours}h from authorize).`;
  } catch {
    policySummary.textContent =
      "Your agent can pay any address, up to X USDC per payment, until expiry.";
  }
}

capUsdcInput.addEventListener("input", refreshSummary);
ttlHoursInput.addEventListener("input", refreshSummary);
refreshSummary();

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${EXECUTOR}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(String(body.error ?? body.message ?? response.status));
  return body;
}

async function connectUsb() {
  setConnectBusy(true, "usb");
  try {
    if (ledger) {
      log(`Already connected: ${ledger.address}. Click Authorize session.`);
      authorizeBtn.disabled = false;
      revokeBtn.disabled = false;
      return;
    }
    if (TEST_OWNER) {
      const policy = readPolicyFromForm();
      log("TEST_ONLY path. This is not Ledger integration. Production sudo is the Ledger EOA.");
      await api("/session/dev-activate", {
        method: "POST",
        body: JSON.stringify({
          token: TOKEN || undefined,
          recipient: policy.recipient,
          perCallMaxAtomic: policy.perCallMaxAtomic,
          validUntil: policy.validUntil,
        }),
      });
      const session = await api("/session");
      log(JSON.stringify(session, null, 2));
      authorizeBtn.disabled = true;
      revokeBtn.disabled = false;
      return;
    }
    await requestLedgerHid(log);
    connectUsbBtn.textContent = "Talking to Ledger…";
    const { connectLedger } = await import("./ledger.ts");
    ledger = await connectLedger(log, { hidAlreadyGranted: true });
    log("USB (WebHID) ready.");
    authorizeBtn.disabled = false;
    revokeBtn.disabled = false;
  } catch (error) {
    log(formatDeviceError(error));
  } finally {
    setConnectBusy(false);
  }
}

async function connectBle() {
  setConnectBusy(true, "ble");
  try {
    if (ledger) {
      log(`Already connected: ${ledger.address}. Click Authorize session.`);
      authorizeBtn.disabled = false;
      revokeBtn.disabled = false;
      return;
    }
    if (TEST_OWNER) {
      log("TEST_ONLY uses the executor Anvil owner. Use Connect via USB with ?testOwner=1, or clear that flag for Bluetooth.");
      return;
    }
    ledger = await connectLedgerBle(log);
    log("Bluetooth ready.");
    authorizeBtn.disabled = false;
    revokeBtn.disabled = false;
  } catch (error) {
    log(formatDeviceError(error));
  } finally {
    setConnectBusy(false);
  }
}

connectUsbBtn.addEventListener("click", () => {
  void connectUsb();
});
connectBleBtn.addEventListener("click", () => {
  void connectBle();
});

if (!usbAvailable) {
  connectUsbBtn.disabled = true;
  connectUsbBtn.title = "USB needs desktop Chrome or Edge with WebHID";
  log("USB is unavailable here. Use desktop Chrome for Connect via USB, or Connect via Bluetooth on Android Chrome.");
}

authorizeBtn.addEventListener("click", async () => {
  if (!ledger) {
    log("Connect Ledger first (USB or Bluetooth).");
    return;
  }
  authorizeBtn.disabled = true;
  try {
    const policy = readPolicyFromForm();
    log("Preparing Kernel session on the executor. Keep the Ethereum app open.");
    const prepared = await api("/session/prepare", {
      method: "POST",
      body: JSON.stringify({
        ownerAddress: ledger.address,
        token: TOKEN,
        recipient: policy.recipient,
        perCallMaxAtomic: policy.perCallMaxAtomic,
        validUntil: policy.validUntil,
      }),
    });
    log(`Session public key: ${prepared.sessionKeyAddress}`);
    log(`Kernel ${prepared.kernelAddress}`);
    log(
      `Policy: USDC transfer to any address, at most ${policy.usdc} USDC per call, until ${policy.expiryLabel}.`,
    );
    log("On the Ledger: approve the EIP-712 Kernel authorization. Do not refresh this tab.");
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
        recipient: policy.recipient,
        perCallMaxAtomic: policy.perCallMaxAtomic,
        validUntil: policy.validUntil,
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

log(`Executor: ${EXECUTOR}`);
log("Connect is ready. USB = WebHID. Bluetooth = WebBLE (@ledgerhq/hw-transport-web-ble).");
