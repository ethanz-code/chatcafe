-- CreateTable
CREATE TABLE "PunchInDaily" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rewardDialogue" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PunchInDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskReward" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "condition" TEXT NOT NULL DEFAULT '0',
    "refreshTime" TEXT NOT NULL DEFAULT '0',
    "receivedUserID" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "TaskReward_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PunchInDaily" ADD CONSTRAINT "PunchInDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
