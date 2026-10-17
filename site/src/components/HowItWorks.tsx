const steps = [
  {
    title: "Verify your address on the Ledger",
    body: "Connect a Ledger Flex over WebHID in desktop Chrome. The EVM address is derived and confirmed on the device screen.",
  },
  {
    title: "Authorize one scoped session",
    body: "Your Ledger is the owner of a ZeroDev Kernel smart account. You sign one approval for a session key: one token, one recipient, a per-call cap and an expiry.",
  },
  {
    title: "Your agent asks Ledpay to pay",
    body: "Through PayBox, the agent calls ledpay_session_send. The executor submits an ERC-4337 UserOp with the session key. No second Ledger prompt.",
  },
  {
    title: "The chain enforces the answer",
    body: "Over-limit, wrong-recipient, expired or revoked requests fail in on-chain validation, not only in backend checks.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.03em] md:text-[40px]">How it works</h2>
            <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-slate">
              One Ledger approval up front. After that, every payment is checked against the permission you signed.
            </p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-7 md:grid-cols-[3.5rem_1fr]">
                <span className="font-mono text-[14px] text-cobalt tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-[19px] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-slate">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
