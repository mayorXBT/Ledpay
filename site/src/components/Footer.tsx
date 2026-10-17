import { GithubLogoIcon } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { ONBOARD_URL, PAYBOX_URL, REPO_URL, STATUS_URL, THREAT_MODEL_URL } from "../links";

const cols = [
  {
    title: "Project",
    links: [
      { label: "Source code", href: REPO_URL },
      { label: "Ledger onboarding guide", href: ONBOARD_URL },
      { label: "PayBox developer portal", href: PAYBOX_URL },
    ],
  },
  {
    title: "Security",
    links: [
      { label: "Threat model", href: THREAT_MODEL_URL },
      { label: "Status and evidence", href: STATUS_URL },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-fog">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-line pb-14 md:flex-row md:items-end">
          <h2 className="max-w-[18ch] text-[30px] font-semibold leading-tight tracking-[-0.03em] md:text-[38px]">
            Give your agent a budget, not your keys.
          </h2>
          <a href={REPO_URL} className="btn btn-primary">
            <GithubLogoIcon size={18} aria-hidden="true" />
            View the code on GitHub
          </a>
        </div>
        <div className="grid gap-10 pt-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo className="text-ink" />
            <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed text-slate">
              A PayBox marketplace plugin for Ledger-owned smart accounts. Built for the PayBox hackathon. Testnet
              only.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-[13px] font-medium text-mute">{c.title}</h3>
              <ul className="mt-4 space-y-3 text-[14px]">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-ink underline-offset-4 hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-14 text-[12px] text-mute">Version 0.1.0. Ledger, PayBox and ZeroDev are trademarks of their respective owners.</p>
      </div>
    </footer>
  );
}
