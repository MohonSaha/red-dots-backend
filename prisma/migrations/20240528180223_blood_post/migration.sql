-- CreateTable
CREATE TABLE "bloodPosts" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "numberOfBags" INTEGER NOT NULL DEFAULT 0,
    "phoneNumber" TEXT NOT NULL,
    "dateOfDonation" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalLocation" TEXT NOT NULL,
    "hospitalAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestStatus" "requestStatus" NOT NULL DEFAULT 'PENDING',
    "isManaged" BOOLEAN NOT NULL DEFAULT false,
    "alternativePhoneNumber" TEXT,
    "timeOfDonation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloodPosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloodPostDonors" (
    "id" TEXT NOT NULL,
    "bloodPostId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloodPostDonors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bloodPosts_id_numberOfBags_key" ON "bloodPosts"("id", "numberOfBags");

-- CreateIndex
CREATE UNIQUE INDEX "bloodPostDonors_bloodPostId_donorId_key" ON "bloodPostDonors"("bloodPostId", "donorId");

-- AddForeignKey
ALTER TABLE "bloodPosts" ADD CONSTRAINT "bloodPosts_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloodPosts" ADD CONSTRAINT "bloodPosts_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloodPostDonors" ADD CONSTRAINT "bloodPostDonors_bloodPostId_fkey" FOREIGN KEY ("bloodPostId") REFERENCES "bloodPosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloodPostDonors" ADD CONSTRAINT "bloodPostDonors_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
