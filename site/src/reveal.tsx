import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

let observer: IntersectionObserver | null = null;
function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
  }
  return observer;
}

type RevealProps = {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
};

export function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} id={id} className={`appear ${className}`} style={{ ...style, ["--d" as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
