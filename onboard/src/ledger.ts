import { ConsoleLogger, DeviceManagementKitBuilder } from "@ledgerhq/device-management-kit";
import { webHidIdentifier, webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";
import { type Address, type Hex, type TypedDataDefinition } from "viem";
import { toAccount, type LocalAccount } from "viem/accounts";
import { filter, firstValueFrom, timeout } from "rxjs";
import { formatDeviceError, hidErrorMessage, waitForAction, type DeviceAction } from "./device-action.ts";
import { requestLedgerHid } from "./hid-request.ts";

const PATH = "44'/60'/0'/0/0";

function toHexSig(sig: { r: string; s: string; v: number }): Hex {
  const r = sig.r.replace(/^0x/, "").padStart(64, "0");
  const s = sig.s.replace(/^0x/, "").padStart(64, "0");
  const v = (sig.v < 27 ? sig.v + 27 : sig.v).toString(16).padStart(2, "0");
  return `0x${r}${s}${v}`;
}

export async function connectLedger(log: (line: string) => void, opts?: { hidAlreadyGranted?: boolean }): Promise<{
  address: Address;
  account: LocalAccount;
  disconnect: () => Promise<void>;
}> {
  if (!opts?.hidAlreadyGranted) await requestLedgerHid(log);

  const dmk = new DeviceManagementKitBuilder()
    .addLogger(new ConsoleLogger())
    .addTransport(webHidTransportFactory)
    .build();

  let discovered;
  try {
    discovered = await firstValueFrom(
      dmk.listenToAvailableDevices({ transport: webHidIdentifier }).pipe(
        filter((list) => list.length > 0),
        timeout({ first: 15_000 }),
      ),
    );
  } catch (error) {
    throw new Error(hidErrorMessage(error));
  }

  const device = discovered.find((item) => item.deviceModel.model === "flex") ?? discovered[0];
  log(`Opening ${device.name} over WebHID.`);
  let sessionId: string | undefined;
  try {
    sessionId = await dmk.connect({ device });
  } catch (error) {
    throw new Error(formatDeviceError(error, "connect"));
  }
  log("Connected. Confirm the Ethereum address on the Flex screen.");

  const signerEth = new SignerEthBuilder({
    dmk,
    sessionId,
  }).build();

  let result: { address: Address };
  try {
    // Omit chainId. GET_ADDRESS with checkOnDevice appends chainId as a 64-bit
    // field; Base Sepolia 84532 can make the Ethereum app return 6502 after the
    // on-device confirm. The EOA is the same on every EVM chain.
    result = await waitForAction(
      signerEth.getAddress(PATH, { checkOnDevice: true }) as DeviceAction<{ address: Address }>,
      "getAddress",
      log,
    );
  } catch (error) {
    try {
      await dmk.disconnect({ sessionId });
    } catch {
      /* device already gone */
    }
    throw error;
  }
  const address = result.address;
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
      const sig = await waitForAction(
        signerEth.signMessage(PATH, text) as DeviceAction<{ r: string; s: string; v: number }>,
        "signMessage",
        log,
      );
      return toHexSig(sig);
    },
    async signTypedData(typedData) {
      log("Confirm the EIP-712 Kernel authorization on Ledger.");
      const sig = await waitForAction(
        signerEth.signTypedData(PATH, typedData as TypedDataDefinition) as DeviceAction<{ r: string; s: string; v: number }>,
        "signTypedData",
        log,
      );
      return toHexSig(sig);
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
        await dmk.disconnect({ sessionId });
      } catch {
        /* device already gone */
      }
    },
  };
}
