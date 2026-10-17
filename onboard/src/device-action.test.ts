import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDeviceError, hidErrorMessage, interactionHint, waitForAction, type DeviceAction } from "./device-action.ts";

function actionFrom<T>(states: Array<{ status: string; output?: T; error?: unknown; intermediateValue?: { requiredUserInteraction?: string } }>, delayMs = 0): DeviceAction<T> {
  return {
    observable: {
      subscribe(observer) {
        const timer = setTimeout(() => {
          for (const state of states) observer.next(state);
        }, delayMs);
        return { unsubscribe: () => clearTimeout(timer) };
      },
    },
  };
}

describe("hidErrorMessage", () => {
  it("maps an empty Chrome picker to a top-of-tab instruction", () => {
    assert.match(
      hidErrorMessage(new Error("No selected device")),
      /TOP of this tab/i,
    );
  });

  it("maps a lost user gesture to click-again", () => {
    const error = new DOMException("Must be handling a user gesture to show a permission request.", "SecurityError");
    assert.match(hidErrorMessage(error), /Click Connect again/);
  });

  it("maps a timeout to picker plus Flex screen", () => {
    assert.match(hidErrorMessage(new Error("Timeout has occurred")), /TOP of this Chrome tab/);
  });
});

describe("interactionHint", () => {
  it("tells the owner to confirm the address on the Flex", () => {
    assert.equal(
      interactionHint("verify-address"),
      "On the Flex: confirm the Ethereum address.",
    );
  });
});

describe("formatDeviceError", () => {
  it("prints a DmkError object instead of [object Object]", () => {
    const message = formatDeviceError(
      { _tag: "EthAppCommandError", message: "Output buffer too small for chainId conversion", errorCode: "6502" },
      "getAddress",
    );
    assert.match(message, /getAddress:/);
    assert.match(message, /EthAppCommandError/);
    assert.match(message, /6502|chainId conversion/);
    assert.doesNotMatch(message, /\[object Object\]/);
  });
});

describe("waitForAction", () => {
  it("resolves on completed", async () => {
    const output = await waitForAction(
      actionFrom([{ status: "completed", output: { address: "0xabc" } }]),
      "getAddress",
    );
    assert.deepEqual(output, { address: "0xabc" });
  });

  it("logs pending Flex interactions instead of hanging silently", async () => {
    const lines: string[] = [];
    const output = await waitForAction(
      actionFrom([
        { status: "pending", intermediateValue: { requiredUserInteraction: "verify-address" } },
        { status: "completed", output: { address: "0xabc" } },
      ]),
      "getAddress",
      (line) => lines.push(line),
    );
    assert.deepEqual(output, { address: "0xabc" });
    assert.equal(lines[0], "On the Flex: confirm the Ethereum address.");
  });

  it("times out instead of hanging forever", async () => {
    await assert.rejects(
      waitForAction(actionFrom([], 50), "getAddress", undefined, 20),
      /getAddress: timeout/,
    );
  });

  it("rejects a DmkError object with a readable message", async () => {
    await assert.rejects(
      waitForAction(
        actionFrom([{
          status: "error",
          error: {
            _tag: "EthAppCommandError",
            message: "Output buffer too small for chainId conversion",
            errorCode: "6502",
          },
        }]),
        "getAddress",
      ),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /getAddress:/);
        assert.match(error.message, /EthAppCommandError/);
        assert.doesNotMatch(error.message, /\[object Object\]/);
        return true;
      },
    );
  });
});
