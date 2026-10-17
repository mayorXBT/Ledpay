import { ArrowRightIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { Permit } from "./Permit";
import { REPO_URL } from "../links";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_30%,rgba(58,99,216,0.10),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:py-16">
        <div className="max-w-[560px]">
          <p className="text-[14px] font-medium text-cobalt">For AI agents that pay through PayBox</p>
          <h1 className="mt-4 text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-balance md:text-[58px]">
            Your agent pays. Your Ledger sets the limits.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-slate">
            Authorize once on your Ledger, and Ledpay gives your AI agent a narrowly scoped session key on a
            Ledger-owned smart account. The limits are enforced on-chain. The agent never receives your Ledger
            private key.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={REPO_URL} className="btn btn-primary">
              <GithubLogoIcon size={18} aria-hidden="true" />
              View the code on GitHub
            </a>
            <a href="#how" className="btn btn-ghost">
              See how it works
              <ArrowRightIcon size={16} aria-hidden="true" />
            </a>
          </div>
          <p className="mt-8 text-[13px] text-mute">Testnet only: Base Sepolia. No mainnet transactions.</p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Permit />
        </div>
      </div>
    </section>
  );
}
