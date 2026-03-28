import assert from "node:assert/strict";
import test from "node:test";
import { getWaitlistFormContainerClasses } from "@/components/WaitlistRequestForm";
import {
  WAITLIST_BENEFITS,
  WAITLIST_CTA_SUPPORT_COPY,
  WAITLIST_FORM_TITLE,
  WAITLIST_HIGHLIGHTS,
  WAITLIST_HERO_TITLE,
  WAITLIST_LOGIN_LINK_LABEL,
  WAITLIST_META_DESCRIPTION,
  WAITLIST_PAGE_TITLE,
  WAITLIST_PREVIEW_IMAGE_PATH,
  getPublicAppUrl,
  getWaitlistPageUrl,
  getWaitlistPreviewImageUrl,
} from "@/pages/waitlist";

test("waitlist page exposes stable marketing content blocks", () => {
  assert.equal(WAITLIST_BENEFITS.length, 3);
  assert.equal(WAITLIST_HIGHLIGHTS.length, 3);
  assert.equal(WAITLIST_BENEFITS[0]?.title, "Pflege ohne Notizchaos");
});

test("waitlist page exports stable seo and cta copy", () => {
  assert.equal(WAITLIST_PAGE_TITLE, "Bonsai Tracker Warteliste");
  assert.match(WAITLIST_META_DESCRIPTION, /Bonsai Tracker/);
  assert.equal(WAITLIST_FORM_TITLE, "Trag dich jetzt fuer den Launch ein");
  assert.equal(WAITLIST_LOGIN_LINK_LABEL, "Schon Beta-Zugang? Zum Login");
  assert.match(WAITLIST_HERO_TITLE, /Bonsai/);
  assert.match(WAITLIST_CTA_SUPPORT_COPY, /Kostenlos/);
});

test("shared waitlist form exposes distinct feature styling classes", () => {
  assert.equal(getWaitlistFormContainerClasses("embedded"), "waitlist-form space-y-4");
  assert.equal(getWaitlistFormContainerClasses("feature"), "waitlist-form waitlist-form--feature space-y-4");
});

test("waitlist metadata helpers build absolute urls with fallback", () => {
  assert.equal(getPublicAppUrl(), "http://localhost:3000");
  assert.equal(getWaitlistPageUrl(), "http://localhost:3000/waitlist");
  assert.equal(WAITLIST_PREVIEW_IMAGE_PATH, "/waitlist-preview.svg");
  assert.equal(getWaitlistPreviewImageUrl(), "http://localhost:3000/waitlist-preview.svg");
});
