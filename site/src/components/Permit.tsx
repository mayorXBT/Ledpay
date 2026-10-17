const scope = [
  ["Token", "USDC, Base Sepolia"],
  ["Call", "ERC-20 transfer only"],
  ["Recipient", "0x1111…1111"],
  ["Per call", "≤ 1 USDC"],
  ["Native value", "0"],
  ["Expires", "1 hour"],
] as const;

const requests = [
  { amount: "1.000000", to: "0x1111…1111", ok: true, note: "Mined" },
  { amount: "1.000001", to: "0x1111…1111", ok: false, note: "Reverted: over limit" },
  { amount: "1.000000", to: "0x2222…2222", ok: false, note: "Reverted: wrong recipient" },
];

/** Dark media panel standing in for the template's hero image: the signed session permission. */
export function Permit() {
  return (
    <figure className="m-0">
      <div
        className="relative overflow-hidden rounded-lg bg-panel p-5 text-white md:p-8"
        aria-label="Example Ledpay session permission and agent requests"
        role="img"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 [background:repeating-linear-gradient(115deg,transparent_0_14px,rgba(255,255,255,0.045)_14px_15px)] [mask-image:radial-gradient(120%_90%_at_100%_0%,#000_20%,transparent_75%)]"
        />
        <div className="relative grid gap-8 md:grid-cols-[1fr_1fr] md:gap-10">
          <div>
            <p className="text-[12px] font-medium uppercase text-white/55">Session permission</p>
            <p className="mt-1 text-[18px] font-bold uppercase leading-6">Signed once on Ledger Flex</p>
            <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {scope.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2 text-[13px]">
                  <dt className="text-white/60">{k}</dt>
                  <dd className="font-mono text-[12px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:pt-[52px]">
            <p className="text-[12px] font-medium uppercase text-white/55">
              Agent requests{" · "}
              <span className="font-mono normal-case">ledpay_session_send</span>
            </p>
            <ul className="mt-3 space-y-2">
              {requests.map((r) => (
                <li key={`${r.amount}-${r.to}`} className="rounded-lg border border-white/10 px-3 py-2.5">
                  <p className="font-mono text-[12px] tabular-nums">
                    {r.amount} USDC <span className="text-white/50">→ {r.to}</span>
                  </p>
                  <p className={`mt-0.5 text-[12px] font-medium uppercase ${r.ok ? "text-white" : "text-signal"}`}>
                    {r.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[12px] leading-5 text-mute">
        Scope of the permission signed on a Ledger Flex in the repo&rsquo;s Base Sepolia run. The rejected cases come
        from its on-chain fork tests.
      </figcaption>
    </figure>
  );
}
