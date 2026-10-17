import { useState } from "react";
import { REPO_URL } from "../links";
import { Mark } from "./Mark";
import { IconMenu, IconX } from "./icons";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#tools", label: "Tools" },
  { href: "#limits", label: "Limits" },
  { href: "#status", label: "Status" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 md:px-0">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[52px] max-w-[860px] items-center justify-between rounded-[16px] bg-raise pl-5 pr-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:pl-[19px]"
      >
        <a href="#top" className="flex items-center gap-2 text-white" aria-label="Ledpay home">
          <Mark className="size-6" />
          <span className="text-[16px] font-semibold tracking-[0.48px]">Ledpay</span>
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[14px] text-white/90 transition-colors duration-400 ease-out-framer hover:text-orange"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={REPO_URL}
          className="btn-accent press hidden h-[32px] items-center rounded-[8px] px-4 text-[13px] font-medium text-white md:inline-flex"
        >
          View on GitHub
        </a>
        <button
          type="button"
          className="press grid size-9 place-items-center rounded-[8px] text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX className="size-5" /> : <IconMenu className="size-5" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="mx-auto mt-2 max-w-[860px] rounded-[16px] bg-raise p-2 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-[8px] px-3 py-3 text-[15px] text-white hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <a href={REPO_URL} className="btn-accent mt-1 block rounded-[8px] px-3 py-3 text-center text-[14px] font-medium text-white">
            View on GitHub
          </a>
        </div>
      )}
    </header>
  );
}
