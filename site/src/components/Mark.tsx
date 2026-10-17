type MarkProps = { className?: string; accent?: string; stroke?: string };

/** Ledpay mark: a signed boundary (orange frame) around an "L" path. */
export function Mark({ className = "size-6", accent = "#ff6207", stroke = "currentColor" }: MarkProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="5" width="22" height="22" rx="7" stroke={accent} strokeWidth="2.6" />
      <path d="M12.5 10.5v10h7.5" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
