import assert from "node:assert/strict";
import {
  BASE_CHAIN,
  BASE_USDC,
  checkPayment,
  encodeErc20Transfer,
  loadPolicy,
} from "./policy.js";

const sampleRecipient = "0x1111111111111111111111111111111111111111";

const policy = loadPolicy({
  LEDPAY_MAX_AMOUNT_USDC: "1",
  LEDPAY_ALLOWED_RECIPIENTS: "",
});
assert.equal(policy.chain, BASE_CHAIN);
assert.equal(policy.tokenAddress, BASE_USDC);
assert.equal(policy.maxAmountAtomic, "1000000");
assert.deepEqual(policy.allowedRecipients, []);

const allowed = checkPayment({ recipient: sampleRecipient, amountUsdc: "0", policy });
assert.equal(allowed.allowed, true);
if (!allowed.allowed) throw new Error("expected allow");
assert.equal(allowed.amountAtomic, "0");
assert.equal(
  encodeErc20Transfer(allowed.recipient, allowed.amountAtomic),
  "0xa9059cbb00000000000000000000000011111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000000000",
);

const oneUsdc = checkPayment({ recipient: sampleRecipient, amountUsdc: "1", policy });
assert.equal(oneUsdc.allowed, true);
if (!oneUsdc.allowed) throw new Error("expected allow");
assert.equal(oneUsdc.amountAtomic, "1000000");

const overLimit = checkPayment({ recipient: sampleRecipient, amountUsdc: "1.000001", policy });
assert.equal(overLimit.allowed, false);
if (overLimit.allowed) throw new Error("expected reject");
assert.equal(overLimit.code, "amount_exceeds_max");

const tooManyDecimals = checkPayment({ recipient: sampleRecipient, amountUsdc: "0.1234567", policy });
assert.equal(tooManyDecimals.allowed, false);

const allowlisted = loadPolicy({
  LEDPAY_MAX_AMOUNT_USDC: "1",
  LEDPAY_ALLOWED_RECIPIENTS: sampleRecipient,
});
assert.deepEqual(allowlisted.allowedRecipients, [sampleRecipient]);
const blocked = checkPayment({
  recipient: "0x2222222222222222222222222222222222222222",
  amountUsdc: "0.1",
  policy: allowlisted,
});
assert.equal(blocked.allowed, false);
if (blocked.allowed) throw new Error("expected reject");
assert.equal(blocked.code, "recipient_not_allowlisted");

const invalidMax = loadPolicy({ LEDPAY_MAX_AMOUNT_USDC: "not-a-number" });
assert.equal(invalidMax.maxAmountAtomic, "0");
const closed = checkPayment({ recipient: sampleRecipient, amountUsdc: "0.1", policy: invalidMax });
assert.equal(closed.allowed, false);

console.error("policy tests passed");
