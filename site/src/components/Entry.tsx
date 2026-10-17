import type { ReactNode } from "react";

/** One changelog-style entry: a sticky meta column (label + red pills) and a content column. */
export function Entry({
  id,
  label,
  tags,
  children,
}: {
  id: string;
  label: string;
  tags: string[];
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-5 py-12 md:grid-cols-[225px_minmax(0,672px)] md:gap-0 md:px-16 md:py-12">
        <div className="md:sticky md:top-[104px] md:self-start">
          <p className="text-[14px] uppercase leading-6 md:text-[16px]">{label}</p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
            {tags.map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal min-w-0">{children}</div>
      </div>
    </section>
  );
}

export function Title({ children, as = "h2" }: { children: ReactNode; as?: "h1" | "h2" }) {
  const Tag = as;
  return (
    <Tag
      className={
        as === "h1"
          ? "text-[34px] font-bold uppercase leading-[1.02] tracking-[-0.02em] md:text-[52px]"
          : "text-[24px] font-bold uppercase leading-8 md:text-[28px]"
      }
    >
      {children}
    </Tag>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  return <h3 className="mt-10 text-[20px] font-bold leading-[1.4] text-ink-2 md:text-[22px]">{children}</h3>;
}
