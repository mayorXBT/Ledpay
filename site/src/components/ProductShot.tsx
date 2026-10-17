import { LIVE_TX_URL } from "../links";
import { Mark } from "./Mark";
import {
  IconBell,
  IconCollapse,
  IconGrid,
  IconHelp,
  IconKey,
  IconPulse,
  IconReceipt,
  IconSearch,
  IconShield,
  IconWrench,
  IconGear,
  IconChevron,
} from "./icons";

const NAV = [
  { icon: IconGrid, label: "Overview" },
  { icon: IconKey, label: "Session", badge: "1" },
  { icon: IconPulse, label: "Activity", badge: "6" },
  { icon: IconShield, label: "Policy" },
  { icon: IconWrench, label: "Plugin tools", badge: "8" },
  { icon: IconReceipt, label: "Receipts" },
  { icon: IconGear, label: "Settings" },
];

type Req = { id: string; title: string; amount: string; to: string; tag: string; tone: "ok" | "bad" | "info"; where: string };

const COLUMNS: { name: string; items: Req[] }[] = [
  {
    name: "Signed permission",
    items: [
      { id: "#SK01", title: "USDC transfer only", amount: "≤ 1 USDC", to: "0x1111…1111", tag: "Active · 1 hour", tone: "info", where: "Signed on Ledger Flex" },
    ],
  },
  {
    name: "Mined",
    items: [
      { id: "#TX01", title: "Live payment", amount: "1.000000 USDC", to: "0x1111…1111", tag: "Mined", tone: "ok", where: "Base Sepolia" },
      { id: "#TX02", title: "Allowed transfer", amount: "1.000000", to: "0x1111…1111", tag: "Mined", tone: "ok", where: "Fork test" },
    ],
  },
  {
    name: "Reverted on-chain",
    items: [
      { id: "#UO01", title: "Over the cap", amount: "1.000001", to: "0x1111…1111", tag: "Reverted", tone: "bad", where: "Fork test" },
      { id: "#UO02", title: "Wrong recipient", amount: "1.000000", to: "0x2222…2222", tag: "Reverted", tone: "bad", where: "Fork test" },
    ],
  },
  {
    name: "After revoke / expiry",
    items: [
      { id: "#UO03", title: "Replay after revoke", amount: "1.000000", to: "0x1111…1111", tag: "Reverted", tone: "bad", where: "Fork test" },
      { id: "#UO04", title: "Expired session", amount: "1.000000", to: "0x1111…1111", tag: "Reverted", tone: "bad", where: "Fork test" },
    ],
  },
];

const toneCls = {
  ok: "bg-[rgba(34,197,94,0.1)] text-[#4ade80]",
  bad: "bg-[rgba(236,72,153,0.1)] text-[#f472b6]",
  info: "bg-[rgba(226,107,8,0.1)] text-[#ff8a3d]",
};

function ReqCard({ r }: { r: Req }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-[#737373]">{r.id}</span>
        <span className={`rounded-[6px] px-2 py-[3px] text-[11px] font-medium ${toneCls[r.tone]}`}>{r.tag}</span>
      </div>
      <p className="mt-3 text-[14px] font-medium text-white">{r.title}</p>
      <p className="mt-1 font-mono text-[12px] text-[#a1a1a1]">
        {r.amount} → {r.to}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-[#737373]">
        <span>{r.where}</span>
        {r.id === "#TX01" && <span className="text-[#ff8a3d]">View tx ↗</span>}
      </div>
    </>
  );
  if (r.id === "#TX01") {
    return (
      <a href={LIVE_TX_URL} className="block rounded-[12px] border border-white/[0.06] bg-[#141414] p-4 transition-colors duration-400 hover:border-orange/40">
        {inner}
      </a>
    );
  }
  return <div className="rounded-[12px] border border-white/[0.06] bg-[#141414] p-4">{inner}</div>;
}

export function ProductShot() {
  return (
    <div className="relative mx-auto mt-[110px] max-w-[1152px] px-4 md:mt-[200px] md:px-0">
      <div className="relative flex h-[540px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-card shadow-[0_40px_80px_-20px_rgba(60,30,0,0.35),0_12px_32px_rgba(0,0,0,0.18)] md:h-[816px] md:rounded-[16px]">
        {/* Left panel */}
        <aside className="hidden w-[242px] shrink-0 flex-col border-r border-white/[0.06] md:flex">
          <div className="flex h-[70px] items-center justify-between px-5">
            <Mark className="size-6" />
            <IconCollapse className="size-4 text-[#737373]" />
          </div>
          <div className="mx-3 flex h-[56px] items-center gap-3 rounded-[12px] px-2">
            <div className="grid size-9 place-items-center rounded-[10px] bg-gradient-to-b from-[#2a2a2a] to-[#121212] ring-1 ring-white/10">
              <div className="h-4 w-3 rounded-[3px] border border-white/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white">Ledger Flex</p>
              <p className="truncate font-mono text-[11px] text-[#737373]">Owner · 0x0982…caD</p>
            </div>
            <span className="size-2 rounded-full bg-[#22c55e]" aria-hidden="true" />
          </div>
          <div className="mx-5 my-3 h-px bg-white/[0.06]" />
          <ul className="px-3">
            {NAV.map(({ icon: Icon, label, badge }) => (
              <li key={label} className="flex h-[34px] items-center gap-3 rounded-[8px] px-3 text-[13px] text-[#a1a1a1]">
                <Icon className="size-4" />
                <span className="flex-1">{label}</span>
                {badge && <span className="rounded-[6px] bg-white/[0.06] px-1.5 text-[11px] text-[#a1a1a1]">{badge}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-6 px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#525252]">Accounts</p>
          <ul className="mt-2 space-y-1 px-3">
            <li className="relative flex h-[38px] items-center gap-3 rounded-[8px] border border-white/[0.06] bg-[#171717] px-3 text-[13px] text-white">
              <span className="absolute -left-3 h-5 w-[3px] rounded-r bg-orange" aria-hidden="true" />
              <span className="size-2 rounded-[3px] bg-orange" />
              <span className="flex-1">Kernel</span>
              <span className="font-mono text-[11px] text-[#737373]">0x2E08…4878</span>
            </li>
            <li className="flex h-[38px] items-center gap-3 rounded-[8px] px-3 text-[13px] text-[#a1a1a1]">
              <span className="size-2 rounded-[3px] bg-[#525252]" />
              <span className="flex-1">Fork test Kernel</span>
              <span className="font-mono text-[11px] text-[#525252]">0xEC4b…cA6F</span>
            </li>
          </ul>
          <div className="mt-auto p-4">
            <div className="rounded-[12px] border border-white/[0.06] bg-[#141414] p-3 text-[12px] leading-[1.45] text-[#a1a1a1]">
              <p className="font-medium text-white">Testnet only</p>
              <p className="mt-1">Base Sepolia. No mainnet transactions.</p>
            </div>
          </div>
        </aside>

        {/* Middle */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5 md:h-[70px] md:px-6">
            <div className="flex items-center gap-2 text-[13px] text-[#737373]">
              <IconSearch className="size-4" />
              <span>Search by tx or userOp hash</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-white/[0.06] text-[#a1a1a1]">
                <IconHelp className="size-4" />
              </span>
              <span className="grid size-8 place-items-center rounded-full bg-white/[0.06] text-[#a1a1a1]">
                <IconBell className="size-4" />
              </span>
            </div>
          </div>
          <div className="px-5 pt-5 md:px-6 md:pt-6">
            <div className="flex items-center gap-1.5 text-[12px] text-[#737373]">
              <span>Accounts</span>
              <IconChevron className="size-3" />
              <span className="text-[#a1a1a1]">Kernel 0x2E08…4878</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[20px] font-semibold text-white md:text-[22px]">Ledger-owned smart account</h3>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="rounded-[8px] bg-white/[0.06] px-2.5 py-1.5 text-[#a1a1a1]">Owner: Ledger EOA</span>
                <span className="rounded-[8px] bg-[rgba(226,107,8,0.1)] px-2.5 py-1.5 text-[#ff8a3d]">Session key: scoped</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex gap-5 text-[13px]">
                <span className="border-b-2 border-orange pb-2.5 text-white">Board</span>
                <span className="pb-2.5 text-[#737373]">Timeline</span>
                <span className="pb-2.5 text-[#737373]">Policy</span>
                <span className="hidden pb-2.5 text-[#737373] sm:inline">Receipts</span>
              </div>
              <span className="hidden pb-2.5 text-[12px] text-[#737373] md:inline">EntryPoint 0.7 · Base Sepolia</span>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 gap-3 overflow-hidden px-5 pt-5 md:px-6">
            {COLUMNS.map((c) => (
              <div key={c.name} className="w-[236px] shrink-0 md:w-auto md:flex-1">
                <div className="mb-3 flex items-center gap-2 text-[13px] text-[#a1a1a1]">
                  <span>{c.name}</span>
                  <span className="rounded-full bg-[rgba(226,107,8,0.12)] px-1.5 text-[11px] text-[#ff8a3d]">{c.items.length}</span>
                </div>
                <div className="space-y-3">
                  {c.items.map((r) => (
                    <ReqCard key={r.id} r={r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* bottom fade like the template */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-card to-transparent" />
      </div>
    </div>
  );
}
