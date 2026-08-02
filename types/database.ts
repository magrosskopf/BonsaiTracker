import type { Database } from "@/types/supabase";

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export type BonsaiRow = Row<"bonsais">;
export type SubEntryRow = Row<"sub_entries">;
export type ReminderRow = Row<"reminders">;
export type PostRow = Row<"posts">;
export type PostCommentRow = Row<"post_comments">;
export type ProfileRow = Row<"profiles">;
export type CommunityReportRow = Row<"community_reports">;
