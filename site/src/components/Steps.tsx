import { useEffect, useState } from "react";
import { Reveal } from "../reveal";
import { usePrefersReducedMotion } from "../motion";
import { IconCheck, IconDoc, IconPlusCircle, IconReceipt } from "./icons";

type Step = {
  title: string;
  text: string;
  card: { heading: string; tags: { label: string; tone: "grey" | "orange" | "pink" }[]; left: string; right: string };
};

const STEPS: Step[] = [
  {
    title: "Verify the address on the Ledger",
    text: "The onboarding app talks to the Ledger Flex over WebHID in desktop Chromium and shows the address on the device.",
    card: {
      heading: "Confirm 0x0982…caD on your Ledger Flex",
      tags: [
        { label: "#STEP1", tone: "grey" },
        { label: "WebHID", tone: "orange" },
        { label: "On device", tone: "grey" },
      ],
      left: "Desktop Chromium",
      right: "1",
    },
  },
  {
    title: "Make the Ledger the account owner",
    text: "A ZeroDev Kernel smart account is created with the Ledger address as its sudo owner.",
    card: {
      heading: "Kernel 0x2E08…4878, owned by the Ledger",
      tags: [
        { label: "#STEP2", tone: "grey" },
        { label: "Sudo", tone: "orange" },
        { label: "Base Sepolia", tone: "grey" },
      ],
      left: "Ledger EOA owner",
      right: "2",
    },
  },
  {
    title: "Sign one scoped permission",
    text: "Sign one EIP-712 approval on the Flex that names the token, recipient, cap and expiry for the agent's session key.",
    card: {
      heading: "Enable a session key: USDC, ≤ 1 per call, 1 hour",
      tags: [
        { label: "#STEP3", tone: "grey" },
        { label: "EIP-712", tone: "orange" },
        { label: "0x1111…1111", tone: "pink" },
      ],
      left: "Signed once",
      right: "3",
    },
  },
  {
    title: "Let the agent pay inside it",
    text: "The executor holds only the session key and submits ERC-4337 UserOps. The chain rejects anything off-policy.",
    card: {
      heading: "1 USDC mined on Base Sepolia, no second prompt",
      tags: [
        { label: "#STEP4", tone: "grey" },
        { label: "UserOp", tone: "orange" },
        { label: "Mined", tone: "grey" },
      ],
      left: "tx 0x6497…0185",
      right: "4",
    },
  },
];

function StepCard({ step }: { step: Step }) {
  return (
    <div className="swap-in w-[min(508px,calc(100%-32px))] rounded-[24px] bg-[#111] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.25)] md:p-9">
      <div className="flex items-start justify-between gap-6">
        <p className="text-[18px] font-semibold leading-[1.3] text-[#e5e5e5] md:text-[22px]">{step.card.heading}</p>
        <span className="flex shrink-0 items-center gap-2 text-[16px] font-medium text-[#a1a1a1]">
          <IconDoc className="size-6 text-[#e5e5e5]" /> {step.card.right}/4
        </span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {step.card.tags.map((t) => (
          <span key={t.label} className={`rounded-[164px] border px-4 py-2 text-[13px] md:text-[15px] ${toneCls[t.tone]}`}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-b from-[#ff8a3d] to-[#ce3000] text-white">
            <IconCheck className="size-5" strokeWidth={2.4} />
          </span>
          <span className="grid size-12 place-items-center rounded-full border-2 border-dashed border-white/20 text-[#d4d4d4]">
            <IconPlusCircle className="size-6" />
          </span>
          <span className="hidden font-mono text-[12px] text-[#737373] sm:inline">{step.card.left}</span>
        </div>
        <span className="flex items-center gap-2 text-[14px] text-[#a1a1a1]">
          <IconReceipt className="size-5 text-[#e5e5e5]" /> Testnet
        </span>
      </div>
    </div>
  );
}

const DURATION = 6000;
const toneCls = {
  grey: "border-white/10 bg-white/[0.04] text-[#d4d4d4]",
  orange: "border-[#e26b08]/20 bg-[rgba(226,107,8,0.12)] text-[#f0a030]",
  pink: "border-[#db2777]/20 bg-[rgba(236,72,153,0.1)] text-[#f472b6]",
};

export function Steps() {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % STEPS.length), DURATION);
    return () => window.clearTimeout(t);
  }, [active, reduced]);

  const step = STEPS[active] ?? STEPS[0]!;

  return (
    <section id="how" className="bg-night pt-[120px] md:pt-[300px]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 md:grid-cols-[364px_1fr] md:gap-[60px] md:px-16">
        <div>
          <Reveal as="h2" className="text-[28px] font-semibold leading-[33.6px] md:text-[36px] md:leading-[43.2px]">
            Set it up once, then step out of the way
          </Reveal>
          <Reveal as="p" delay={80} className="mt-5 text-[16px] leading-[22.4px] text-mute md:text-[20px] md:leading-[28px]">
            This is how Ledpay gets from your Ledger to an agent that can pay.
          </Reveal>
          <ul className="mt-8 md:mt-10">
            {STEPS.map((s, i) => {
              const open = i === active;
              return (
                <li key={s.title} className="border-t border-white/[0.08] last:border-b">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActive(i)}
                    className={`w-full pb-[20px] pt-[20px] text-left text-[16px] font-medium leading-[22px] transition-colors duration-400 ease-out-framer md:text-[18px] ${open ? "text-white" : "text-[#737373] hover:text-[#d4d4d4]"}`}
                  >
                    {s.title}
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-spring ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="pb-5 text-[14px] leading-[19.6px] text-mute md:text-[16px] md:leading-[22.4px]">{s.text}</p>
                      <div className="mb-5 flex h-[300px] items-center justify-center rounded-[16px] bg-cream md:hidden">
                        <StepCard step={s} />
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div className="relative -mt-px h-px overflow-hidden">
                      <span
                        key={active}
                        className="progress-bar absolute inset-0 bg-gradient-to-r from-[#ce3000] via-[#ff6207] to-[#ffb36b]"
                        style={{ ["--dur" as string]: `${DURATION}ms`}}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <Reveal delay={120} className="relative hidden h-[360px] items-center md:flex justify-center overflow-hidden rounded-[16px] bg-cream md:h-[546px]">
          <StepCard key={active} step={step} />
        </Reveal>
      </div>
    </section>
  );
}
