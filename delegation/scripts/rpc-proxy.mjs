import { createServer } from "node:http";

const TARGET = process.env.LEDPAY_FORK_TARGET ?? "https://sepolia.base.org";
const PORT = Number(process.env.LEDPAY_FORK_PROXY_PORT ?? "8877");

const server = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  try {
    const upstream = await fetch(TARGET, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, { "content-type": "application/json" });
    res.end(text);
  } catch (error) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "proxy error" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  process.stderr.write(`Ledpay RPC proxy ${PORT} -> ${TARGET}\n`);
});
