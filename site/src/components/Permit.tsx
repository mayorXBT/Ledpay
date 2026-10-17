import { IconCheck, IconX } from "./icons";

const SCOPE: [string, string][] = [
  ["Token", "USDC, Base Sepolia"],
  ["Call", "ERC-20 transfer only"],
  ["Recipient", "0x1111…1111"],
  ["Per call", "≤ 1 USDC"],
  ["Native value", "0"],
  ["Expires", "1 hour"],
];

const REQUESTS = [
  { amount: "1.000000", to: "0x1111…1111", ok: true, note: "Mined" },
  { amount: "1.000001", to: "0x1111…1111", ok: false, note: "Over limit" },
  { amount: "1.000000", to: "0x2222…2222", ok: false, note: "Wrong recipient" },
];

/** The signed-limits card: the permission scope the Ledger signed, and what happened to requests against it. */
export function Permit({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-[16px] border border-white/[0.08] bg-[#121212] p-5 text-left shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#737373]">Session permission</p>
          <p className="mt-1 text-[16px] font-medium text-white">Signed on Ledger Flex</p>
        </div>
        <span className="rounded-[164px] bg-[rgba(226,107,8,0.12)] px-2.5 py-1 text-[12px] font-medium text-[#ff8a3d]">EIP-712</span>
      </div>
      <dl className="mt-4 divide-y divide-white/[0.06] rounded-[12px] border border-white/[0.06] bg-[#0d0d0d]">
        {SCOPE.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-3.5 py-2.5 text-[13px]">
            <dt className="text-[#a1a1a1]">{k}</dt>
            <dd className="font-mono text-[12px] text-white">{v}</dd>
          </div>
        ))}
      </dl>
      {!compact && (
        <ul className="mt-4 space-y-2">
          {REQUESTS.map((r) => (
            <li key={r.amount + r.to} className="flex items-center gap-3 rounded-[10px] bg-white/[0.03] px-3 py-2 text-[12px]">
              <span className={`grid size-5 place-items-center rounded-full ${r.ok ? "bg-[rgba(34,197,94,0.12)] text-[#4ade80]" : "bg-[rgba(236,72,153,0.12)] text-[#f472b6]"}`}>
                {r.ok ? <IconCheck className="size-3" strokeWidth={2.4} /> : <IconX className="size-3" strokeWidth={2.4} />}
              </span>
              <span className="font-mono text-white">{r.amount}</span>
              <span className="font-mono text-[#737373]">→ {r.to}</span>
              <span className={`ml-auto ${r.ok ? "text-[#4ade80]" : "text-[#f472b6]"}`}>{r.note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
