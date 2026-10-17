import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconCheck = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const IconPlus = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconPlusCircle = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
export const IconCoin = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.5 0-2.6.8-2.6 2 0 2.8 5.3 1.4 5.3 4.1 0 1.2-1.2 2-2.7 2-1.2 0-2.2-.6-2.6-1.6M12 6.5V8M12 16.1v1.4" />
  </svg>
);
export const IconTarget = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);
export const IconGauge = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 16a8 8 0 1 1 16 0" />
    <path d="m12 16 4-5" />
    <path d="M4 19.5h16" />
  </svg>
);
export const IconTimer = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13l2.5 1.5M10 3h4" />
  </svg>
);
export const IconSearch = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);
export const IconBell = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5h4" />
  </svg>
);
export const IconHelp = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8M12 16.8v.2" />
  </svg>
);
export const IconGrid = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
);
export const IconKey = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 8-8M16 7l2 2M14 9l1.5 1.5" />
  </svg>
);
export const IconPulse = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
  </svg>
);
export const IconShield = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const IconWrench = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 1-2-2z" />
  </svg>
);
export const IconReceipt = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);
export const IconGear = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
  </svg>
);
export const IconDoc = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5M10 14.5l1.8 1.8 3.2-3.3" />
  </svg>
);
export const IconLink = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);
export const IconArrowUpRight = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const IconChevron = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const IconCollapse = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 5v14M20 12H9M13 8l-4 4 4 4" />
  </svg>
);
export const IconChip = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
  </svg>
);
export const IconUsb = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="8" y="2.5" width="8" height="7" rx="1" />
    <path d="M7 9.5h10v7a5 5 0 0 1-10 0z" />
  </svg>
);
export const IconLayers = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m12 3 9 5-9 5-9-5z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);
export const IconCube = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4z" />
    <path d="m4 7.4 8 4.6 8-4.6M12 12v9.2" />
  </svg>
);
export const IconStar = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
);
export const IconX = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
