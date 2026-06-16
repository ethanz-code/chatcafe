/*
  Warnings:

  - You are about to drop the `DialogDelta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DialogDelta" DROP CONSTRAINT "DialogDelta_dialogId_fkey";

-- DropTable
DROP TABLE "DialogDelta";

-- CreateTable
CREATE TABLE "DialogDetail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "dialogId" INTEGER NOT NULL,

    CONSTRAINT "DialogDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarDialogDetail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dialogUUID" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userMsg" TEXT NOT NULL,
    "userMsgTime" TEXT NOT NULL,
    "assistantMsg" TEXT NOT NULL,
    "assistantMsgTime" TEXT NOT NULL,

    CONSTRAINT "StarDialogDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DialogDetail" ADD CONSTRAINT "DialogDetail_dialogId_fkey" FOREIGN KEY ("dialogId") REFERENCES "AllDialog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarDialogDetail" ADD CONSTRAINT "StarDialogDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
