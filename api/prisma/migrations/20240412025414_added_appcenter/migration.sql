-- CreateTable
CREATE TABLE "ApplicationCenter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "description" TEXT,
    "model" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ApplicationCenter_pkey" PRIMARY KEY ("id")
);
