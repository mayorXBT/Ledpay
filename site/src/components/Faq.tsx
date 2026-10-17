import { useState } from "react";
import { Reveal } from "../reveal";
import { IconPlus } from "./icons";

const QA = [
  {
    q: "Does the agent ever get my Ledger key?",
    a: "No. The Ledger stays the owner of the smart account. The executor holds only a session key, and the plugin never accepts, stores or logs private keys, seeds or PayBox secrets.",
  },
  {
    q: "Do I approve every payment on the Ledger?",
    a: "No. You sign one scoped permission on the Ledger Flex. In the live run, the 1 USDC payment needed no second Flex prompt.",
  },
  {
    q: "What stops a payment outside the limits?",
    a: "The chain. The Kernel permission pins the token, recipient, per-call cap and expiry. On the fork tests, over-limit and wrong-recipient UserOps were mined with UserOperationEvent.success = false.",
  },
  {
    q: "Can I take the permission back?",
    a: "Yes. The Ledger is Kernel sudo and can uninstall the permission plugin. In the fork tests, a replay after revoke and an expired session both reverted.",
  },
  {
    q: "Is this on mainnet?",
    a: "No. Ledpay runs on Base Sepolia only, and no mainnet transactions or authorizations were sent. It was built for the MoonPay PayBox Hackathon.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="bg-night pb-[60px] pt-[120px] md:pb-[110px] md:pt-[256px]">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 md:grid-cols-[1fr_564px] md:gap-10 md:px-16">
        <div>
          <Reveal as="h2" className="text-[36px] font-semibold leading-[36px] md:text-[48px] md:leading-[48px]">
            Frequently asked
            <br className="hidden md:block" /> questions
          </Reveal>
          <Reveal as="p" delay={80} className="mt-4 text-[16px] leading-[22.4px] text-mute md:mt-5 md:text-[20px] md:leading-[28px]">
            Straight answers about keys, limits and testnet.
          </Reveal>
        </div>
        <ul className="flex flex-col gap-3">
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal as="li" key={item.q} delay={i * 60} className="card overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-[78px] w-full items-center justify-between gap-6 px-6 text-left text-[16px] font-medium leading-[22px] md:text-[18px]"
                >
                  {item.q}
                  <IconPlus className={`size-4 shrink-0 text-[#d4d4d4] transition-transform duration-300 ease-spring ${isOpen ? "rotate-45" : ""}`} />
                </button>
                <div id={`faq-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-spring ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="-mt-2 px-6 pb-6 text-[16px] leading-[22.4px] text-mute">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
