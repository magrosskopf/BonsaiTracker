DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IndoorOutdoorEnum') THEN
    CREATE TYPE "IndoorOutdoorEnum" AS ENUM ('INDOOR', 'OUTDOOR', 'BEIDES');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HealthStatusEnum') THEN
    CREATE TYPE "HealthStatusEnum" AS ENUM ('UNBEKANNT', 'SEHR_GUT', 'GUT', 'BEOBACHTEN', 'KRITISCH');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DevelopmentStageEnum') THEN
    CREATE TYPE "DevelopmentStageEnum" AS ENUM ('ROHLING', 'IN_GESTALTUNG', 'VERFEINERUNG', 'REIF');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WinterHardinessEnum') THEN
    CREATE TYPE "WinterHardinessEnum" AS ENUM ('NICHT_WINTERHART', 'BEDINGT_WINTERHART', 'WINTERHART');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SunExposureEnum') THEN
    CREATE TYPE "SunExposureEnum" AS ENUM ('VOLLE_SONNE', 'HALBSCHATTEN', 'SCHATTEN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EntryTypeEnum') THEN
    CREATE TYPE "EntryTypeEnum" AS ENUM ('GIESSEN', 'DUENGEN', 'SCHNEIDEN', 'DRAHTEN', 'UMTOPFEN', 'KONTROLLE', 'FOTO_UPDATE', 'SONSTIGES');
  END IF;
END $$;

ALTER TABLE "Bonsai"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nickname" TEXT,
  ADD COLUMN IF NOT EXISTS "latinName" TEXT,
  ADD COLUMN IF NOT EXISTS "indoorOutdoor" "IndoorOutdoorEnum",
  ADD COLUMN IF NOT EXISTS "heightCm" INTEGER,
  ADD COLUMN IF NOT EXISTS "widthCm" INTEGER,
  ADD COLUMN IF NOT EXISTS "trunkDiameterMm" INTEGER,
  ADD COLUMN IF NOT EXISTS "style" TEXT,
  ADD COLUMN IF NOT EXISTS "customStyle" TEXT,
  ADD COLUMN IF NOT EXISTS "acquiredFrom" TEXT,
  ADD COLUMN IF NOT EXISTS "purchasePriceCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "healthStatus" "HealthStatusEnum",
  ADD COLUMN IF NOT EXISTS "developmentStage" "DevelopmentStageEnum",
  ADD COLUMN IF NOT EXISTS "lastRepotDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nextRepotDue" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "winterHardiness" "WinterHardinessEnum",
  ADD COLUMN IF NOT EXISTS "sunExposure" "SunExposureEnum",
  ADD COLUMN IF NOT EXISTS "potType" TEXT,
  ADD COLUMN IF NOT EXISTS "potColor" TEXT,
  ADD COLUMN IF NOT EXISTS "wateringNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "fertilizingNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "pruningNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "wiringNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

UPDATE "Bonsai"
SET
  "indoorOutdoor" = COALESCE("indoorOutdoor", 'OUTDOOR'::"IndoorOutdoorEnum"),
  "style" = COALESCE(NULLIF(TRIM("style"), ''), 'Sonstiger'),
  "healthStatus" = COALESCE("healthStatus", 'UNBEKANNT'::"HealthStatusEnum"),
  "developmentStage" = COALESCE("developmentStage", 'ROHLING'::"DevelopmentStageEnum"),
  "updatedAt" = COALESCE("updatedAt", "createdAt", CURRENT_TIMESTAMP),
  "images" = COALESCE("images", ARRAY[]::TEXT[]);

ALTER TABLE "Bonsai"
  ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "indoorOutdoor" SET NOT NULL,
  ALTER COLUMN "style" SET NOT NULL,
  ALTER COLUMN "healthStatus" SET NOT NULL,
  ALTER COLUMN "developmentStage" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "SubEntry"
  ADD COLUMN IF NOT EXISTS "entryType" "EntryTypeEnum",
  ADD COLUMN IF NOT EXISTS "healthObservation" "HealthStatusEnum",
  ADD COLUMN IF NOT EXISTS "performedActions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "nextAction" TEXT,
  ADD COLUMN IF NOT EXISTS "reminderDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

UPDATE "SubEntry"
SET
  "entryType" = COALESCE("entryType", 'SONSTIGES'::"EntryTypeEnum"),
  "updatedAt" = COALESCE("updatedAt", "createdAt", CURRENT_TIMESTAMP),
  "images" = COALESCE("images", ARRAY[]::TEXT[]);

ALTER TABLE "SubEntry"
  ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "entryType" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "User"
  DROP COLUMN IF EXISTS "password";

DROP INDEX IF EXISTS "Session_sessionToken_key";
DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";
DROP INDEX IF EXISTS "User_email_key";
DROP INDEX IF EXISTS "Bonsai_userId_idx";
DROP INDEX IF EXISTS "SubEntry_bonsaiId_idx";
DROP INDEX IF EXISTS "Bonsai_userId_deletedAt_updatedAt_id_idx";
DROP INDEX IF EXISTS "SubEntry_bonsaiId_date_id_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "Bonsai_userId_idx" ON "Bonsai"("userId");
CREATE INDEX IF NOT EXISTS "SubEntry_bonsaiId_idx" ON "SubEntry"("bonsaiId");
CREATE INDEX IF NOT EXISTS "Bonsai_userId_deletedAt_updatedAt_id_idx" ON "Bonsai"("userId", "deletedAt", "updatedAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "SubEntry_bonsaiId_date_id_idx" ON "SubEntry"("bonsaiId", "date" DESC, "id" DESC);

ALTER TABLE "Bonsai" DROP CONSTRAINT IF EXISTS "Bonsai_userId_fkey";
ALTER TABLE "SubEntry" DROP CONSTRAINT IF EXISTS "SubEntry_bonsaiId_fkey";

ALTER TABLE "Bonsai"
  ADD CONSTRAINT "Bonsai_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubEntry"
  ADD CONSTRAINT "SubEntry_bonsaiId_fkey"
  FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE CASCADE ON UPDATE CASCADE;
