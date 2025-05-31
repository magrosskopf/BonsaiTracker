-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bonsai" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "ownedSince" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "images" TEXT[],
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Bonsai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "images" TEXT[],
    "bonsaiId" INTEGER NOT NULL,

    CONSTRAINT "SubEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Bonsai" ADD CONSTRAINT "Bonsai_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubEntry" ADD CONSTRAINT "SubEntry_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "Bonsai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
