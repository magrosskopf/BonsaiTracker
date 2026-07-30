import { getServerDataClient } from "@/lib/supabase/server-data";
import type { PostCommentRecord, PostRecord } from "@/lib/mappers";
import type { PostCommentRow, PostRow } from "@/types/database";
import type { PostTypeOption } from "@/types/domain";

const POST_SELECT = "*, profiles(name, profile_image_url), post_likes(user_id), post_comments(*, profiles(name, profile_image_url)), post_entry_references(sub_entry_id)";

export async function listFeedPosts(actorUserId: string): Promise<PostRecord[]> {
  const { data, error } = await getServerDataClient()
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []) as PostRecord[];
}

export async function getVisiblePost(_actorUserId: string, postId: number): Promise<PostRecord | null> {
  const { data, error } = await getServerDataClient()
    .from("posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as PostRecord | null;
}

export async function getOwnedPost(actorUserId: string, postId: number): Promise<PostRow | null> {
  const { data, error } = await getServerDataClient().from("posts").select("*").eq("id", postId).eq("user_id", actorUserId).maybeSingle();
  if (error) {
    throw error;
  }
  return data as PostRow | null;
}

export async function saveOwnedPost(
  actorUserId: string,
  postId: number | null,
  bonsaiId: number,
  text: string,
  postType: PostTypeOption,
  entryIds: number[],
  images: string[],
): Promise<PostRecord> {
  const { data: savedId, error } = await getServerDataClient().rpc("save_owned_post", {
    p_actor_user_id: actorUserId,
    p_post_id: postId,
    p_bonsai_id: bonsaiId,
    p_text: text,
    p_post_type: postType,
    p_entry_ids: entryIds,
    p_images: images,
  });
  if (error) {
    throw error;
  }
  const post = await getVisiblePost(actorUserId, Number(savedId));
  if (!post) {
    throw new Error("Saved post was not returned by Supabase.");
  }
  return post;
}

export async function deleteOwnedPost(actorUserId: string, postId: number): Promise<boolean> {
  const { error, count } = await getServerDataClient().from("posts").delete({ count: "exact" }).eq("id", postId).eq("user_id", actorUserId);
  if (error) {
    throw error;
  }
  return (count ?? 0) > 0;
}

export async function togglePostLike(actorUserId: string, postId: number): Promise<{ liked: boolean; likeCount: number }> {
  const { data, error } = await getServerDataClient().rpc("toggle_post_like", {
    p_actor_user_id: actorUserId,
    p_post_id: postId,
  });
  if (error) {
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { liked: Boolean(row?.liked), likeCount: Number(row?.like_count ?? 0) };
}

export async function listPostComments(_actorUserId: string, postId: number): Promise<PostCommentRecord[]> {
  const { data, error } = await getServerDataClient()
    .from("post_comments")
    .select("*, profiles(name, profile_image_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []) as PostCommentRecord[];
}

export async function createPostComment(actorUserId: string, postId: number, text: string): Promise<PostCommentRecord> {
  const { data, error } = await getServerDataClient()
    .from("post_comments")
    .insert({ post_id: postId, user_id: actorUserId, text } as never)
    .select("*, profiles(name, profile_image_url)")
    .single();
  if (error) {
    throw error;
  }
  return data as PostCommentRecord;
}
