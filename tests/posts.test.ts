import assert from "node:assert/strict";
import test from "node:test";
import { formatPostSnapshotMeta, normalizeSelectedImages, snapshotEntryReferenceIds } from "@/lib/posts";

test("normalizeSelectedImages keeps only available images and max 5 unique values", () => {
  assert.deepEqual(
    normalizeSelectedImages(
      ["/uploads/a.jpg", "/uploads/b.jpg", "/uploads/c.jpg", "/uploads/d.jpg", "/uploads/e.jpg", "/uploads/f.jpg"],
      ["/uploads/a.jpg", "/uploads/a.jpg", "/uploads/x.jpg", "/uploads/b.jpg", "/uploads/c.jpg", "/uploads/d.jpg", "/uploads/e.jpg", "/uploads/f.jpg"],
    ),
    ["/uploads/a.jpg", "/uploads/b.jpg", "/uploads/c.jpg", "/uploads/d.jpg", "/uploads/e.jpg"],
  );
});

test("normalizeSelectedImages accepts empty selection", () => {
  assert.deepEqual(normalizeSelectedImages(["/uploads/a.jpg"], []), []);
});

test("snapshotEntryReferenceIds removes unknown ids", () => {
  const subEntries = [{ id: 11 }, { id: 12 }];

  assert.deepEqual(snapshotEntryReferenceIds(subEntries, [11, 99, 12]), [11, 12]);
});

test("formatPostSnapshotMeta omits unknown snapshot species and keeps the post date", () => {
  assert.equal(
    formatPostSnapshotMeta("Unbekannt", "2026-07-06T00:00:00.000Z"),
    "06.07.2026",
  );

  assert.equal(
    formatPostSnapshotMeta("Acer palmatum", "2026-07-06T00:00:00.000Z"),
    "Acer palmatum · 06.07.2026",
  );
});
