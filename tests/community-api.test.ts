import assert from "node:assert/strict";
import test from "node:test";
import { mapPublicProfileToDto, mapSelfProfileToDto } from "@/lib/mappers";

function buildProfileRecord() {
  const createdAt = new Date("2025-03-01T12:00:00.000Z");

  return {
    id: 7,
    email: "private@example.com",
    name: "Maius",
    image: null,
    bio: "Pflegt japanische Ahorne.",
    profileImageUrl: "/api/media/local/profile/avatar.webp",
    emailVerified: null,
    posts: [
      {
        id: 10,
        userId: 7,
        bonsaiId: 3,
        text: "Erster Fruehlingsschnitt.",
        postType: "SHOWCASE",
        snapshotName: "Acer deshojo",
        snapshotSpecies: "Acer palmatum",
        images: ["/api/media/local/posts/acer.webp"],
        archivedAt: null,
        createdAt,
        updatedAt: createdAt,
        user: {
          id: 7,
          email: "private@example.com",
          name: "Maius",
          image: null,
          bio: "Pflegt japanische Ahorne.",
          profileImageUrl: "/api/media/local/profile/avatar.webp",
          emailVerified: null,
        },
        likes: [{ userId: 7 }],
        comments: [],
        entryReferences: [{ id: 99, postId: 10, subEntryId: 42, createdAt }],
      },
    ],
  } as Parameters<typeof mapPublicProfileToDto>[0];
}

test("public profile dto omits private email field", () => {
  const dto = mapPublicProfileToDto(buildProfileRecord(), 7);

  assert.equal(dto.id, 7);
  assert.equal(dto.name, "Maius");
  assert.equal("email" in dto, false);
  assert.equal(dto.posts[0].bonsaiId, 3);
  assert.deepEqual(dto.posts[0].entryReferenceIds, [42]);
});

test("self profile dto keeps email field", () => {
  const dto = mapSelfProfileToDto(buildProfileRecord(), 7);

  assert.equal(dto.email, "private@example.com");
  assert.equal(dto.posts[0].viewerHasLiked, true);
});
