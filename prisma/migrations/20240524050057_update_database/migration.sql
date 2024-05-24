/*
  Warnings:

  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVATE', 'DEACTIVATE');

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "alternativePhoneNumber" TEXT,
ADD COLUMN     "timeOfDonation" TEXT;

-- AlterTable
ALTER TABLE "userProfiles" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "hasAllergies" BOOLEAN DEFAULT false,
ADD COLUMN     "hasDiabetes" BOOLEAN DEFAULT false,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "weight" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeStatus" "UserStatus" NOT NULL DEFAULT 'ACTIVATE',
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRole" NOT NULL;
