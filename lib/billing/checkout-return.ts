export type CheckoutQuery = Record<string, string | string[] | undefined>;

export function stripCheckoutParams(query: CheckoutQuery): CheckoutQuery {
  const { checkout: _checkout, session_id: _sessionId, ...remaining } = query;
  return remaining;
}

interface EntitlementPollerOptions<TTimer> {
  checkAccess: () => Promise<boolean>;
  isVisible: () => boolean;
  now?: () => number;
  setTimer?: (callback: () => void, delayMs: number) => TTimer;
  clearTimer?: (timer: TTimer) => void;
  onActive: () => void;
  onTimeout: () => void;
  intervalMs?: number;
  maxActiveMs?: number;
}

export interface EntitlementPoller {
  start: () => void;
  retry: () => void;
  stop: () => void;
  handleVisibilityChange: () => void;
}

export function createEntitlementPoller<TTimer = ReturnType<typeof setTimeout>>({
  checkAccess,
  isVisible,
  now = Date.now,
  setTimer = ((callback, delay) => setTimeout(callback, delay)) as (callback: () => void, delayMs: number) => TTimer,
  clearTimer = ((timer) => clearTimeout(timer as ReturnType<typeof setTimeout>)) as (timer: TTimer) => void,
  onActive,
  onTimeout,
  intervalMs = 2_000,
  maxActiveMs = 30_000,
}: EntitlementPollerOptions<TTimer>): EntitlementPoller {
  let running = false;
  let inFlight = false;
  let hasChecked = false;
  let activeElapsed = 0;
  let visibleStartedAt: number | null = null;
  let lastCheckAtActive = 0;
  let timer: TTimer | null = null;

  const activeNow = () => activeElapsed + (visibleStartedAt === null ? 0 : Math.max(0, now() - visibleStartedAt));

  function cancelTimer() {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  }

  function finishVisiblePeriod() {
    if (visibleStartedAt !== null) {
      activeElapsed += Math.max(0, now() - visibleStartedAt);
      visibleStartedAt = null;
    }
  }

  function schedule() {
    cancelTimer();
    if (!running || inFlight || !isVisible()) return;
    if (visibleStartedAt === null) visibleStartedAt = now();
    const current = activeNow();
    const untilCheck = Math.max(0, intervalMs - (current - lastCheckAtActive));
    const untilTimeout = Math.max(0, maxActiveMs - current);
    timer = setTimer(() => {
      timer = null;
      if (!running || !isVisible()) {
        finishVisiblePeriod();
        return;
      }
      lastCheckAtActive = activeNow();
      void runCheck();
    }, Math.min(untilCheck, untilTimeout));
  }

  async function runCheck() {
    if (!running || inFlight) return;
    inFlight = true;
    hasChecked = true;
    try {
      if (await checkAccess()) {
        running = false;
        cancelTimer();
        onActive();
        return;
      }
    } finally {
      inFlight = false;
    }
    if (!running) return;
    if (activeNow() >= maxActiveMs) {
      running = false;
      cancelTimer();
      onTimeout();
      return;
    }
    schedule();
  }

  function start() {
    cancelTimer();
    running = true;
    inFlight = false;
    activeElapsed = 0;
    lastCheckAtActive = 0;
    hasChecked = false;
    visibleStartedAt = isVisible() ? now() : null;
    if (isVisible()) void runCheck();
  }

  function stop() {
    running = false;
    cancelTimer();
    finishVisiblePeriod();
  }

  function handleVisibilityChange() {
    if (!running) return;
    if (!isVisible()) {
      finishVisiblePeriod();
      cancelTimer();
      return;
    }
    if (visibleStartedAt === null) visibleStartedAt = now();
    if (!hasChecked) void runCheck();
    else schedule();
  }

  return { start, retry: start, stop, handleVisibilityChange };
}
