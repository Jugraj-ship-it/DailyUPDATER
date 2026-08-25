-- CreateTable
CREATE TABLE "ReadReceipt" (
    "id" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadReceipt_viewerId_ownerId_date_key" ON "ReadReceipt"("viewerId", "ownerId", "date");

-- AddForeignKey
ALTER TABLE "ReadReceipt" ADD CONSTRAINT "ReadReceipt_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadReceipt" ADD CONSTRAINT "ReadReceipt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
