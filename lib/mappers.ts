import type { BonsaiRow, PostCommentRow, PostRow, ProfileRow, ReminderRow, SubEntryRow } from "@/types/database";
import type { BonsaiDetail, BonsaiSummary, PostCommentDto, PostDto, PublicProfileDto, ReminderDto, SelfProfileDto, SubEntryDto } from "@/types/dto";

type MaybeDate = string | Date | null;

function iso(value: MaybeDate): string | null {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

export interface BonsaiSummaryRecord extends BonsaiRow {
  sub_entry_count: number;
}

export function mapSubEntryToDto(entry: SubEntryRow): SubEntryDto {
  return {
    id: entry.id,
    bonsaiId: entry.bonsai_id,
    date: iso(entry.date) ?? entry.date,
    entryType: entry.entry_type,
    healthObservation: entry.health_observation,
    performedActions: entry.performed_actions,
    nextAction: entry.next_action,
    reminderDate: iso(entry.reminder_date),
    notes: entry.notes,
    images: entry.images,
    createdAt: iso(entry.created_at) ?? entry.created_at,
    updatedAt: iso(entry.updated_at) ?? entry.updated_at,
  };
}

export function mapBonsaiSummary(bonsai: BonsaiSummaryRecord): BonsaiSummary {
  return {
    id: bonsai.id,
    name: bonsai.name,
    species: bonsai.species,
    latinName: bonsai.latin_name,
    location: bonsai.location,
    indoorOutdoor: bonsai.indoor_outdoor,
    age: bonsai.age,
    heightCm: bonsai.height_cm,
    widthCm: bonsai.width_cm,
    style: bonsai.style,
    customStyle: bonsai.custom_style,
    ownedSince: iso(bonsai.owned_since),
    healthStatus: bonsai.health_status,
    developmentStage: bonsai.development_stage,
    coverImage: bonsai.images[0] ?? null,
    imageCount: bonsai.images.length,
    subEntryCount: bonsai.sub_entry_count,
    deletedAt: iso(bonsai.deleted_at),
    updatedAt: iso(bonsai.updated_at) ?? bonsai.updated_at,
  };
}

export interface BonsaiDetailRecord extends BonsaiRow {
  sub_entries: SubEntryRow[];
}

export function mapBonsaiDetail(bonsai: BonsaiDetailRecord): BonsaiDetail {
  return {
    id: bonsai.id,
    name: bonsai.name,
    species: bonsai.species,
    latinName: bonsai.latin_name,
    location: bonsai.location,
    indoorOutdoor: bonsai.indoor_outdoor,
    age: bonsai.age,
    heightCm: bonsai.height_cm,
    widthCm: bonsai.width_cm,
    trunkDiameterMm: bonsai.trunk_diameter_mm,
    style: bonsai.style,
    customStyle: bonsai.custom_style,
    ownedSince: iso(bonsai.owned_since),
    acquiredFrom: bonsai.acquired_from,
    purchasePriceCents: bonsai.purchase_price_cents,
    healthStatus: bonsai.health_status,
    developmentStage: bonsai.development_stage,
    lastRepotDate: iso(bonsai.last_repot_date),
    nextRepotDue: iso(bonsai.next_repot_due),
    winterHardiness: bonsai.winter_hardiness,
    sunExposure: bonsai.sun_exposure,
    potType: bonsai.pot_type,
    potColor: bonsai.pot_color,
    wateringNotes: bonsai.watering_notes,
    fertilizingNotes: bonsai.fertilizing_notes,
    pruningNotes: bonsai.pruning_notes,
    wiringNotes: bonsai.wiring_notes,
    notes: bonsai.notes,
    images: bonsai.images,
    deletedAt: iso(bonsai.deleted_at),
    createdAt: iso(bonsai.created_at) ?? bonsai.created_at,
    updatedAt: iso(bonsai.updated_at) ?? bonsai.updated_at,
    subEntries: bonsai.sub_entries.map(mapSubEntryToDto),
  };
}

export interface ReminderRecord extends ReminderRow {
  bonsais: Pick<BonsaiRow, "name" | "deleted_at"> | null;
}

export function mapReminderToDto(reminder: ReminderRecord): ReminderDto {
  return {
    id: reminder.id,
    userId: reminder.user_id,
    bonsaiId: reminder.bonsai_id,
    subEntryId: reminder.sub_entry_id,
    title: reminder.title,
    reminderDate: iso(reminder.reminder_date) ?? reminder.reminder_date,
    status: reminder.status,
    completedAt: iso(reminder.completed_at),
    snoozedUntil: iso(reminder.snoozed_until),
    createdAt: iso(reminder.created_at) ?? reminder.created_at,
    updatedAt: iso(reminder.updated_at) ?? reminder.updated_at,
    bonsaiName: reminder.bonsais?.name ?? "Unbekannter Bonsai",
    bonsaiDeletedAt: iso(reminder.bonsais?.deleted_at ?? null),
  };
}

export interface PostCommentRecord extends PostCommentRow {
  profiles: Pick<ProfileRow, "name" | "profile_image_url"> | null;
}

export function mapPostCommentToDto(comment: PostCommentRecord): PostCommentDto {
  return {
    id: comment.id,
    postId: comment.post_id,
    userId: comment.user_id,
    userName: comment.profiles?.name ?? null,
    userProfileImageUrl: comment.profiles?.profile_image_url ?? null,
    text: comment.text,
    createdAt: iso(comment.created_at) ?? comment.created_at,
    updatedAt: iso(comment.updated_at) ?? comment.updated_at,
  };
}

export interface PostRecord extends PostRow {
  profiles: Pick<ProfileRow, "name" | "profile_image_url"> | null;
  post_likes: Pick<import("@/types/database").Row<"post_likes">, "user_id">[];
  post_comments: PostCommentRecord[];
  post_entry_references: Pick<import("@/types/database").Row<"post_entry_references">, "sub_entry_id">[];
}

export function mapPostToDto(post: PostRecord, viewerUserId?: string): PostDto {
  return {
    id: post.id,
    userId: post.user_id,
    bonsaiId: post.bonsai_id,
    userName: post.profiles?.name ?? null,
    userProfileImageUrl: post.profiles?.profile_image_url ?? null,
    snapshotName: post.snapshot_name,
    snapshotSpecies: post.snapshot_species,
    text: post.text,
    postType: post.post_type,
    images: post.images,
    entryReferenceIds: post.post_entry_references.map((reference) => reference.sub_entry_id),
    createdAt: iso(post.created_at) ?? post.created_at,
    updatedAt: iso(post.updated_at) ?? post.updated_at,
    archivedAt: iso(post.archived_at),
    likeCount: post.post_likes.length,
    commentCount: post.post_comments.length,
    viewerHasLiked: viewerUserId ? post.post_likes.some((like) => like.user_id === viewerUserId) : false,
  };
}

export interface ProfileRecord extends ProfileRow {
  posts: PostRecord[];
}

export function mapPublicProfileToDto(profile: ProfileRecord, viewerUserId?: string): PublicProfileDto {
  return {
    id: profile.id,
    name: profile.name,
    bio: profile.bio,
    profileImageUrl: profile.profile_image_url,
    posts: profile.posts.map((post) => mapPostToDto(post, viewerUserId)),
  };
}

export function mapSelfProfileToDto(profile: ProfileRecord, email: string | null, viewerUserId?: string): SelfProfileDto {
  return {
    ...mapPublicProfileToDto(profile, viewerUserId),
    email,
  };
}
