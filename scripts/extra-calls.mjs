import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { withProcess } from "./process.mjs";

const artifact = resolve(process.cwd(), "dist/plugin.mjs");
const PROTOCOL_VERSION = "2026-07-28";

async function call(name, args) {
  return withProcess(process.execPath, [artifact], {
    cwd: process.cwd(),
    env: {
      HOME: process.env.HOME,
      NODE_ENV: "production",
      NO_COLOR: "1",
      PATH: process.env.PATH ?? "/usr/bin",
      LEDPAY_MAX_AMOUNT_USDC: "1",
    },
  }, async (child) => {
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
    child.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name,
        arguments: args,
        _meta: {
          "io.modelcontextprotocol/protocolVersion": PROTOCOL_VERSION,
          "io.modelcontextprotocol/clientInfo": { name: "ledpay-extra", version: "0.1.0" },
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    })}\n`);
    for await (const line of lines) {
      const message = JSON.parse(line);
      if (message.id !== 2) continue;
      lines.close();
      return message.result;
    }
    throw new Error(`${name} returned no result`);
  }, 10_000);
}

const sample = "0x1111111111111111111111111111111111111111";
const other = "0x2222222222222222222222222222222222222222";

const policy = await call("ledpay_get_policy", {});
if (policy.isError) throw new Error("ledpay_get_policy failed");
if (policy.structuredContent.product !== "Ledpay") throw new Error("policy product mismatch");

const ok = await call("ledpay_check_payment", { recipient: sample, amountUsdc: "0.5" });
if (!ok.structuredContent.allowed) throw new Error("0.5 USDC should be allowed");

const over = await call("ledpay_check_payment", { recipient: sample, amountUsdc: "2" });
if (over.structuredContent.allowed) throw new Error("2 USDC should be rejected");
if (over.structuredContent.code !== "amount_exceeds_max") throw new Error("expected amount_exceeds_max");

const blockedSend = await call("ledpay_send_usdc", { recipient: sample, amountUsdc: "2" });
if (blockedSend.isError !== true) throw new Error("over-limit send must set isError");
if (blockedSend.structuredContent) throw new Error("rejected send must not include a proposal");

const setup = await call("ledpay_get_setup", {});
if (setup.structuredContent.requiredHosts.length !== 0) throw new Error("setup should require no hosts");

process.stderr.write(JSON.stringify({
  ledpay_get_policy: "passed",
  check_0_5_usdc: "allowed",
  check_2_usdc: over.structuredContent.code,
  send_2_usdc: "isError",
  ledpay_get_setup: "passed",
  otherRecipient: other,
}, null, 2) + "\n");
