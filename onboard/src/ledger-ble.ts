import TransportWebBLE from "@ledgerhq/hw-transport-web-ble";
import Eth from "@ledgerhq/hw-app-eth";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { type Address, type Hex, type TypedDataDefinition, getAddress } from "viem";
import { toAccount, type LocalAccount } from "viem/accounts";

const PATH = "44'/60'/0'/0/0";

function toHexSig(sig: { r: string; s: string; v: number }): Hex {
  const r = sig.r.replace(/^0x/, "").padStart(64, "0");
  const s = sig.s.replace(/^0x/, "").padStart(64, "0");
  const v = (sig.v < 27 ? sig.v + 27 : sig.v).toString(16).padStart(2, "0");
  return `0x${r}${s}${v}`;
}

function bleErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();
  if (lower.includes("not supported") || lower.includes("bluetooth") && lower.includes("unavailable")) {
    return "Web Bluetooth is unavailable. Use Chrome on Android or desktop Chrome over HTTPS (or localhost). Pairing needs Bluetooth on and the Ledger nearby.";
  }
  if (lower.includes("user cancelled") || lower.includes("canceled") || lower.includes("cancelled") || lower.includes("notallowederror")) {
    return "Bluetooth device picker was cancelled. Click Connect via Bluetooth again and select your Ledger.";
  }
  if (lower.includes("gatt") || lower.includes("disconnected")) {
    return "Bluetooth link dropped. Unlock the Ledger, open the Ethereum app, keep it near the phone/laptop, then reconnect.";
  }
  return raw || "Bluetooth connect failed.";
}

function typedDataToEip712Message(typedData: TypedDataDefinition) {
  const { domain, types, primaryType, message } = typedData as TypedDataDefinition & {
    primaryType: string;
    message: Record<string, unknown>;
  };
  const domainFields = (types as Record<string, Array<{ name: string; type: string }>>).EIP712Domain
    ?? Object.keys(domain ?? {}).map((name) => {
      const value = (domain as Record<string, unknown>)[name];
      if (typeof value === "string" && value.startsWith("0x") && value.length === 42) return { name, type: "address" };
      if (typeof value === "string") return { name, type: "string" };
      if (typeof value === "number" || typeof value === "bigint") return { name, type: "uint256" };
      return { name, type: "string" };
    });
  return {
    domain: domain as Record<string, unknown>,
    types: {
      ...(types as Record<string, unknown>),
      EIP712Domain: domainFields,
    },
    primaryType,
    message,
  };
}

export async function connectLedgerBle(log: (line: string) => void): Promise<{
  address: Address;
  account: LocalAccount;
  disconnect: () => Promise<void>;
}> {
  if (!(await TransportWebBLE.isSupported())) {
    throw new Error(
      "Web Bluetooth is not supported in this browser. Use Chrome on Android or desktop Chrome. Safari and iOS Chrome do not expose Web Bluetooth.",
    );
  }
  if (!window.isSecureContext) {
    throw new Error("Bluetooth needs a secure context (HTTPS or http://localhost).");
  }

  log("Chrome will open a Bluetooth device picker. Select your Ledger. Keep Bluetooth on and the device unlocked.");
  log("Open the Ethereum app on the Ledger before or right after pairing.");

  let transport: Awaited<ReturnType<typeof TransportWebBLE.create>>;
  try {
    transport = await TransportWebBLE.create();
  } catch (error) {
    throw new Error(bleErrorMessage(error));
  }

  const eth = new Eth(transport);
  log("Connected over Bluetooth. Confirm the Ethereum address on the Ledger screen.");

  let address: Address;
  try {
    const result = await eth.getAddress(PATH, true, false);
    address = getAddress(result.address);
  } catch (error) {
    try {
      await transport.close();
    } catch {
      /* ignore */
    }
    throw new Error(bleErrorMessage(error));
  }
  log(`Ledger address verified on device: ${address}`);

  const account = toAccount({
    address,
    async signMessage({ message }) {
      const text = typeof message === "string"
        ? message
        : message.raw instanceof Uint8Array
          ? new TextDecoder().decode(message.raw)
          : String(message.raw);
      log("Confirm the Kernel owner message on Ledger.");
      const messageHex = Buffer.from(text, "utf8").toString("hex");
      const sig = await eth.signPersonalMessage(PATH, messageHex);
      return toHexSig(sig);
    },
    async signTypedData(typedData) {
      log("Confirm the EIP-712 Kernel authorization on Ledger.");
      const payload = typedDataToEip712Message(typedData as TypedDataDefinition);
      try {
        const sig = await eth.signEIP712Message(PATH, payload as never);
        return toHexSig(sig);
      } catch (error) {
        log(`Full EIP-712 clear-sign unavailable (${error instanceof Error ? error.message : error}). Falling back to hashed EIP-712.`);
        const domainSeparator = _TypedDataEncoder.hashDomain(payload.domain as never).replace(/^0x/, "");
        const hashStruct = _TypedDataEncoder
          .hashStruct(payload.primaryType, payload.types as never, payload.message as never)
          .replace(/^0x/, "");
        const sig = await eth.signEIP712HashedMessage(PATH, domainSeparator, hashStruct);
        return toHexSig(sig);
      }
    },
    async signTransaction() {
      throw new Error("Ledpay does not send raw EOA transactions from the Ledger owner.");
    },
  });

  return {
    address,
    account,
    disconnect: async () => {
      try {
        await transport.close();
      } catch {
        /* already closed */
      }
    },
  };
}
