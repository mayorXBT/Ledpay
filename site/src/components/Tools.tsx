import { Reveal } from "../reveal";
import { Mark } from "./Mark";
import { SectionTitle } from "./Features";
import { IconChip, IconCube, IconKey, IconLayers, IconLink, IconPulse, IconReceipt, IconShield, IconUsb, IconWrench, IconCoin, IconDoc } from "./icons";
import type { ComponentType, SVGProps } from "react";

type Group = { name: string; text: string; chips: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; mono?: boolean }[] };

const LEFT: Group[] = [
  {
    name: "Kernel session",
    text: "Onboard, inspect, pay and fetch receipts through the Ledger-owned Kernel.",
    chips: [
      { icon: IconLink, label: "get_setup_link", mono: true },
      { icon: IconKey, label: "get_session", mono: true },
      { icon: IconPulse, label: "session_send", mono: true },
      { icon: IconReceipt, label: "get_transaction", mono: true },
    ],
  },
  {
    name: "Ledger onboarding",
    text: "A desktop Chromium app built on the Ledger Device Management Kit.",
    chips: [
      { icon: IconChip, label: "Device Management Kit" },
      { icon: IconUsb, label: "WebHID" },
      { icon: IconKey, label: "Ethereum signer" },
    ],
  },
];

const RIGHT: Group[] = [
  {
    name: "Marketplace sample",
    text: "Policy reads, checks and transfer proposals for PayBox's own signing flow.",
    chips: [
      { icon: IconShield, label: "get_policy", mono: true },
      { icon: IconWrench, label: "check_payment", mono: true },
      { icon: IconCoin, label: "send_usdc", mono: true },
      { icon: IconDoc, label: "get_setup", mono: true },
    ],
  },
  {
    name: "Chain",
    text: "Smart account and session permissions on Base Sepolia.",
    chips: [
      { icon: IconCube, label: "ZeroDev Kernel" },
      { icon: IconLayers, label: "ERC-4337" },
      { icon: IconKey, label: "viem" },
    ],
  },
];

function GroupCard({ g, delay }: { g: Group; delay: number }) {
  return (
    <Reveal delay={delay} className="card relative overflow-hidden p-5 md:p-6">
      <span className="absolute right-0 top-0 grid h-[40px] w-[46px] place-items-center rounded-bl-[12px] border-b border-l border-white/[0.06] text-[13px] text-[#a1a1a1]">
        {g.chips.length}
      </span>
      <h3 className="text-[18px] font-semibold leading-[21.6px] md:text-[20px] md:leading-[24px]">{g.name}</h3>
      <p className="mt-3 max-w-[308px] text-[13px] leading-[18px] text-mute md:text-[14px] md:leading-[19.6px]">{g.text}</p>
      <div className="my-5 h-px bg-white/[0.06]" />
      <ul className="flex flex-wrap gap-2">
        {g.chips.map(({ icon: Icon, label, mono }) => (
          <li key={label} className="tile flex h-[42px] items-center gap-2 rounded-[12px] px-3.5 text-[14px] font-medium md:h-[44px] md:text-[15px]">
            <Icon className="size-4 text-[#a1a1a1]" />
            <span className={mono ? "font-mono text-[13px]" : ""}>{label}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Tools() {
  return (
    <section id="tools" className="bg-night pt-[120px] md:pt-[230px]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <SectionTitle
          title="Plugin tools"
          sub={
            <span className="inline-flex items-center gap-2 text-[14px] md:text-[16px]">
              <span className="tile inline-flex h-[26px] items-center gap-1.5 rounded-[8px] px-2 text-[13px] font-medium text-white">
                <IconWrench className="size-3.5 text-[#a1a1a1]" /> 8
              </span>
              tools, one narrow job: <span className="text-white">paying inside the policy</span>
            </span>
          }
        />
        <div className="mt-10 grid gap-3 md:mt-[52px] md:grid-cols-[1fr_353px_1fr] md:items-start">
          <div className="order-2 flex flex-col gap-3 md:order-1">
            {LEFT.map((g, i) => (
              <GroupCard key={g.name} g={g} delay={i * 80} />
            ))}
          </div>
          <Reveal delay={60} className="order-1 md:order-2 md:py-[0px]">
            <div className="relative h-[380px] overflow-hidden rounded-[16px] border border-white/[0.06] bg-card md:h-[520px]">
              <div className="glow-breathe absolute inset-x-[-20%] bottom-[-45%] h-[90%] rounded-[50%] bg-[radial-gradient(50%_50%_at_50%_50%,#ffb020_0%,#ff6207_35%,rgba(206,48,0,0.45)_60%,transparent_75%)]" />
              {Array.from({ length: 22 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="dust absolute size-[2px] rounded-full bg-[#ffc37a]"
                  style={{
                    left: `${8 + ((i * 37) % 84)}%`,
                    bottom: `${4 + ((i * 13) % 30)}%`,
                    ["--t" as string]: `${5 + (i % 5)}s`,
                    ["--d" as string]: `${-(i * 0.7)}s`,
                  }}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff8a3d] to-transparent" />
              <div className="absolute left-1/2 top-1/2 grid size-[120px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[20px] border border-white/10 bg-gradient-to-b from-[#2a2a2a] to-[#141414] shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_20px_40px_rgba(0,0,0,0.5),0_2px_0_#ff6207] md:size-[134px]">
                <Mark className="size-16" stroke="#fff" />
              </div>
            </div>
          </Reveal>
          <div className="order-3 flex flex-col gap-3">
            {RIGHT.map((g, i) => (
              <GroupCard key={g.name} g={g} delay={120 + i * 80} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
