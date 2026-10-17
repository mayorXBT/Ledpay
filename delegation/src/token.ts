import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  type Hex,
  type WalletClient,
  type PublicClient,
  type Account,
  type Chain,
  type Transport,
} from "viem";
import { TEST_TOKEN_ABI } from "./config.js";

export async function deployTestToken(
  wallet: WalletClient<Transport, Chain, Account>,
  publicClient: PublicClient,
) {
  const artifactPath = resolve(
    import.meta.dirname,
    "../out/LedpayTestToken.sol/LedpayTestToken.json",
  );
  const artifact = JSON.parse(await readFile(artifactPath, "utf8")) as {
    abi: typeof TEST_TOKEN_ABI;
    bytecode: { object: Hex };
  };
  const hash = await wallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    account: wallet.account,
    chain: wallet.chain,
    gas: 2_000_000n,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("LedpayTestToken deploy failed");
  return receipt.contractAddress;
}
