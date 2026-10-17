import { ArrowUpRightIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { LIVE_TX_URL, STATUS_URL, THREAT_MODEL_URL } from "../links";

const guarantees = [
  "The agent and the executor never receive your Ledger private key or seed.",
  "The plugin never accepts, stores or logs private keys, seeds or PayBox secrets.",
  "The session key can't change the account owner, edit policies or grant new rights.",
  "An invalid spending cap fails closed to 0.",
  "Over-limit or non-allowlisted requests return an error with no transaction proposal.",
];

const limits = [
  "Testnet only. No mainnet transactions or authorizations have been sent.",
  "PayBox doesn't yet pass an authenticated user identity, so multi-tenant binding is unsupported.",
  "Ledger Transaction Checks are omitted until Ledger issues an origin token.",
];

export function Security() {
  return (
    <section id="security" className="scroll-mt-16 bg-night text-fog">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <ShieldCheckIcon size={30} className="text-[#7f9cf0]" aria-hidden="true" />
            <h2 className="mt-5 text-[32px] font-semibold leading-tight tracking-[-0.03em] md:text-[40px]">
              What the agent can&rsquo;t do
            </h2>
            <ul className="mt-8 divide-y divide-night-line border-y border-night-line">
              {guarantees.map((g) => (
                <li key={g} className="py-4 text-[15px] leading-relaxed text-night-text">
                  {g}
                </li>
              ))}
            </ul>
            <a
              href={THREAT_MODEL_URL}
              className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-fog underline-offset-4 hover:underline"
            >
              Read the threat model
              <ArrowUpRightIcon size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="space-y-5">
            <div className="rounded-[22px] bg-[#181d25] p-7 ring-1 ring-night-line">
              <p className="text-[13px] text-night-text">Proof on Base Sepolia</p>
              <p className="mt-2 text-[19px] font-semibold leading-snug tracking-tight">
                A 1 USDC payment from a Ledger-owned Kernel, with no second prompt on the Flex.
              </p>
              <a
                href={LIVE_TX_URL}
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-[13px] text-[#9fb4f3] underline-offset-4 hover:underline"
              >
                tx 0x64972168…0185
                <ArrowUpRightIcon size={14} aria-hidden="true" />
              </a>
            </div>
            <div className="rounded-[22px] p-7 ring-1 ring-night-line">
              <p className="text-[13px] text-night-text">Honest limits</p>
              <ul className="mt-3 space-y-3 text-[14px] leading-relaxed text-night-text">
                {limits.map((l) => (
                  <li key={l} className="flex gap-3">
                    <span className="mt-[9px] size-1 shrink-0 rounded-full bg-night-text" aria-hidden="true" />
                    {l}
                  </li>
                ))}
              </ul>
              <a
                href={STATUS_URL}
                className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-fog underline-offset-4 hover:underline"
              >
                See the full status
                <ArrowUpRightIcon size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
