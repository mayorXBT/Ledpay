export type DeviceActionState<T> = {
  status: string;
  output?: T;
  error?: unknown;
  intermediateValue?: { requiredUserInteraction?: string };
};

export type DeviceAction<T> = {
  observable: {
    subscribe: (observer: {
      next: (state: DeviceActionState<T>) => void;
      error: (error: unknown) => void;
    }) => { unsubscribe: () => void };
  };
};

const INTERACTION_HINT: Record<string, string> = {
  "confirm-open-app": "On the Flex: approve opening the Ethereum app.",
  "verify-address": "On the Flex: confirm the Ethereum address.",
  "unlock-device": "Unlock the Ledger, then open the Ethereum app.",
  "allow-secure-connection": "On the Flex: allow the secure connection.",
  "sign-typed-data": "On the Flex: approve the EIP-712 Kernel authorization.",
  "sign-personal-message": "On the Flex: approve the Kernel owner message.",
};

const HID_ERROR_RULES: Array<{ test: (raw: string) => boolean; message: string }> = [
  {
    test: (raw) =>
      raw.includes("user gesture") ||
      raw.includes("notallowederror") ||
      raw.includes("securityerror"),
    message:
      "Chrome blocked the HID prompt. Click Connect again and stay on this tab.",
  },
  {
    test: (raw) => raw.includes("no selected device") || raw.includes("no device was selected"),
    message:
      "No Ledger was selected. Chrome opens the picker at the TOP of this tab, not inside the page. If the list is empty, quit Ledger Live, unplug and replug the Flex, open the Ethereum app, then click Connect.",
  },
  {
    test: (raw) => raw.includes("timeout"),
    message:
      "Timed out waiting for Chrome or the Flex. Look at the TOP of this Chrome tab for a device list, and at the Flex screen for a prompt. Quit Ledger Live if it is open.",
  },
  {
    test: (raw) =>
      raw.includes("opening") ||
      raw.includes("access denied") ||
      raw.includes("cannot open") ||
      raw.includes("failed to open"),
    message:
      "Chrome cannot open the Ledger HID device. Quit Ledger Live and any other app using the Flex, then unplug, replug, and click Connect.",
  },
];

export function interactionHint(kind: string | undefined): string | undefined {
  if (!kind || kind === "none") return undefined;
  return INTERACTION_HINT[kind] ?? `On the Flex: ${kind.replaceAll("-", " ")}.`;
}

function describeDeviceError(error: unknown, depth = 0): string {
  if (depth > 4) return "";
  if (error instanceof Error) {
    const extra = error as Error & { _tag?: unknown; errorCode?: unknown };
    const parts = [error.message].filter(Boolean);
    if (typeof extra._tag === "string" && extra._tag && !parts[0]?.includes(extra._tag)) {
      parts.push(extra._tag);
    }
    if (extra.errorCode != null) parts.push(String(extra.errorCode));
    return parts.filter(Boolean).join(" ") || error.name;
  }
  if (error && typeof error === "object") {
    const rec = error as {
      _tag?: unknown;
      message?: unknown;
      errorCode?: unknown;
      originalError?: unknown;
    };
    const parts: string[] = [];
    if (typeof rec._tag === "string") parts.push(rec._tag);
    if (typeof rec.message === "string" && rec.message) parts.push(rec.message);
    if (rec.errorCode != null) parts.push(String(rec.errorCode));
    if (rec.originalError != null) {
      const nested = describeDeviceError(rec.originalError, depth + 1);
      if (nested) parts.push(nested);
    }
    if (parts.length) return parts.join(" ");
    try {
      const json = JSON.stringify(error);
      if (json && json !== "{}") return json;
    } catch {
      /* circular */
    }
  }
  const fallback = String(error);
  return fallback === "[object Object]" ? "unknown device error" : fallback;
}

export function formatDeviceError(error: unknown, label?: string): string {
  const detail = describeDeviceError(error);
  const tagged = typeof error === "object" && error !== null
    ? (error as { _tag?: unknown })._tag
    : undefined;
  const code = typeof error === "object" && error !== null
    ? String((error as { errorCode?: unknown }).errorCode ?? "")
    : "";
  let hint = detail;
  if (code === "6502" || detail.toLowerCase().includes("chainid conversion")) {
    hint = `${detail}. Address verify no longer sends a chain ID. Refresh and click Connect once.`;
  } else if (tagged === "DeviceBusyError" || detail.includes("DeviceBusyError")) {
    hint = `${detail}. Unplug and replug the Flex, then click Connect.`;
  }
  return label ? `${label}: ${hint}` : hint;
}

export function hidErrorMessage(error: unknown): string {
  const raw = `${error instanceof Error ? `${error.name}: ${error.message}` : formatDeviceError(error)}`.toLowerCase();
  return HID_ERROR_RULES.find((rule) => rule.test(raw))?.message
    ?? formatDeviceError(error);
}

export function waitForAction<T>(
  action: DeviceAction<T>,
  label: string,
  log?: (line: string) => void,
  timeoutMs = 120_000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      finish(() => reject(new Error(`${label}: timeout`)));
    }, timeoutMs);

    const sub = action.observable.subscribe({
      next: (state) => {
        const status = String(state.status).toLowerCase();
        if (status === "pending") {
          const hint = interactionHint(state.intermediateValue?.requiredUserInteraction);
          if (hint) log?.(hint);
          return;
        }
        if (status === "completed") {
          finish(() => {
            if (state.output === undefined) reject(new Error(`${label}: empty device output`));
            else resolve(state.output);
          });
          return;
        }
        if (status === "error") {
          finish(() => reject(new Error(formatDeviceError(state.error, label))));
          return;
        }
        if (status === "stopped") {
          finish(() => reject(new Error(`${label}: cancelled on device`)));
        }
      },
      error: (error) => {
        finish(() => reject(new Error(formatDeviceError(error, label))));
      },
    });

    function finish(done: () => void) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      sub.unsubscribe();
      done();
    }
  });
}
