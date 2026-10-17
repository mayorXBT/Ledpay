import { erc20Abi, type Address } from "viem";
import {
  CallPolicyVersion,
  ParamCondition,
  toCallPolicy,
  toTimestampPolicy,
} from "@zerodev/permissions/policies";
import { PER_CALL_MAX_ATOMIC } from "./config.js";

export type SpendPolicyInput = {
  token: Address;
  recipient: Address;
  perCallMaxAtomic?: bigint;
  validAfter?: number;
  validUntil: number;
};

export function toLedpayPolicies(input: SpendPolicyInput) {
  const perCallMax = input.perCallMaxAtomic ?? PER_CALL_MAX_ATOMIC;
  const callPolicy = toCallPolicy({
    policyVersion: CallPolicyVersion.V0_0_4,
    permissions: [
      {
        target: input.token,
        valueLimit: 0n,
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          { condition: ParamCondition.EQUAL, value: input.recipient },
          { condition: ParamCondition.LESS_THAN_OR_EQUAL, value: perCallMax },
        ],
      },
    ],
  });
  const timestampPolicy = toTimestampPolicy({
    validAfter: input.validAfter ?? 0,
    validUntil: input.validUntil,
  });
  return [callPolicy, timestampPolicy];
}

export function describePolicy(input: SpendPolicyInput) {
  return {
    chainId: 84532,
    token: input.token,
    recipient: input.recipient,
    perCallMaxAtomic: (input.perCallMaxAtomic ?? PER_CALL_MAX_ATOMIC).toString(),
    validUntil: input.validUntil,
    selector: "transfer(address,uint256)",
    valueLimitWei: "0",
    operations: "call",
    enforcedOnchain: true as const,
  };
}
