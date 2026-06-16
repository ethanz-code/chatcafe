/*
  Warnings:

  - Added the required column `description` to the `TaskReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fluentIconName` to the `TaskReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardDialogue` to the `TaskReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardPainting` to the `TaskReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskReward" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fluentIconName" TEXT NOT NULL,
ADD COLUMN     "rewardDialogue" INTEGER NOT NULL,
ADD COLUMN     "rewardPainting" INTEGER NOT NULL;
