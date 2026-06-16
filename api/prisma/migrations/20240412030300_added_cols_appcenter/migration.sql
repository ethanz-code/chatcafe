/*
  Warnings:

  - Added the required column `path` to the `ApplicationCenter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queryType` to the `ApplicationCenter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationCenter" ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "queryType" TEXT NOT NULL;
