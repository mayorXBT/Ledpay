import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { requestLedgerHid } from "./hid-request.ts";

const LEDGER_VENDOR_ID = 11415;
const flex = { vendorId: LEDGER_VENDOR_ID, productName: "Ledger Flex" };

function installHid(hid: { getDevices: () => Promise<unknown[]>; requestDevice: () => Promise<unknown[]> }) {
  Object.defineProperty(globalThis, "navigator", {
    value: { hid },
    configurable: true,
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "navigator");
});

describe("requestLedgerHid", () => {
  it("reuses an already-granted Ledger and does not open the picker", async () => {
    const lines: string[] = [];
    let pickerCalls = 0;
    installHid({
      getDevices: async () => [flex],
      requestDevice: async () => {
        pickerCalls += 1;
        return [flex];
      },
    });
    const selected = await requestLedgerHid((line) => lines.push(line));
    assert.equal(selected.length, 1);
    assert.equal(pickerCalls, 0);
    assert.match(lines.join("\n"), /Reusing granted Ledger Flex/);
    assert.doesNotMatch(lines.join("\n"), /device picker should open now/);
  });

  it("opens the picker only when no Ledger is granted yet", async () => {
    const lines: string[] = [];
    let pickerCalls = 0;
    installHid({
      getDevices: async () => [],
      requestDevice: async () => {
        pickerCalls += 1;
        return [flex];
      },
    });
    const selected = await requestLedgerHid((line) => lines.push(line));
    assert.equal(selected.length, 1);
    assert.equal(pickerCalls, 1);
    assert.match(lines.join("\n"), /device picker should open now/);
  });
});
