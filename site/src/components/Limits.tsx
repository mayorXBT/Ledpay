import { STATUS_URL, THREAT_MODEL_URL, LIVE_TX_URL } from "../links";
import { Reveal } from "../reveal";
import { SectionTitle } from "./Features";
import { IconCheck, IconDoc, IconShield, IconX } from "./icons";

type Quote = { kind: "quote"; text: string; source: string; file: string; href: string };
type Stat = { kind: "stat"; value: string; label: string; foot: string; href: string; hot?: boolean };
type Score = { kind: "score" };
type Item = Quote | Stat | Score;

const TM = { file: "docs/THREAT_MODEL.md", href: THREAT_MODEL_URL, source: "Threat model" };
const P0 = { file: "docs/P0_STATUS.md", href: STATUS_URL, source: "P0 status" };

const COLUMNS: Item[][] = [
  [
    { kind: "score" },
    { kind: "quote", text: "The agent never receives the Ledger private key.", source: "README", file: "README.md", href: "https://github.com/mayorXBT/ledpay#readme" },
    { kind: "quote", text: "No mainnet ETH value is sent (value is always 0).", ...TM },
  ],
  [
    { kind: "quote", text: "Plugin never accepts, stores, or logs private keys, seeds, or PayBox secrets.", ...TM },
    {
      kind: "quote",
      text: "Calldata is ERC-20 transfer only: no approve, transferFrom, delegatecall, or arbitrary to.",
      ...TM,
    },
    { kind: "quote", text: "Invalid LEDPAY_MAX_AMOUNT_USDC fails closed to a 0 cap.", ...TM },
  ],
  [
    {
      kind: "quote",
      text: "Over-limit amounts and non-allowlisted recipients return isError with no transaction proposal.",
      ...TM,
    },
    {
      kind: "quote",
      text: "Over-limit and wrong recipient UserOps mined in handleOps with UserOperationEvent.success = false.",
      ...P0,
    },
    { kind: "quote", text: "A proposal is not a receipt. Retry only after checking the PayBox request status.", ...TM },
  ],
  [
    { kind: "quote", text: "Sudo uninstallPlugin then replay reverted. Expired validUntil session reverted.", ...P0 },
    { kind: "stat", value: "1 USDC", label: "Live payment, no second Ledger prompt", foot: "Base Sepolia tx", href: LIVE_TX_URL, hot: true },
    { kind: "stat", value: "0", label: "Mainnet transactions sent", foot: "Testnet only", href: STATUS_URL },
    { kind: "quote", text: "Ledger Agent Intent is a per-transaction human-approval product. Ledpay does not use it for autonomous spend.", source: "README", file: "README.md", href: "https://github.com/mayorXBT/ledpay#readme" },
  ],
];

const CHECKS = ["Over limit", "Wrong recipient", "Replay after revoke", "Expired"];

function ScoreCard() {
  return (
    <div className="card relative overflow-hidden p-6">
      <div className="flex items-start justify-between">
        <p className="text-[40px] font-medium leading-[40px]">
          6<span className="ml-1 align-top text-[20px] text-[#a1a1a1]">/6</span>
        </p>
        <span className="flex gap-0.5 text-orange" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <IconCheck key={i} className="size-4" strokeWidth={2.6} />
          ))}
        </span>
      </div>
      <div className="mt-[64px] flex flex-wrap gap-1.5">
        {CHECKS.map((c) => (
          <span key={c} className="flex items-center gap-1 rounded-[8px] border border-white/[0.06] bg-[#171717] px-2 py-1 text-[11px] text-[#d4d4d4]">
            <IconX className="size-3 text-[#f472b6]" strokeWidth={2.4} />
            {c}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[14px] font-medium">Fork test cases pass</p>
      <p className="text-[13px] text-[#a1a1a1]">on a Base Sepolia fork, including these reverts</p>
      <a
        href={STATUS_URL}
        className="press mt-6 flex h-[40px] items-center justify-center rounded-[8px] bg-[#171717] text-[14px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-[#262626]"
      >
        Read the test results
      </a>
    </div>
  );
}

function QuoteCard({ q }: { q: Quote }) {
  return (
    <figure className="card group relative overflow-hidden p-6 transition-colors duration-400 hover:border-white/[0.12]">
      <blockquote className="text-[16px] leading-[25.6px] text-[#d4d4d4]">{q.text}</blockquote>
      <figcaption className="mt-8 flex items-end justify-between">
        <div>
          <a href={q.href} className="text-[16px] font-medium text-white hover:text-orange">
            {q.source}
          </a>
          <p className="font-mono text-[12px] text-[#a1a1a1]">{q.file}</p>
        </div>
        <span className="grid size-[42px] place-items-center rounded-[10px] bg-gradient-to-b from-[#262626] to-[#141414] text-[#d4d4d4] ring-1 ring-white/[0.06]">
          {q.source === "Threat model" ? <IconShield className="size-5" /> : <IconDoc className="size-5" />}
        </span>
      </figcaption>
    </figure>
  );
}

function StatCard({ s }: { s: Stat }) {
  return (
    <a
      href={s.href}
      className={`block overflow-hidden rounded-[16px] p-6 ${s.hot ? "bg-[linear-gradient(135deg,#ff7e17_0%,#f94500_40%,#ce3000_100%)]" : "card bg-[linear-gradient(180deg,#262626_0%,#0f0f0f_100%)]"}`}
    >
      <p className="text-[40px] font-medium leading-[40px]">{s.value}</p>
      <p className={`mt-2 text-[15px] font-medium ${s.hot ? "text-peach" : "text-[#e5e5e5]"}`}>{s.label}</p>
      <p className={`mt-8 text-[13px] font-medium ${s.hot ? "text-peach/80" : "text-[#a1a1a1]"}`}>{s.foot} ↗</p>
    </a>
  );
}

export function Limits() {
  return (
    <section id="limits" className="bg-night pt-[120px] md:pt-[256px]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <SectionTitle
          title={
            <>
              What the agent can't do,
              <br className="hidden md:block" /> straight from the repo
            </>
          }
          sub="Each card quotes the threat model, the README or the recorded test run."
        />
        <div className="relative mt-10 md:mt-[80px]">
          <div className="grid gap-3 md:grid-cols-4">
            {COLUMNS.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-3">
                {col.map((item, i) => (
                  <Reveal key={i} delay={ci * 60 + i * 50}>
                    {item.kind === "score" ? <ScoreCard /> : item.kind === "stat" ? <StatCard s={item} /> : <QuoteCard q={item} />}
                  </Reveal>
                ))}
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-night via-night/70 to-transparent md:h-[286px]" />
        </div>
      </div>
    </section>
  );
}
