import type { CSSProperties } from "react";
import { CheckCircleIcon, XCircleIcon, SealCheckIcon } from "@phosphor-icons/react";

const scope = [
  { k: "Token", v: "USDC, Base Sepolia" },
  { k: "Call", v: "ERC-20 transfer only" },
  { k: "Recipient", v: "0x1111…1111" },
  { k: "Per call", v: "≤ 1 USDC" },
  { k: "Native value", v: "0" },
  { k: "Expires", v: "1 hour" },
];

type Req = { amount: string; to: string; ok: boolean; note: string };

const requests: Req[] = [
  { amount: "1.000000", to: "0x1111…1111", ok: true, note: "Mined" },
  { amount: "1.000001", to: "0x1111…1111", ok: false, note: "Over limit" },
  { amount: "1.000000", to: "0x2222…2222", ok: false, note: "Wrong recipient" },
];

export function Permit() {
  return (
    <figure className="relative w-full max-w-[460px]" aria-label="Example Ledpay session permission and agent requests">
      <div
        className="rise rounded-[22px] bg-paper p-6 ring-1 ring-line shadow-[0_24px_48px_-28px_rgba(20,24,31,0.35)] md:p-7"
        style={{ "--i": 0 } as CSSProperties}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-mute">Session permission</p>
            <p className="mt-0.5 text-[17px] font-semibold tracking-tight">Signed once on Ledger Flex</p>
          </div>
          <SealCheckIcon size={26} weight="regular" className="shrink-0 text-cobalt" aria-hidden="true" />
        </div>

        <dl className="mt-5 divide-y divide-line border-y border-line">
          {scope.map((row, i) => (
            <div
              key={row.k}
              className="rise flex items-center justify-between gap-4 py-2.5 text-[14px]"
              style={{ "--i": i + 1 } as CSSProperties}
            >
              <dt className="text-slate">{row.k}</dt>
              <dd className="font-mono text-[13px] text-ink">{row.v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 flex items-center gap-2 text-[13px] text-mute">
          <span className="breathe inline-block size-1.5 rounded-full bg-allow" aria-hidden="true" />
          Agent requests via <span className="font-mono text-[12px] text-slate">ledpay_session_send</span>
        </p>

        <ul className="mt-3 space-y-2">
          {requests.map((r, i) => (
            <li
              key={`${r.amount}-${r.to}`}
              className="rise grid grid-cols-[18px_1fr] items-center gap-x-3 gap-y-0.5 rounded-xl bg-fog px-3 py-2.5 text-[13px] sm:grid-cols-[18px_auto_1fr]"
              style={{ "--i": i + 8 } as CSSProperties}
            >
              {r.ok ? (
                <CheckCircleIcon size={18} weight="regular" className="text-allow" aria-hidden="true" />
              ) : (
                <XCircleIcon size={18} weight="regular" className="text-deny" aria-hidden="true" />
              )}
              <span className="font-mono tabular-nums text-ink">
                {r.amount} <span className="text-mute">→ {r.to}</span>
              </span>
              <span
                className={`col-start-2 font-medium sm:col-start-3 sm:text-right ${r.ok ? "text-allow" : "text-deny"}`}
              >
                {r.ok ? r.note : `Reverted: ${r.note.toLowerCase()}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-3 px-1 text-[12px] leading-relaxed text-mute">
        Scope of the permission signed on a Ledger Flex in the repo&rsquo;s Base Sepolia run. The rejected
        cases come from its on-chain fork tests.
      </figcaption>
    </figure>
  );
}
