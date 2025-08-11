-- CreateTable
CREATE TABLE "Multisubasta" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Multisubasta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultisubastaItem" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "multisubastaId" TEXT NOT NULL,

    CONSTRAINT "MultisubastaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultisubastaComment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "offeredPrice" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MultisubastaComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Multisubasta" ADD CONSTRAINT "Multisubasta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultisubastaItem" ADD CONSTRAINT "MultisubastaItem_multisubastaId_fkey" FOREIGN KEY ("multisubastaId") REFERENCES "Multisubasta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultisubastaComment" ADD CONSTRAINT "MultisubastaComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultisubastaComment" ADD CONSTRAINT "MultisubastaComment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MultisubastaItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
