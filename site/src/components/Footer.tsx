import { useState } from "react";
import { ONBOARD_URL, PAYBOX_URL, REPO_URL, STATUS_URL, THREAT_MODEL_URL } from "../links";
import { Reveal } from "../reveal";
import { Mark } from "./Mark";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#tools", label: "Tools" },
  { href: "#limits", label: "Limits" },
  { href: "#status", label: "Status" },
  { href: "#faq", label: "FAQ" },
];
const PROJECT = [
  { href: REPO_URL, label: "GitHub" },
  { href: THREAT_MODEL_URL, label: "Threat model" },
  { href: STATUS_URL, label: "P0 status" },
  { href: PAYBOX_URL, label: "PayBox" },
];
const CMD = "pnpm install --frozen-lockfile && pnpm test";

function BottomHorizon() {
  return (
    <div aria-hidden="true" className="relative h-[300px] overflow-hidden bg-cream md:h-[380px]">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(55%_70%_at_50%_0%,rgba(250,214,170,0.75)_0%,rgba(248,236,218,0.4)_50%,rgba(248,246,241,0)_85%)]" />
      <div className="absolute left-1/2 top-[-490px] h-[520px] w-[max(200vw,780px)] -translate-x-1/2 rounded-[50%] bg-night shadow-[0_1px_0_#5a1400,0_3px_3px_#ff6207,0_6px_14px_rgba(255,120,30,0.7),0_24px_60px_rgba(255,160,70,0.35)] md:w-[2560px]" />
    </div>
  );
}

export function Footer() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(CMD).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <footer className="bg-cream text-ink">
      <BottomHorizon />
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <div className="mx-auto max-w-[883px] text-center">
          <Reveal as="h2" className="text-[36px] font-semibold leading-[36px] md:text-[48px] md:leading-[48px]">
            Give your agent a budget, not your keys
          </Reveal>
          <Reveal as="p" delay={80} className="mx-auto mt-4 max-w-[700px] text-[16px] leading-[22.4px] text-[#525252] md:mt-5 md:text-[20px] md:leading-[28px]">
            Authorize once on your Ledger. Ledpay keeps every payment inside the limits you signed. Testnet only, for now.
          </Reveal>
          <Reveal delay={160} className="mt-6 md:mt-8">
            <a href={REPO_URL} className="btn-dark press inline-flex h-[48px] items-center rounded-[10px] px-6 text-[16px] font-medium text-white">
              View the code on GitHub
            </a>
          </Reveal>
        </div>

        <div className="mt-[56px] h-px bg-black/[0.08] md:mt-[64px]" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 pt-[48px] md:grid-cols-[264px_264px_1fr] md:gap-8 md:pt-[64px]">
          <nav aria-label="Footer">
            <p className="text-[12px] font-medium text-[#525252]">Navigation</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-[16px] text-ink transition-colors duration-400 ease-out-framer hover:text-ember">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-[12px] font-medium text-[#525252]">Project</p>
            <ul className="mt-4 space-y-2.5">
              {PROJECT.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[16px] text-ink transition-colors duration-400 ease-out-framer hover:text-ember">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-first col-span-2 md:order-none md:col-span-1 md:w-[474px] md:justify-self-end">
            <p className="text-[20px] font-medium leading-[20px]">Run the plugin checks</p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <label className="sr-only" htmlFor="cmd">
                Command
              </label>
              <input
                id="cmd"
                readOnly
                value={CMD}
                onFocus={(e) => e.currentTarget.select()}
                className="h-[42px] min-w-0 flex-1 rounded-[10px] bg-black/[0.05] px-3 font-mono text-[12px] text-[#404040] outline-none focus:ring-2 focus:ring-orange/40"
              />
              <button type="button" onClick={copy} className="btn-dark press h-[42px] shrink-0 rounded-[8px] px-5 text-[14px] font-medium text-white">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-4 text-[12px] text-[#525252]">
              Builds dist/plugin.mjs and runs the tests. Ledger setup lives in the{" "}
              <a href={ONBOARD_URL} className="underline decoration-black/20 underline-offset-2 hover:text-ember">
                onboarding guide
              </a>
              .
            </p>
          </div>
        </div>

        {/* giant faded wordmark */}
        <div aria-hidden="true" className="relative mt-12 flex select-none items-center justify-center gap-[2vw] overflow-hidden [mask-image:linear-gradient(180deg,#000_30%,transparent_95%)] md:mt-[64px]">
          <Mark className="size-[22vw] max-w-[230px] max-h-[230px]" accent="#e8e5df" stroke="#e8e5df" />
          <span className="text-[24vw] font-semibold leading-[0.9] tracking-[-0.04em] text-[#efece6] md:text-[250px]">Ledpay</span>
        </div>

        <div className="flex flex-col gap-2 py-8 text-[12px] text-[#525252] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Ledpay. Testnet only.</p>
          <p>
            Built for the <span className="font-medium text-ink">MoonPay PayBox Hackathon</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
