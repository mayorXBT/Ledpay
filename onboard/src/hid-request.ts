import { hidErrorMessage } from "./device-action.ts";

const LEDGER_VENDOR_ID = 11415;

export async function requestLedgerHid(log: (line: string) => void): Promise<HIDDevice[]> {
  if (!("hid" in navigator) || typeof navigator.hid?.requestDevice !== "function") {
    throw new Error("WebHID is unavailable. Use desktop Chrome on http://localhost:5173 or HTTPS.");
  }
  const granted = (await navigator.hid.getDevices()).filter(
    (device) => device.vendorId === LEDGER_VENDOR_ID,
  );
  if (granted.length) {
    log(`Reusing granted ${granted.map((device) => device.productName || "Ledger").join(", ")}. No picker this time.`);
    return granted;
  }
  log("Look at the TOP of this Chrome tab. A device picker should open now. Select Ledger Flex.");
  log("Quit Ledger Live first. Unlock the Flex and open the Ethereum app.");
  let selected: HIDDevice[];
  try {
    selected = await navigator.hid.requestDevice({ filters: [{ vendorId: LEDGER_VENDOR_ID }] });
  } catch (error) {
    throw new Error(hidErrorMessage(error));
  }
  if (!selected.length) {
    throw new Error(hidErrorMessage(new Error("No selected device")));
  }
  log(`Chrome granted ${selected.map((device) => device.productName || "Ledger").join(", ")}.`);
  return selected;
}
