-- CreateTable
CREATE TABLE "AllDialog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AllDialog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogDelta" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "dialogId" INTEGER NOT NULL,

    CONSTRAINT "DialogDelta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllDialog_uuid_key" ON "AllDialog"("uuid");

-- AddForeignKey
ALTER TABLE "AllDialog" ADD CONSTRAINT "AllDialog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogDelta" ADD CONSTRAINT "DialogDelta_dialogId_fkey" FOREIGN KEY ("dialogId") REFERENCES "AllDialog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
