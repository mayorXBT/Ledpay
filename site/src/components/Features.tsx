import { ArrowCounterClockwiseIcon, LockKeyIcon, RobotIcon, WalletIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

const pinned = [
  "ERC-20 transfer only: no approve, transferFrom or delegatecall",
  "One allowlisted recipient",
  "A per-call amount cap",
  "Native value limit of 0",
  "A timestamp expiry",
];

const revokeEvidence = [
  { k: "Revoke permission", v: "Mined" },
  { k: "Replay after revoke", v: "Reverted" },
  { k: "Send after expiry", v: "Reverted" },
];

const keys = [
  { k: "Ledger address", v: "Owner. Signs setup and revoke." },
  { k: "Kernel account", v: "Holds the agent budget." },
  { k: "Session key", v: "Spends inside the policy." },
];

const tools = [
  "ledpay_get_setup_link",
  "ledpay_get_session",
  "ledpay_session_send",
  "ledpay_get_transaction",
  "ledpay_get_policy",
  "ledpay_check_payment",
  "ledpay_send_usdc",
  "ledpay_get_setup",
];

function Tile({
  icon,
  title,
  body,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-[22px] bg-paper p-7 ring-1 ring-line md:p-9 ${className}`}>
      <div className="text-cobalt">{icon}</div>
      <h3 className="mt-5 text-[21px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-slate">{body}</p>
      {children}
    </article>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <h2 className="max-w-[24ch] text-[32px] font-semibold leading-tight tracking-[-0.03em] md:text-[40px]">
          Spending power with hard edges
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-[1.35fr_1fr]">
          <Tile
            icon={<LockKeyIcon size={28} aria-hidden="true" />}
            title="Limits that live on-chain"
            body="The session permission is a ZeroDev Kernel policy. If a request falls outside it, the UserOp fails validation on-chain."
          >
            <ul className="mt-6 divide-y divide-line border-t border-line text-[14px]">
              {pinned.map((p) => (
                <li key={p} className="py-2.5 text-ink">
                  {p}
                </li>
              ))}
            </ul>
          </Tile>
          <Tile
            icon={<ArrowCounterClockwiseIcon size={28} aria-hidden="true" />}
            title="Revoke from the Ledger"
            body="The Ledger stays the owner of the account, so it can uninstall the permission at any time."
          >
            <ul className="mt-6 divide-y divide-line border-t border-line text-[14px]">
              {revokeEvidence.map((r) => (
                <li key={r.k} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-ink">{r.k}</span>
                  <span className={`font-mono text-[13px] ${r.v === "Mined" ? "text-allow" : "text-deny"}`}>{r.v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-mute">From the repo&rsquo;s Base Sepolia fork tests.</p>
          </Tile>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.35fr]">
          <Tile
            icon={<WalletIcon size={28} aria-hidden="true" />}
            title="Funds stay separate"
            body="Agent spend comes from the Kernel smart account you fund, not from the balance on your Ledger address."
          >
            <ol className="mt-6 space-y-2">
              {keys.map((k, i) => (
                <li key={k.k} className="flex items-start gap-3 rounded-xl bg-fog px-3.5 py-3 ring-1 ring-line">
                  <span className="mt-0.5 font-mono text-[12px] text-cobalt">{i + 1}</span>
                  <span className="text-[14px] leading-snug">
                    <span className="font-medium text-ink">{k.k}</span>
                    <span className="block text-slate">{k.v}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Tile>
          <Tile
            icon={<RobotIcon size={28} aria-hidden="true" />}
            title="Built as a PayBox plugin"
            body="Agents find Ledpay in the PayBox marketplace and call its tools. Ledger onboarding runs in a separate Chromium app, because WebHID can't run in the plugin sandbox."
          >
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Ledpay tools">
              {tools.map((t) => (
                <li key={t} className="rounded-lg bg-fog px-2.5 py-1.5 font-mono text-[12px] text-slate ring-1 ring-line">
                  {t}
                </li>
              ))}
            </ul>
          </Tile>
        </div>
      </div>
    </section>
  );
}
