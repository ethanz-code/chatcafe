/*
  Warnings:

  - You are about to drop the column `value` on the `TaskReward` table. All the data in the column will be lost.
  - Added the required column `value` to the `TaskRewardReceived` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskReward" DROP COLUMN "value";

-- AlterTable
ALTER TABLE "TaskRewardReceived" ADD COLUMN     "value" INTEGER NOT NULL;
