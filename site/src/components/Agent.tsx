import { Reveal } from "../reveal";
import { IconCheck, IconPlusCircle, IconDoc, IconReceipt } from "./icons";

type Ghost = { title: string; id: string; tags: [string, "pink" | "orange" | "grey"][] };

const COLS: Ghost[][] = [
  [
    { title: "Get Ledpay spending policy", id: "#get_policy", tags: [["Policy", "orange"], ["Read", "grey"]] },
    { title: "Check a payment against policy", id: "#check_payment", tags: [["Policy", "orange"], ["Check", "pink"]] },
    { title: "Propose a Base USDC transfer", id: "#send_usdc", tags: [["Proposal", "pink"], ["Sample", "grey"]] },
    { title: "Get PayBox setup instructions", id: "#get_setup", tags: [["Setup", "orange"], ["Read", "grey"]] },
  ],
  [
    { title: "Get the Ledger onboarding URL", id: "#get_setup_link", tags: [["Ledger", "pink"], ["Onboard", "orange"]] },
    { title: "Get the Ledger-owned Kernel session", id: "#get_session", tags: [["Kernel", "pink"], ["Session", "orange"]] },
  ],
  [
    { title: "Send via the Kernel session key", id: "#session_send", tags: [["UserOp", "pink"], ["Session", "orange"]] },
    { title: "Get the session transaction", id: "#get_transaction", tags: [["Receipt", "orange"], ["Read", "grey"]] },
    { title: "Check a payment against policy", id: "#check_payment", tags: [["Policy", "orange"], ["Check", "pink"]] },
    { title: "Get Ledpay spending policy", id: "#get_policy", tags: [["Policy", "orange"], ["Read", "grey"]] },
  ],
];

const FEATURES = [
  { title: "Check before it pays", text: "ledpay_check_payment tests an amount and recipient against the policy first." },
  { title: "Pay inside the session", text: "ledpay_session_send submits a USDC transfer through the Kernel session key." },
  { title: "Read the session", text: "ledpay_get_session shows the Ledger-owned Kernel and the session it carries." },
  { title: "Fetch the receipt", text: "ledpay_get_transaction returns a sanitized UserOp receipt by request id." },
];

const tagCls = {
  pink: "bg-[rgba(236,72,153,0.1)] text-[#db2777]",
  orange: "bg-[rgba(226,107,8,0.1)] text-[#e26b08]",
  grey: "bg-white/[0.05] text-[#a1a1a1]",
};

function GhostCard({ g }: { g: Ghost }) {
  return (
    <div className="w-[350px] rounded-[16px] border border-white/[0.05] bg-[#0f0f0f] p-6">
      <p className="text-[18px] font-medium leading-[1.25] text-[#d4d4d4]">{g.title}</p>
      <div className="mt-4 flex gap-2 text-[11px]">
        <span className="rounded-[164px] bg-white/[0.05] px-2.5 py-1 font-mono text-[#737373]">{g.id}</span>
        {g.tags.map(([t, tone]) => (
          <span key={t} className={`rounded-[164px] px-2.5 py-1 ${tagCls[tone]}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-[13px] text-[#737373]">
        <span className="grid size-10 place-items-center rounded-full border border-dashed border-white/15">
          <IconPlusCircle className="size-5" />
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <IconDoc className="size-5" /> 1
          </span>
          <span className="flex items-center gap-1">
            <IconReceipt className="size-5" /> 0
          </span>
        </span>
      </div>
    </div>
  );
}

export function Agent() {
  return (
    <section className="relative bg-night pt-[100px] md:pt-[256px]">
      <div className="relative mx-auto max-w-[1280px] px-4 md:px-16">
        {/* floating, blurred tool cards (template: AI task cards) */}
        <div aria-hidden="true" className="relative mx-auto h-[420px] max-w-[1070px] overflow-hidden md:h-[690px]">
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-[10px]">
            {COLS.map((col, ci) => (
              <div
                key={ci}
                className={`flex flex-col gap-[28px] ${ci === 1 ? "-mt-[108px] pt-[50px]" : ci === 0 ? "mt-[52px]" : "-mt-[32px]"} ${ci === 1 ? "opacity-80 blur-[1px]" : "opacity-55 blur-[2.5px]"}`}
              >
                {col.map((g, i) => (
                  <GhostCard key={`${g.id}-${i}`} g={g} />
                ))}
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_45%,rgba(10,10,10,0.1)_0%,rgba(10,10,10,0.7)_70%,#0a0a0a_100%)]" />
          {/* gradient-border action button */}
          <div className="absolute left-1/2 top-[45%] w-[300px] -translate-x-1/2 -translate-y-1/2 md:top-[296px] md:w-[350px] md:translate-y-0">
            <div className="spin-border rounded-[20px] p-[2px] shadow-[0_0_40px_rgba(255,98,7,0.35),0_0_80px_rgba(219,39,119,0.18)]">
              <div className="relative overflow-hidden rounded-[18px] bg-[#0a0a0a] p-3">
                <div className="relative flex h-[56px] items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#151515]">
                  <span className="wipe absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  <IconPlusCircle className="relative size-6 text-[#d4d4d4]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mt-[60px] text-center md:-mt-[156px]">
          <Reveal as="h2" className="text-[36px] font-semibold leading-[36px] md:text-[48px] md:leading-[48px]">
            Say hello to <br className="md:hidden" />
            <span className="grad-text">the Ledpay plugin</span>
          </Reveal>
          <Reveal as="p" delay={80} className="mx-auto mt-4 max-w-[640px] text-[16px] leading-[22.4px] text-mute md:mt-5 md:text-[20px] md:leading-[28px]">
            Agents find it in the PayBox marketplace and call its tools. The chain does the rest.
          </Reveal>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-[60px] md:grid-cols-4 md:gap-8">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 70} className="flex flex-col items-center text-center">
              <span className="icon-tile grid size-12 place-items-center rounded-[12px] text-orange">
                <IconCheck className="size-4" strokeWidth={2} />
              </span>
              <h3 className="mt-6 text-[16px] font-medium leading-[20px] md:text-[18px] md:leading-[21.6px]">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-[19.6px] text-mute">{f.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
