import { GithubLogoIcon } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { REPO_URL } from "../links";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#security", label: "Security" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-fog/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8" aria-label="Main">
        <a href="#top" className="text-ink" aria-label="Ledpay home">
          <Logo />
        </a>
        <ul className="hidden items-center gap-8 text-[14px] text-slate md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors duration-200 hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={REPO_URL} className="btn btn-primary px-4 py-2 text-[14px]">
          <GithubLogoIcon size={18} weight="regular" aria-hidden="true" />
          <span>GitHub</span>
        </a>
      </nav>
    </header>
  );
}
