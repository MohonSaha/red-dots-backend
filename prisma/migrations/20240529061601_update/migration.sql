/*
  Warnings:

  - You are about to drop the column `donorId` on the `bloodPosts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "bloodPosts" DROP CONSTRAINT "bloodPosts_donorId_fkey";

-- AlterTable
ALTER TABLE "bloodPosts" DROP COLUMN "donorId";
