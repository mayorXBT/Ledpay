import { ONBOARD_URL } from "../links";
import { Reveal } from "../reveal";
import { Funnel } from "./Funnel";
import { ProductShot } from "./ProductShot";
import { IconChip, IconCube, IconKey, IconLayers, IconLink, IconShield, IconUsb, IconCoin } from "./icons";

const STACK = [
  { icon: IconUsb, label: "Ledger Flex" },
  { icon: IconCube, label: "ZeroDev Kernel" },
  { icon: IconLayers, label: "ERC-4337" },
  { icon: IconLink, label: "Base Sepolia" },
  { icon: IconCoin, label: "USDC" },
  { icon: IconShield, label: "PayBox" },
  { icon: IconKey, label: "viem" },
  { icon: IconChip, label: "Ledger DMK" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-cream text-ink">
      <Funnel />
      <div className="relative mx-auto max-w-[1280px] px-4 pt-[100px] md:px-16 md:pt-[144px]">
        <div className="mx-auto flex max-w-[880px] flex-col items-center text-center">
          <Reveal>
            <a
              href="#status"
              className="press inline-flex h-[24px] items-center gap-1.5 rounded-[164px] border border-black/[0.08] bg-white/60 pl-[5px] pr-3 backdrop-blur-sm"
            >
              <span className="rounded-[164px] bg-gradient-to-b from-[#ff6207] to-[#ce3000] px-2 py-[3px] text-[8px] font-semibold uppercase text-peach">
                Testnet
              </span>
              <span className="text-[12px] font-medium text-[#404040]">Live on Base Sepolia with a real Ledger Flex</span>
            </a>
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-[26px] text-[40px] font-semibold leading-[40px] text-ink md:mt-[33px] md:text-[64px] md:leading-[64px]">
            Your agent pays inside
            <br className="hidden md:block" /> limits your Ledger signed
          </Reveal>
          <Reveal as="p" delay={160} className="mt-4 max-w-[880px] text-[16px] leading-[22.4px] text-[#525252] md:mt-5 md:text-[20px] md:leading-[28px]">
            Approve one scoped key on your Ledger. Your agent sends USDC inside it, and nothing else.
          </Reveal>
          <Reveal delay={240} className="mt-6 md:mt-8">
            <a
              href={ONBOARD_URL}
              className="btn-dark press inline-flex h-[48px] items-center rounded-[10px] px-6 text-[16px] font-medium text-white"
            >
              Set up with your Ledger
            </a>
          </Reveal>
        </div>
      </div>
      <Reveal delay={320} className="relative">
        <ProductShot />
      </Reveal>

      {/* Built-on strip (template: "Trusted by teams everywhere" logo ticker) */}
      <div className="relative mx-auto mt-[56px] max-w-[850px] px-4 md:mt-[96px]">
        <p className="text-center text-[16px] font-semibold leading-[22.4px] text-ink">Built on open standards and real hardware</p>
        <div className="mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]">
          <ul className="ticker flex w-max items-center gap-16">
            {[...STACK, ...STACK].map(({ icon: Icon, label }, i) => (
              <li key={`${label}-${i}`} className="flex items-center gap-2 text-ink" aria-hidden={i >= STACK.length}>
                <Icon className="size-6" strokeWidth={2} />
                <span className="whitespace-nowrap text-[20px] font-semibold">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Horizon />
    </section>
  );
}

/** The curved orange-rimmed horizon where the cream page meets the dark middle. */
export function Horizon() {
  return (
    <div aria-hidden="true" className="relative h-[220px] overflow-hidden md:h-[260px]">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(55%_75%_at_50%_100%,rgba(246,214,168,0.8)_0%,rgba(248,236,216,0.45)_50%,rgba(248,246,241,0)_85%)]" />
      <div className="absolute bottom-[-470px] left-1/2 h-[520px] w-[max(200vw,780px)] -translate-x-1/2 rounded-[50%] bg-night shadow-[0_-1px_0_#5a1400,0_-3px_3px_#ff6207,0_-6px_14px_rgba(255,120,30,0.7),0_-24px_60px_rgba(255,160,70,0.35)] md:w-[2560px]" />
    </div>
  );
}
