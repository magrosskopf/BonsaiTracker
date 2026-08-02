import { getServerDataClient } from "@/lib/supabase/server-data";
import { getVisiblePost, getVisiblePostComment } from "@/lib/repositories/posts";
import type { CommunityReportRow } from "@/types/database";
import type { CommunityReportReasonOption } from "@/types/domain";

export type CommunityReportTarget =
  | { type: "post"; postId: number }
  | { type: "comment"; postId: number; commentId: number };

export interface CommunityReportPayload {
  reason: CommunityReportReasonOption;
  note?: string | null;
}

export async function createOrReturnOpenReport(
  actorUserId: string,
  target: CommunityReportTarget,
  payload: CommunityReportPayload,
): Promise<CommunityReportRow | null> {
  if (target.type === "post") {
    const post = await getVisiblePost(actorUserId, target.postId);
    if (!post) {
      return null;
    }
  } else {
    const [post, comment] = await Promise.all([
      getVisiblePost(actorUserId, target.postId),
      getVisiblePostComment(actorUserId, target.postId, target.commentId),
    ]);
    if (!post || !comment) {
      return null;
    }
  }

  const targetPostId = target.postId;
  const targetCommentId = target.type === "comment" ? target.commentId : null;
  let existingQuery = getServerDataClient()
    .from("community_reports")
    .select("*")
    .eq("reporter_user_id", actorUserId)
    .eq("target_type", target.type)
    .eq("target_post_id", targetPostId)
    .eq("status", "OPEN");

  existingQuery = targetCommentId === null
    ? existingQuery.is("target_comment_id", null)
    : existingQuery.eq("target_comment_id", targetCommentId);

  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) {
    throw existingError;
  }
  if (existing) {
    return existing as CommunityReportRow;
  }

  const { data, error } = await getServerDataClient()
    .from("community_reports")
    .insert({
      target_type: target.type,
      target_post_id: targetPostId,
      target_comment_id: targetCommentId,
      reporter_user_id: actorUserId,
      reason: payload.reason,
      note: payload.note ?? null,
      status: "OPEN",
    } as never)
    .select("*")
    .single();
  if (error) {
    throw error;
  }
  return data as CommunityReportRow;
}
