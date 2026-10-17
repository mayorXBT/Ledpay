import { privateKeyToAccount } from "viem/accounts";
import { LOCAL_BUNDLER_KEY, TEST_ONLY_OWNER_KEY } from "../src/config.ts";

const classic = "0xac0974bec39a17d36e8366d7b4ea9dfcbb88cc8185cb3b0ba29ba79b7129ad0a";
console.log("LOCAL_BUNDLER_KEY", LOCAL_BUNDLER_KEY);
console.log("equal classic", LOCAL_BUNDLER_KEY === classic);
console.log("bundler", privateKeyToAccount(LOCAL_BUNDLER_KEY).address);
console.log("classic", privateKeyToAccount(classic).address);
console.log("owner", privateKeyToAccount(TEST_ONLY_OWNER_KEY).address);
