import { LIVE_TX_URL, STATUS_URL } from "../links";
import { Reveal } from "../reveal";
import { SectionTitle } from "./Features";
import { IconCheck } from "./icons";

type Plan = {
  name: string;
  big: string;
  unit?: string;
  note?: string;
  lead?: string;
  items: string[];
  cta: string;
  href: string;
  hot?: boolean;
  gaps?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Ledger onboarding",
    big: "Done",
    items: ["Flex address verified over WebHID", "Kernel sudo is the Ledger EOA", "Session permission signed on the Flex"],
    cta: "See the evidence",
    href: STATUS_URL,
  },
  {
    name: "On-chain policy",
    big: "Tested",
    unit: "on a fork",
    note: "Base Sepolia, Anvil",
    items: ["Allowed transfer mined", "Over limit reverts", "Wrong recipient reverts", "Replay after revoke reverts", "Expired session reverts"],
    cta: "See the test run",
    href: STATUS_URL,
  },
  {
    name: "Live spend",
    big: "1",
    unit: "USDC",
    note: "Base Sepolia",
    lead: "From the Ledger-owned Kernel:",
    items: ["Sent by the executor's session key", "No second Ledger Flex prompt", "Receipt on Basescan"],
    cta: "View the transaction",
    href: LIVE_TX_URL,
    hot: true,
  },
  {
    name: "Not yet",
    big: "Testnet",
    lead: "Known limits today:",
    items: ["No mainnet transactions", "Multi-tenant PayBox identity unsupported", "Live spend ran via the executor, not a hosted PayBox invoke", "Hosted PayBox upload is still a participant step"],
    cta: "Read the limits",
    href: STATUS_URL,
    gaps: true,
  },
];

export function Status() {
  return (
    <section id="status" className="bg-night pt-[120px] md:pt-[256px]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <SectionTitle title="Where it stands" sub="What the repo proves today, and what it doesn't. No overselling." />
        <div className="mt-10 grid gap-3 md:mt-10 md:grid-cols-4 md:gap-[12px]">
          {PLANS.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 70}
              className={`relative flex flex-col rounded-[16px] border p-6 md:min-h-[520px] ${p.hot ? "border-white/[0.08] bg-[linear-gradient(160deg,#2a1a12_0%,#141414_45%,#0f0f0f_100%)]" : "card"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-medium leading-[24px]">{p.name}</h3>
                {p.hot && <span className="rounded-[164px] bg-flame px-2.5 py-1 text-[11px] font-medium text-white">Live</span>}
              </div>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="text-[44px] font-medium leading-[44px]">{p.big}</span>
                {p.unit && <span className="text-[14px] text-[#a1a1a1]">{p.unit}</span>}
              </p>
              {p.note && <p className="mt-3 text-[14px] text-[#a1a1a1]">{p.note}</p>}
              <div className="mt-10 md:mt-auto">
                {p.lead && <p className="mb-3 text-[15px] font-medium text-white">{p.lead}</p>}
                <ul className="space-y-2.5">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2 text-[15px] leading-[20px] text-[#e5e5e5]">
                      {p.gaps ? (
                        <span className="mt-[9px] h-[2px] w-3 shrink-0 rounded-full bg-[#737373]" aria-hidden="true" />
                      ) : (
                        <IconCheck className="mt-0.5 size-4 shrink-0 text-ember" strokeWidth={2} />
                      )}
                      {it}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className={`press mt-8 flex h-[48px] items-center justify-center rounded-[10px] text-[16px] font-medium text-white ${p.hot ? "btn-accent" : "btn-dark"}`}
                >
                  {p.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
