-- AlterTable
ALTER TABLE "LanguageModel" ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "baseUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar" SET DEFAULT '/media/avatar/default.webp';
