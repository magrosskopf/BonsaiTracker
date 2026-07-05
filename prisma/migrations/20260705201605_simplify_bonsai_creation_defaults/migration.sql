-- AlterEnum
ALTER TYPE "DevelopmentStageEnum" ADD VALUE 'UNBEKANNT';

-- AlterTable
ALTER TABLE "Bonsai"
  ALTER COLUMN "age" DROP NOT NULL,
  ALTER COLUMN "ownedSince" DROP NOT NULL;
