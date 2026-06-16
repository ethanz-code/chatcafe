/*
  Warnings:

  - Added the required column `description` to the `Assistant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assistant" ADD COLUMN     "description" TEXT NOT NULL;
