/*
  Warnings:

  - The `likes` column on the `ImageCommunity` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ImageCommunity" DROP COLUMN "likes",
ADD COLUMN     "likes" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
