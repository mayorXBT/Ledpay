import { REPO_URL } from "../links";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#security", label: "Security" },
  { href: REPO_URL, label: "GitHub" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-[0_3px_0_0_var(--color-rule)]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-5 md:px-6">
        <a
          href="#top"
          className="text-[30px] font-bold uppercase leading-none tracking-[-0.01em] text-signal md:text-[48px] md:leading-10"
          aria-label="Ledpay home"
        >
          Ledpay
        </a>
        <nav aria-label="Main">
          <ul className="flex items-center gap-4 text-[13px] font-medium uppercase md:gap-5 md:text-[16px]">
            {links.map((l, i) => (
              <li key={l.label} className={i < 3 ? "hidden md:block" : ""}>
                <a href={l.href}>
                  <span className="roll">
                    <span>{l.label}</span>
                    <span aria-hidden="true">{l.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
