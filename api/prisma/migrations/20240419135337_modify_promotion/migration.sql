/*
  Warnings:

  - Added the required column `inviteUserId` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_inviteeUserId_fkey";

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "inviteUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_inviteUserId_fkey" FOREIGN KEY ("inviteUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
