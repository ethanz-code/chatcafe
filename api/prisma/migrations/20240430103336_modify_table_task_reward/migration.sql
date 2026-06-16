/*
  Warnings:

  - You are about to drop the column `receivedUserID` on the `TaskReward` table. All the data in the column will be lost.
  - Added the required column `name` to the `TaskReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `TaskReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskReward" DROP COLUMN "receivedUserID",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TaskRewardReceived" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskRewardId" INTEGER NOT NULL,

    CONSTRAINT "TaskRewardReceived_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskRewardReceived" ADD CONSTRAINT "TaskRewardReceived_taskRewardId_fkey" FOREIGN KEY ("taskRewardId") REFERENCES "TaskReward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
