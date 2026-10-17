import { ONBOARD_URL, PAYBOX_URL, REPO_URL, STATUS_URL, THREAT_MODEL_URL } from "../links";

const links = [
  { label: "Source code", href: REPO_URL },
  { label: "Onboarding guide", href: ONBOARD_URL },
  { label: "Threat model", href: THREAT_MODEL_URL },
  { label: "Status", href: STATUS_URL },
  { label: "PayBox portal", href: PAYBOX_URL },
];

export function Footer() {
  return (
    <footer className="border-t-[3px] border-rule">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-12 md:py-12">
        <div>
          <p className="text-[32px] font-bold uppercase leading-10 text-signal">Ledpay</p>
          <p className="mt-2 text-[14px] uppercase leading-6 text-mute md:text-[16px]">
            Authorize once. Spend inside the limits.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium uppercase md:text-[14px]">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href}>
                <span className="roll">
                  <span>{l.label}</span>
                  <span aria-hidden="true">{l.label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-rule">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-2 px-5 py-4 text-[13px] uppercase md:px-12 md:text-[14px]">
          <p>© 2026 — Ledpay 0.1.0</p>
          <p>Testnet only · Base Sepolia</p>
        </div>
      </div>
    </footer>
  );
}
