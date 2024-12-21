-- CreateEnum
CREATE TYPE "requestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVATE', 'DEACTIVATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT false,
    "activeStatus" "UserStatus" NOT NULL DEFAULT 'ACTIVATE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "age" INTEGER NOT NULL DEFAULT 0,
    "lastDonationDate" TEXT NOT NULL,
    "gender" "Gender",
    "hasAllergies" BOOLEAN DEFAULT false,
    "hasDiabetes" BOOLEAN DEFAULT false,
    "height" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "phoneNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateOfDonation" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestStatus" "requestStatus" NOT NULL DEFAULT 'PENDING',
    "isAccepted" BOOLEAN DEFAULT false,
    "alternativePhoneNumber" TEXT,
    "timeOfDonation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloodPosts" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "numberOfBags" INTEGER NOT NULL DEFAULT 0,
    "phoneNumber" TEXT NOT NULL,
    "dateOfDonation" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalLocation" TEXT NOT NULL,
    "hospitalAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestStatus" "requestStatus" NOT NULL DEFAULT 'PENDING',
    "isManaged" BOOLEAN NOT NULL DEFAULT false,
    "alternativePhoneNumber" TEXT,
    "timeOfDonation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloodPosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloodPostDonors" (
    "id" TEXT NOT NULL,
    "bloodPostId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloodPostDonors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "userProfiles_userId_key" ON "userProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bloodPosts_id_numberOfBags_key" ON "bloodPosts"("id", "numberOfBags");

-- CreateIndex
CREATE UNIQUE INDEX "bloodPostDonors_bloodPostId_donorId_key" ON "bloodPostDonors"("bloodPostId", "donorId");

-- AddForeignKey
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloodPosts" ADD CONSTRAINT "bloodPosts_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloodPostDonors" ADD CONSTRAINT "bloodPostDonors_bloodPostId_fkey" FOREIGN KEY ("bloodPostId") REFERENCES "bloodPosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloodPostDonors" ADD CONSTRAINT "bloodPostDonors_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
