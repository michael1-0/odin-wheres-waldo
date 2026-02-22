-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "playerName" VARCHAR(24) NOT NULL,
    "elapsedMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" VARCHAR(200) NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scores_playerName_key" ON "scores"("playerName");
