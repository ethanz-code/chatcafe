-- CreateTable
CREATE TABLE "AssistantCategory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AssistantCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "content_zh_CN" TEXT NOT NULL,
    "content_en_US" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssistantCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
