import type { ReactNode } from "react";
import { Reveal } from "../reveal";
import { Permit } from "./Permit";
import { IconCheck, IconCoin, IconGauge, IconTarget, IconTimer } from "./icons";

const FLOW = [
  { label: "Agent calls ledpay_session_send", done: true },
  { label: "Executor signs the UserOp", done: true },
  { label: "Kernel checks the policy", done: false },
  { label: "Mined, or reverted on-chain", done: false },
];

const MINIS = [
  { icon: IconCoin, title: "One token, one call", text: "USDC on Base Sepolia through ERC-20 transfer. No approve, transferFrom or delegatecall." },
  { icon: IconTarget, title: "One recipient", text: "The permission names the payee. A transfer to any other address reverts." },
  { icon: IconGauge, title: "A per-call cap", text: "At most 1 USDC per call in the live run. 1.000001 reverts on-chain." },
  { icon: IconTimer, title: "An expiry", text: "The session is valid for one hour. An expired UserOp reverts." },
];

export function SectionTitle({ title, sub, className = "" }: { title: ReactNode; sub: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[841px] text-center ${className}`}>
      <Reveal as="h2" className="text-[36px] font-semibold leading-[36px] text-white md:text-[48px] md:leading-[48px]">
        {title}
      </Reveal>
      <Reveal as="p" delay={100} className="mx-auto mt-4 max-w-[640px] text-[16px] leading-[22.4px] text-mute md:mt-5 md:text-[20px] md:leading-[28px]">
        {sub}
      </Reveal>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative bg-night pt-[100px] md:pt-[180px]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <SectionTitle
          title={
            <>
              Everything an agent needs to pay,
              <br className="hidden md:block" /> and nothing more
            </>
          }
          sub="One Ledger approval, one scoped key, and limits the chain enforces."
        />

        <div className="mt-10 grid gap-3 md:mt-16 md:grid-cols-[570px_279px_279px] md:grid-rows-[310px_310px] md:justify-between">
          {/* Large card (template: mobile app) */}
          <Reveal className="card relative overflow-hidden md:row-span-2 md:h-[632px]">
            <div className="px-5 pt-6 md:px-10 md:pt-10">
              <h3 className="text-[18px] font-semibold leading-[21.6px] md:text-[20px] md:leading-[24px]">Authorize once on your Ledger</h3>
              <p className="mt-3 max-w-[488px] text-[14px] leading-[22.4px] text-mute md:text-[16px]">
                Verify the address on the device, then sign one approval for a scoped session key. The Ledger key never leaves the Ledger.
              </p>
            </div>
            <div className="relative mx-auto mt-10 w-[300px] max-w-[calc(100%-40px)] md:absolute md:left-1/2 md:top-[200px] md:mt-0 md:w-[340px] md:-translate-x-1/2">
              <div className="rounded-t-[28px] border border-b-0 border-white/[0.12] bg-[#0b0b0b] p-2.5 pb-0 shadow-[0_0_0_6px_#151515,0_30px_60px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between px-3 pb-2 pt-1 text-[11px] text-[#a1a1a1]">
                  <span>Ledpay onboarding</span>
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[#22c55e]" /> WebHID
                  </span>
                </div>
                <Permit compact />
                <div className="h-6" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-card to-transparent" />
          </Reveal>

          {/* Performance (rays) */}
          <Reveal delay={80} className="card relative overflow-hidden md:h-[310px]">
            <div aria-hidden="true" className="relative h-[170px] overflow-hidden [mask-image:linear-gradient(180deg,#000_60%,transparent)]">
              <div className="absolute -right-6 top-0 h-full w-[120%] origin-top-right -skew-x-[28deg] rotate-[-8deg]">
                {Array.from({ length: 9 }, (_, i) => (
                  <span
                    key={i}
                    className="ray absolute h-[4px] rounded-full bg-gradient-to-r from-[rgba(206,48,0,0)] via-[#ff6207] to-[#ffe2a8] shadow-[0_0_12px_rgba(255,140,40,0.6)]"
                    style={{ top: `${18 + i * 15}px`, left: `${10 + i * 4}%`, width: `${36 + (i % 3) * 8}%`, animationDelay: `${i * 0.22}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-[18px] font-medium leading-[21.6px]">Limits the chain enforces</h3>
              <p className="mt-2 text-[16px] leading-[22.4px] text-mute">Over-limit and wrong-recipient UserOps revert on-chain, whatever the agent asks for.</p>
            </div>
          </Reveal>

          {/* Automation (orange) */}
          <Reveal delay={160} className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#ff7e17_0%,#f94500_45%,#ce3000_100%)] md:row-span-2 md:h-[628px]">
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:4px_4px]" />
            <div className="relative flex h-[400px] flex-col items-center justify-center md:h-[457px]">
              <svg className="absolute left-1/2 top-[60px] h-[calc(100%-120px)] w-px -translate-x-1/2 overflow-visible" aria-hidden="true">
                <line x1="0" y1="0" x2="0" y2="100%" stroke="rgba(255,234,210,0.5)" strokeWidth="1" strokeDasharray="2 4" className="flow-line" />
              </svg>
              <ol className="relative flex flex-col items-center gap-[38px]">
                {FLOW.map((s, i) => (
                  <li
                    key={s.label}
                    className={`flex h-[34px] items-center gap-2 rounded-[164px] bg-[#3c1300]/70 pl-2 pr-4 text-[12px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur ${i % 2 ? "translate-x-3" : "-translate-x-3"}`}
                  >
                    <span className={`grid size-[18px] place-items-center rounded-full ${s.done ? "bg-white text-[#ce3000]" : "border border-white/40"}`}>
                      {s.done && <IconCheck className="size-3" strokeWidth={2.6} />}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative px-6 pb-6">
              <h3 className="text-[18px] font-medium leading-[21.6px] text-white">Spend without a second prompt</h3>
              <p className="mt-2 text-[16px] leading-[22.4px] text-peach">
                The live 1 USDC payment went through with no second Ledger Flex confirmation.
              </p>
            </div>
          </Reveal>

          {/* Collaboration (cursors) */}
          <Reveal delay={120} className="card relative overflow-hidden md:col-start-2 md:row-start-2 md:h-[310px]">
            <div className="relative px-3 pt-3">
              <div className="rounded-[12px] border border-white/[0.06] bg-[#141414] p-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[#737373]">Kernel 0x2E08…4878</span>
                  <span className="rounded-[6px] bg-[rgba(226,107,8,0.12)] px-2 py-0.5 text-[#ff8a3d]">Active</span>
                </div>
                <p className="mt-2.5 text-[14px] text-white">Session permission</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#a1a1a1]">USDC → 0x1111…1111</span>
                  <span className="rounded-[8px] border border-white/10 px-2.5 py-1 text-[11px] text-white">Revoke</span>
                </div>
              </div>
              <div aria-hidden="true" className="drift-a absolute left-1 top-0">
                <span className="block rounded-[4px] rounded-tl-none bg-[#e26b08] px-1.5 py-0.5 text-[12px] text-white">Owner</span>
              </div>
              <div aria-hidden="true" className="drift-b absolute bottom-[-14px] right-3">
                <svg viewBox="0 0 16 16" className="ml-auto size-4 -rotate-90 text-[#ff6207]">
                  <path d="M2 2l12 5-5 2-2 5z" fill="currentColor" />
                </svg>
                <span className="block rounded-[4px] bg-[#ff6207] px-1.5 py-0.5 text-[12px] text-white">Ledger</span>
              </div>
            </div>
            <div className="px-6 pb-6 pt-[34px]">
              <h3 className="text-[18px] font-medium leading-[21.6px]">Revocable by the owner</h3>
              <p className="mt-2 text-[16px] leading-[22.4px] text-mute">The Ledger stays Kernel sudo and can uninstall the permission. A replay after that reverts.</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 h-px bg-white/[0.06] md:mt-[64px]" />

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-[64px] md:grid-cols-4 md:gap-8">
          {MINIS.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 70}>
              <span className="icon-tile grid size-12 place-items-center rounded-[16px] text-orange">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-6 text-[18px] font-medium leading-[21.6px]">{title}</h3>
              <p className="mt-2 text-[14px] leading-[19.6px] text-mute md:text-[16px] md:leading-[22.4px]">{text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
