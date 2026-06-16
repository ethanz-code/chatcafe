-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteCode" TEXT NOT NULL DEFAULT 'CDFQTZ';

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inviteeUserId" INTEGER NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_inviteeUserId_fkey" FOREIGN KEY ("inviteeUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
