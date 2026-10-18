import { http, type Transport } from "viem";

/**
 * ZeroDev asks for `zd_getUserOperationGasPrice`. Public Pimlico speaks
 * `pimlico_getUserOperationGasPrice`. Map the method when proxying upstream.
 */
export function bundlerTransport(bundlerUrl: string): Transport {
  return http(bundlerUrl, {
    timeout: 120_000,
    fetchFn: async (input, init) => {
      let nextInit = init;
      if (init?.body && typeof init.body === "string") {
        try {
          const parsed = JSON.parse(init.body) as { method?: string };
          if (parsed.method === "zd_getUserOperationGasPrice") {
            parsed.method = "pimlico_getUserOperationGasPrice";
            nextInit = { ...init, body: JSON.stringify(parsed) };
          }
        } catch {
          /* pass through */
        }
      }
      return fetch(input, nextInit);
    },
  });
}
