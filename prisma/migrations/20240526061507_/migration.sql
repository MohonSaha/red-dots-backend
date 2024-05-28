/*
  Warnings:

  - The `height` column on the `userProfiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `weight` column on the `userProfiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneNumber` column on the `userProfiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "userProfiles" ALTER COLUMN "age" SET DEFAULT 0,
DROP COLUMN "height",
ADD COLUMN     "height" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "weight",
ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "phoneNumber",
ADD COLUMN     "phoneNumber" INTEGER NOT NULL DEFAULT 0;
