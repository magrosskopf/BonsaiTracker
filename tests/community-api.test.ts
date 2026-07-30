import assert from "node:assert/strict";
import test from "node:test";
import { mapPublicProfileToDto, mapSelfProfileToDto, type ProfileRecord } from "@/lib/mappers";

function buildProfileRecord(): ProfileRecord {
  const createdAt = "2025-03-01T12:00:00.000Z";
  const userId = "11111111-1111-4111-8111-111111111111";

  return {
    id: userId,
    name: "Maius",
    bio: "Pflegt japanische Ahorne.",
    profile_image_url: "/api/media/supabase/11111111-1111-4111-8111-111111111111/profile/avatar.webp",
    created_at: createdAt,
    updated_at: createdAt,
    posts: [
      {
        id: 10,
        user_id: userId,
        bonsai_id: 3,
        text: "Erster Fruehlingsschnitt.",
        post_type: "SHOWCASE",
        snapshot_name: "Acer deshojo",
        snapshot_species: "Acer palmatum",
        images: ["/api/media/supabase/11111111-1111-4111-8111-111111111111/posts/acer.webp"],
        archived_at: null,
        created_at: createdAt,
        updated_at: createdAt,
        profiles: { name: "Maius", profile_image_url: "/avatar.webp" },
        post_likes: [{ user_id: userId }],
        post_comments: [],
        post_entry_references: [{ sub_entry_id: 42 }],
      },
    ],
  };
}

test("public profile dto omits private email field", () => {
  const viewerId = "11111111-1111-4111-8111-111111111111";
  const dto = mapPublicProfileToDto(buildProfileRecord(), viewerId);

  assert.equal(dto.id, viewerId);
  assert.equal(dto.name, "Maius");
  assert.equal("email" in dto, false);
  assert.equal(dto.posts[0].bonsaiId, 3);
  assert.deepEqual(dto.posts[0].entryReferenceIds, [42]);
});

test("self profile dto keeps email field only from auth boundary", () => {
  const viewerId = "11111111-1111-4111-8111-111111111111";
  const dto = mapSelfProfileToDto(buildProfileRecord(), "private@example.com", viewerId);

  assert.equal(dto.email, "private@example.com");
  assert.equal(dto.posts[0].viewerHasLiked, true);
});
