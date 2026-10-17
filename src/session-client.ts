const TIMEOUT_MS = 4_000;

export type SessionView = {
  status: string;
  ownerAddress: string | null;
  kernelAddress: string | null;
  sessionKeyAddress: string | null;
  token: string | null;
  policy: Record<string, unknown> | null;
  signingModel: string;
};

function executorUrl() {
  return process.env.LEDPAY_EXECUTOR_URL?.replace(/\/$/, "") ?? "";
}

export function onboardUrl() {
  return process.env.LEDPAY_ONBOARD_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:5173";
}

export async function fetchExecutor(path: string, init?: RequestInit) {
  const base = executorUrl();
  if (!base) {
    return {
      ok: false as const,
      status: 0,
      body: {
        error: "awaiting_setup",
        message: "LEDPAY_EXECUTOR_URL is not set. Complete Ledger onboarding, then configure the executor host in PayBox.",
      },
    };
  }
  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "error",
      headers: { accept: "application/json", "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    const body = await response.json() as Record<string, unknown>;
    return { ok: response.ok, status: response.status, body };
  } catch {
    return {
      ok: false as const,
      status: 0,
      body: {
        error: "executor_unreachable",
        message: "Ledpay executor did not respond within 4s. Check LEDPAY_EXECUTOR_URL and network hosts.",
      },
    };
  }
}

export function executorConfigured() {
  return executorUrl().length > 0;
}
