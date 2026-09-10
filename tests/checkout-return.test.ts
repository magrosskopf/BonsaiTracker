import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createEntitlementPoller, stripCheckoutParams } from "@/lib/billing/checkout-return";

class FakeClock {
  nowMs = 0;
  private nextId = 1;
  private timers = new Map<number, { at: number; callback: () => void }>();

  now = () => this.nowMs;
  setTimer = (callback: () => void, delay: number) => {
    const id = this.nextId++;
    this.timers.set(id, { at: this.nowMs + delay, callback });
    return id;
  };
  clearTimer = (id: number) => { this.timers.delete(id); };

  async advance(ms: number) {
    const target = this.nowMs + ms;
    while (true) {
      const next = [...this.timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > target) break;
      this.nowMs = next[1].at;
      this.timers.delete(next[0]);
      next[1].callback();
      await Promise.resolve();
      await Promise.resolve();
    }
    this.nowMs = target;
  }
}

test("checkout query cleanup preserves unrelated parameters", () => {
  assert.deepEqual(stripCheckoutParams({ checkout: "success", session_id: "cs_1", tab: "care", filter: ["a", "b"] }), {
    tab: "care",
    filter: ["a", "b"],
  });
});

test("entitlement polling checks immediately and every two active seconds", async () => {
  const clock = new FakeClock();
  let checks = 0;
  let active = 0;
  const poller = createEntitlementPoller({
    checkAccess: async () => ++checks >= 3,
    isVisible: () => true,
    now: clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    onActive: () => { active += 1; },
    onTimeout: () => assert.fail("must not time out"),
  });

  poller.start();
  await clock.advance(0);
  assert.equal(checks, 1);
  await clock.advance(1999);
  assert.equal(checks, 1);
  await clock.advance(2001);
  assert.equal(checks, 3);
  assert.equal(active, 1);
});

test("hidden browser time pauses checks and does not consume the thirty-second budget", async () => {
  const clock = new FakeClock();
  let visible = true;
  let checks = 0;
  let timedOut = 0;
  const poller = createEntitlementPoller({
    checkAccess: async () => { checks += 1; return false; },
    isVisible: () => visible,
    now: clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    onActive: () => assert.fail("must remain inactive"),
    onTimeout: () => { timedOut += 1; },
  });

  poller.start();
  await clock.advance(1000);
  visible = false;
  poller.handleVisibilityChange();
  await clock.advance(60_000);
  assert.equal(checks, 1);
  assert.equal(timedOut, 0);

  visible = true;
  poller.handleVisibilityChange();
  await clock.advance(29_000);
  assert.equal(timedOut, 1);
  assert.equal(checks, 16);
});

test("an initially hidden tab waits for the first visible foreground moment", async () => {
  const clock = new FakeClock();
  let visible = false;
  let checks = 0;
  const poller = createEntitlementPoller({
    checkAccess: async () => { checks += 1; return true; },
    isVisible: () => visible,
    now: clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    onActive: () => undefined,
    onTimeout: () => assert.fail("must not time out"),
  });
  poller.start();
  await clock.advance(60_000);
  assert.equal(checks, 0);
  visible = true;
  poller.handleVisibilityChange();
  await clock.advance(0);
  assert.equal(checks, 1);
});

test("manual retry starts a fresh immediate polling window", async () => {
  const clock = new FakeClock();
  let checks = 0;
  let timedOut = 0;
  const poller = createEntitlementPoller({
    checkAccess: async () => { checks += 1; return false; },
    isVisible: () => true,
    now: clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    onActive: () => undefined,
    onTimeout: () => { timedOut += 1; },
  });
  poller.start();
  await clock.advance(0);
  await clock.advance(30_000);
  assert.equal(timedOut, 1);
  poller.retry();
  await clock.advance(0);
  assert.equal(checks, 17);
});

test("a transient entitlement request error does not stop later checks", async () => {
  const clock = new FakeClock();
  let checks = 0;
  let active = 0;
  const poller = createEntitlementPoller({
    checkAccess: async () => {
      checks += 1;
      if (checks === 1) throw new Error("network unavailable");
      return true;
    },
    isVisible: () => true,
    now: clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    onActive: () => { active += 1; },
    onTimeout: () => assert.fail("must recover before timeout"),
  });
  poller.start();
  await clock.advance(0);
  await clock.advance(2_000);
  assert.equal(checks, 2);
  assert.equal(active, 1);
});

test("checkout verification failures transition safely and still clean the URL", () => {
  const source = readFileSync(join(process.cwd(), "components", "CheckoutReturnNotice.tsx"), "utf8");
  assert.match(source, /catch\s*\{/);
  assert.match(source, /finally\s*\{/);
  assert.match(source, /cleanUrl\(\)\.catch/);
});
