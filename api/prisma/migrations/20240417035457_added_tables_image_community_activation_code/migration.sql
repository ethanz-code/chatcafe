-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dialogueBalance" SET DEFAULT 50,
ALTER COLUMN "paintingBalance" SET DEFAULT 2;

-- CreateTable
CREATE TABLE "ImageCommunity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imgId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ImageCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivationCode" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "ActivationCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageCommunity" ADD CONSTRAINT "ImageCommunity_imgId_fkey" FOREIGN KEY ("imgId") REFERENCES "GenImageList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCommunity" ADD CONSTRAINT "ImageCommunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
