import type {
  DevelopmentStageOption,
  EntryTypeOption,
  HealthStatusOption,
  IndoorOutdoorOption,
  PostTypeOption,
  ReminderStatusOption,
  WinterHardinessOption,
  SunExposureOption,
  CommunityReportStatusOption,
} from "./domain";

export interface BonsaiSummary {
  id: number;
  name: string;
  species: string;
  latinName: string | null;
  location: string;
  indoorOutdoor: IndoorOutdoorOption;
  age: number | null;
  heightCm: number | null;
  widthCm: number | null;
  style: string;
  customStyle: string | null;
  ownedSince: string | null;
  healthStatus: HealthStatusOption;
  developmentStage: DevelopmentStageOption;
  coverImage: string | null;
  imageCount: number;
  subEntryCount: number;
  deletedAt: string | null;
  updatedAt: string;
}

export interface SubEntryDto {
  id: number;
  bonsaiId: number;
  date: string;
  entryType: EntryTypeOption;
  healthObservation: HealthStatusOption | null;
  performedActions: string[];
  nextAction: string | null;
  reminderDate: string | null;
  notes: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BonsaiDetail {
  id: number;
  name: string;
  species: string;
  latinName: string | null;
  location: string;
  indoorOutdoor: IndoorOutdoorOption;
  age: number | null;
  heightCm: number | null;
  widthCm: number | null;
  trunkDiameterMm: number | null;
  style: string;
  customStyle: string | null;
  ownedSince: string | null;
  acquiredFrom: string | null;
  purchasePriceCents: number | null;
  healthStatus: HealthStatusOption;
  developmentStage: DevelopmentStageOption;
  lastRepotDate: string | null;
  nextRepotDue: string | null;
  winterHardiness: WinterHardinessOption | null;
  sunExposure: SunExposureOption | null;
  potType: string | null;
  potColor: string | null;
  wateringNotes: string | null;
  fertilizingNotes: string | null;
  pruningNotes: string | null;
  wiringNotes: string | null;
  notes: string | null;
  images: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subEntries: SubEntryDto[];
}

export interface BonsaiListResponse {
  items: BonsaiSummary[];
  nextCursor: string | null;
}

export interface FeedListResponse {
  items: PostDto[];
  nextCursor: string | null;
}

export interface ReminderDto {
  id: number;
  userId: string;
  bonsaiId: number;
  subEntryId: number | null;
  title: string | null;
  reminderDate: string;
  status: ReminderStatusOption;
  completedAt: string | null;
  snoozedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  bonsaiName: string;
  bonsaiDeletedAt: string | null;
}

export interface PostCommentDto {
  id: number;
  postId: number;
  userId: string;
  userName: string | null;
  userProfileImageUrl: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostDto {
  id: number;
  userId: string;
  bonsaiId: number;
  userName: string | null;
  userProfileImageUrl: string | null;
  snapshotName: string;
  snapshotSpecies: string;
  text: string;
  postType: PostTypeOption;
  images: string[];
  entryReferenceIds: Array<number | null>;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
}

export interface PublicProfileDto {
  id: string;
  name: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  posts: PostDto[];
}

export interface SelfProfileDto extends PublicProfileDto {
  email: string | null;
}

export interface CommunityReportDto {
  reported: true;
  status: CommunityReportStatusOption;
}

export interface AppIntegrityDto {
  platform: "ios" | "android" | null;
  subject: string | null;
  verified: boolean;
  devBypass: boolean;
}
