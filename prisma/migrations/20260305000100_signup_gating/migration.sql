-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "SignupAllowlist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupAllowlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistRequest" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "sourceIp" TEXT,
    "userAgent" TEXT,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthRateLimitEvent" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthRateLimitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupSlot" (
    "id" SERIAL NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "email" TEXT,
    "reservedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupAllowlist_email_key" ON "SignupAllowlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistRequest_email_key" ON "WaitlistRequest"("email");

-- CreateIndex
CREATE INDEX "AuthRateLimitEvent_scope_key_createdAt_idx" ON "AuthRateLimitEvent"("scope", "key", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SignupSlot_slotNumber_key" ON "SignupSlot"("slotNumber");

-- CreateIndex
CREATE INDEX "SignupSlot_email_idx" ON "SignupSlot"("email");
