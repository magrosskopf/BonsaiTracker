import type { Bonsai, Prisma, Reminder, SubEntry } from "@prisma/client";
import type { BonsaiDetail, BonsaiSummary, PostCommentDto, PostDto, ProfileDto, ReminderDto, SubEntryDto } from "@/types/dto";

type BonsaiWithCount = Bonsai & {
  _count: {
    subEntries: number;
  };
};

export function mapSubEntryToDto(entry: SubEntry): SubEntryDto {
  return {
    id: entry.id,
    bonsaiId: entry.bonsaiId,
    date: entry.date.toISOString(),
    entryType: entry.entryType,
    healthObservation: entry.healthObservation,
    performedActions: entry.performedActions,
    nextAction: entry.nextAction,
    reminderDate: entry.reminderDate?.toISOString() ?? null,
    notes: entry.notes,
    images: entry.images,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function mapBonsaiSummary(bonsai: BonsaiWithCount): BonsaiSummary {
  return {
    id: bonsai.id,
    name: bonsai.name,
    nickname: bonsai.nickname,
    species: bonsai.species,
    latinName: bonsai.latinName,
    location: bonsai.location,
    indoorOutdoor: bonsai.indoorOutdoor,
    age: bonsai.age,
    heightCm: bonsai.heightCm,
    widthCm: bonsai.widthCm,
    style: bonsai.style,
    customStyle: bonsai.customStyle,
    ownedSince: bonsai.ownedSince.toISOString(),
    healthStatus: bonsai.healthStatus,
    developmentStage: bonsai.developmentStage,
    coverImage: bonsai.images[0] ?? null,
    imageCount: bonsai.images.length,
    subEntryCount: bonsai._count.subEntries,
    deletedAt: bonsai.deletedAt?.toISOString() ?? null,
    updatedAt: bonsai.updatedAt.toISOString(),
  };
}

export type BonsaiDetailRecord = Prisma.BonsaiGetPayload<{
  include: {
    subEntries: true;
  };
}>;

export function mapBonsaiDetail(bonsai: BonsaiDetailRecord): BonsaiDetail {
  return {
    id: bonsai.id,
    name: bonsai.name,
    nickname: bonsai.nickname,
    species: bonsai.species,
    latinName: bonsai.latinName,
    location: bonsai.location,
    indoorOutdoor: bonsai.indoorOutdoor,
    age: bonsai.age,
    heightCm: bonsai.heightCm,
    widthCm: bonsai.widthCm,
    trunkDiameterMm: bonsai.trunkDiameterMm,
    style: bonsai.style,
    customStyle: bonsai.customStyle,
    ownedSince: bonsai.ownedSince.toISOString(),
    acquiredFrom: bonsai.acquiredFrom,
    purchasePriceCents: bonsai.purchasePriceCents,
    healthStatus: bonsai.healthStatus,
    developmentStage: bonsai.developmentStage,
    lastRepotDate: bonsai.lastRepotDate?.toISOString() ?? null,
    nextRepotDue: bonsai.nextRepotDue?.toISOString() ?? null,
    winterHardiness: bonsai.winterHardiness,
    sunExposure: bonsai.sunExposure,
    potType: bonsai.potType,
    potColor: bonsai.potColor,
    wateringNotes: bonsai.wateringNotes,
    fertilizingNotes: bonsai.fertilizingNotes,
    pruningNotes: bonsai.pruningNotes,
    wiringNotes: bonsai.wiringNotes,
    notes: bonsai.notes,
    images: bonsai.images,
    deletedAt: bonsai.deletedAt?.toISOString() ?? null,
    createdAt: bonsai.createdAt.toISOString(),
    updatedAt: bonsai.updatedAt.toISOString(),
    subEntries: bonsai.subEntries.map(mapSubEntryToDto),
  };
}

export type ReminderRecord = Prisma.ReminderGetPayload<{
  include: {
    bonsai: true;
  };
}>;

export function mapReminderToDto(reminder: ReminderRecord): ReminderDto {
  return {
    id: reminder.id,
    userId: reminder.userId,
    bonsaiId: reminder.bonsaiId,
    subEntryId: reminder.subEntryId,
    title: reminder.title,
    reminderDate: reminder.reminderDate.toISOString(),
    status: reminder.status,
    completedAt: reminder.completedAt?.toISOString() ?? null,
    snoozedUntil: reminder.snoozedUntil?.toISOString() ?? null,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString(),
    bonsaiName: reminder.bonsai.name,
    bonsaiDeletedAt: reminder.bonsai.deletedAt?.toISOString() ?? null,
  };
}

export type PostCommentRecord = Prisma.PostCommentGetPayload<{
  include: {
    user: true;
  };
}>;

export function mapPostCommentToDto(comment: PostCommentRecord): PostCommentDto {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    userName: comment.user.name,
    userProfileImageUrl: comment.user.profileImageUrl,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export type PostRecord = Prisma.PostGetPayload<{
  include: {
    user: true;
    likes: {
      select: {
        userId: true;
      };
    };
    comments: {
      include: {
        user: true;
      };
    };
    entryReferences: true;
  };
}>;

export function mapPostToDto(post: PostRecord, viewerUserId?: number): PostDto {
  return {
    id: post.id,
    userId: post.userId,
    bonsaiId: post.bonsaiId,
    userName: post.user.name,
    userProfileImageUrl: post.user.profileImageUrl,
    snapshotName: post.snapshotName,
    snapshotSpecies: post.snapshotSpecies,
    text: post.text,
    postType: post.postType,
    images: post.images,
    entryReferenceIds: post.entryReferences.map((reference) => reference.subEntryId),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    archivedAt: post.archivedAt?.toISOString() ?? null,
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    viewerHasLiked: viewerUserId ? post.likes.some((like) => like.userId === viewerUserId) : false,
  };
}

export type ProfileRecord = Prisma.UserGetPayload<{
  include: {
    posts: {
      include: {
        user: true;
        likes: {
          select: {
            userId: true;
          };
        };
        comments: {
          include: {
            user: true;
          };
        };
        entryReferences: true;
      };
    };
  };
}>;

export function mapProfileToDto(profile: ProfileRecord, viewerUserId?: number): ProfileDto {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    profileImageUrl: profile.profileImageUrl,
    posts: profile.posts.map((post) => mapPostToDto(post, viewerUserId)),
  };
}
