export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M10 8v16h12"
          fill="none"
          className="stroke-fog"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="15" y="9" width="8" height="8" rx="2" className="fill-cobalt" />
      </svg>
      <span className="text-[17px]">Ledpay</span>
    </span>
  );
}
