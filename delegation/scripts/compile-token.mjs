import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(resolve(root, "contracts/LedpayTestToken.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "LedpayTestToken.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}
const contract = output.contracts["LedpayTestToken.sol"].LedpayTestToken;
const bytecode = contract.evm.bytecode.object;
if (!bytecode) {
  console.error("compiler returned empty bytecode");
  process.exit(1);
}
const artifact = {
  abi: contract.abi,
  bytecode: { object: bytecode.startsWith("0x") ? bytecode : `0x${bytecode}` },
};
const outDir = resolve(root, "out/LedpayTestToken.sol");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "LedpayTestToken.json"), JSON.stringify(artifact, null, 2));
process.stderr.write(`compiled LedpayTestToken ${artifact.bytecode.object.length} chars\n`);
