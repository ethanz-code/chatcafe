-- CreateTable
CREATE TABLE "GenImageList" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "GenImageList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GenImageList" ADD CONSTRAINT "GenImageList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
