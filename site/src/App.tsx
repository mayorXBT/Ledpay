import type { ReactNode } from "react";
import { Header } from "./components/Header";
import { Entry, Sub, Title } from "./components/Entry";
import { Permit } from "./components/Permit";
import { Footer } from "./components/Footer";
import { useReveal } from "./useReveal";
import { LIVE_TX_URL, ONBOARD_URL, REPO_URL, STATUS_URL, THREAT_MODEL_URL } from "./links";

type Item = { lead: string; body: ReactNode };

function Items({ items, ordered = false }: { items: Item[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`prose-acc mt-4 space-y-2 pl-6 ${ordered ? "list-decimal" : "list-disc"} marker:text-ink`}>
      {items.map((it) => (
        <li key={it.lead} className="pl-1">
          <strong className="font-bold">{it.lead}</strong>: {it.body}
        </li>
      ))}
    </List>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[0.85em]">{children}</code>;
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium underline decoration-signal decoration-1 underline-offset-4 transition-colors duration-300 ease-[var(--ease-framer)] hover:text-signal"
    >
      {children}
    </a>
  );
}

const steps: Item[] = [
  {
    lead: "Verify your address on the Ledger",
    body: "connect a Ledger Flex over WebHID in desktop Chrome. The EVM address is derived and confirmed on the device screen.",
  },
  {
    lead: "Authorize one scoped session",
    body: "your Ledger is the owner of a ZeroDev Kernel smart account. You sign one approval for a session key: one token, one recipient, a per-call cap and an expiry.",
  },
  {
    lead: "Your agent asks Ledpay to pay",
    body: (
      <>
        through PayBox, the agent calls <Code>ledpay_session_send</Code>. The executor submits an ERC-4337 UserOp with
        the session key. No second Ledger prompt.
      </>
    ),
  },
  {
    lead: "The chain enforces the answer",
    body: "over-limit, wrong-recipient, expired or revoked requests fail in on-chain validation, not only in backend checks.",
  },
];

const pinned: Item[] = [
  { lead: "Call", body: "ERC-20 transfer only. No approve, transferFrom or delegatecall." },
  { lead: "Recipient", body: "one allowlisted address." },
  { lead: "Amount", body: "a per-call cap, with a native value limit of 0." },
  { lead: "Time", body: "a timestamp expiry on the session." },
];

const more: Item[] = [
  {
    lead: "Revoke from the Ledger",
    body: "the Ledger stays the owner of the account, so it can uninstall the permission. In the repo's fork tests, a replay after revoke and a send after expiry both revert.",
  },
  {
    lead: "Funds stay separate",
    body: "agent spend comes from the Kernel smart account you fund, not from the balance on your Ledger address.",
  },
  {
    lead: "Built as a PayBox plugin",
    body: "agents find Ledpay in the PayBox marketplace and call its tools. Ledger onboarding runs in a separate Chromium app, because WebHID can't run in the plugin sandbox.",
  },
];

const tools = [
  "ledpay_get_setup_link",
  "ledpay_get_session",
  "ledpay_session_send",
  "ledpay_get_transaction",
  "ledpay_get_policy",
  "ledpay_check_payment",
  "ledpay_send_usdc",
  "ledpay_get_setup",
];

const guarantees: Item[] = [
  { lead: "Keys", body: "the agent and the executor never receive your Ledger private key or seed." },
  { lead: "Secrets", body: "the plugin never accepts, stores or logs private keys, seeds or PayBox secrets." },
  { lead: "Authority", body: "the session key can't change the account owner, edit policies or grant new rights." },
  { lead: "Fail closed", body: "an invalid spending cap falls back to 0." },
  { lead: "No proposal", body: "over-limit or non-allowlisted requests return an error with no transaction proposal." },
];

const limits: Item[] = [
  { lead: "Testnet only", body: "no mainnet transactions or authorizations have been sent." },
  {
    lead: "Identity",
    body: "PayBox doesn't yet pass an authenticated user identity, so multi-tenant binding is unsupported.",
  },
  { lead: "Transaction Checks", body: "omitted until Ledger issues an origin token." },
];

export default function App() {
  useReveal();
  return (
    <>
      <a
        href="#how"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="top" className="pt-4 pb-10 md:pt-6 md:pb-16">
        <Entry id="intro" label="Oct 17, 2026" tags={["Testnet", "0.1.0"]}>
          <Permit />
          <div className="mt-8">
            <Title as="h1">Your agent pays. Your Ledger sets the limits.</Title>
            <p className="prose-acc mt-5">
              Authorize once on your Ledger, and Ledpay gives your AI agent a narrowly scoped session key on a
              Ledger-owned smart account. The limits are enforced on-chain. The agent never receives your Ledger private
              key.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={REPO_URL} className="btn-signal">
                View the code on GitHub
              </a>
              <a href={ONBOARD_URL} className="btn-line">
                Onboarding guide
              </a>
            </div>
          </div>
        </Entry>

        <Entry id="how" label="How it works" tags={["4 steps"]}>
          <Title>One Ledger approval, then bounded spend</Title>
          <p className="prose-acc mt-4">
            One Ledger approval up front. After that, every payment is checked against the permission you signed.
          </p>
          <Items items={steps} ordered />
        </Entry>

        <Entry id="features" label="Features" tags={["On-chain", "PayBox"]}>
          <Title>Spending power with hard edges</Title>
          <p className="prose-acc mt-4">
            The session permission is a ZeroDev Kernel policy. If a request falls outside it, the UserOp fails validation
            on-chain.
          </p>
          <Sub>What the permission pins:</Sub>
          <Items items={pinned} />
          <Sub>What else you get:</Sub>
          <Items items={more} />
          <Sub>Plugin tools:</Sub>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Ledpay tools">
            {tools.map((t) => (
              <li key={t} className="rounded-lg border border-rule bg-[#fafafa] px-2.5 py-1 font-mono text-[12px] text-ink-2">
                {t}
              </li>
            ))}
          </ul>
        </Entry>

        <Entry id="security" label="Security" tags={["Threat model", "Base Sepolia"]}>
          <Title>What the agent can&rsquo;t do</Title>
          <Items items={guarantees} />
          <Sub>Proof on Base Sepolia:</Sub>
          <p className="prose-acc mt-4">
            A 1 USDC payment from a Ledger-owned Kernel, with no second prompt on the Flex:{" "}
            <TextLink href={LIVE_TX_URL}>
              <span className="font-mono text-[0.85em]">tx 0x64972168…0185</span>
            </TextLink>
            .
          </p>
          <Sub>Honest limits:</Sub>
          <Items items={limits} />
          <p className="prose-acc mt-6">
            Read the <TextLink href={THREAT_MODEL_URL}>threat model</TextLink> and the{" "}
            <TextLink href={STATUS_URL}>full status and evidence</TextLink>.
          </p>
        </Entry>
      </main>
      <Footer />
    </>
  );
}
