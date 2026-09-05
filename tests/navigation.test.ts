import assert from "node:assert/strict";
import test from "node:test";
import { getNavigationItemClassName, navigationItems, shouldHideNavigation } from "@/components/Navigation";

test("navigation keeps the existing five app destinations", () => {
  assert.equal(navigationItems.length, 5);
  assert.deepEqual(
    navigationItems.map((item) => item.href),
    ["/dashboard", "/feed", "/reminders", "/create-bonsai", "/profile"],
  );
});

test("navigation stays hidden for public routes and non-authenticated states", () => {
  assert.equal(shouldHideNavigation("/", "authenticated"), true);
  assert.equal(shouldHideNavigation("/dashboard", "unauthenticated"), true);
  assert.equal(shouldHideNavigation("/dashboard", "loading"), true);
  assert.equal(shouldHideNavigation("/dashboard", "authenticated"), false);
});

test("navigation item classes expose a distinct active treatment", () => {
  assert.equal(getNavigationItemClassName(false), "bonsai-dock__item");
  assert.equal(getNavigationItemClassName(true), "bonsai-dock__item bonsai-dock__item--active");
});
