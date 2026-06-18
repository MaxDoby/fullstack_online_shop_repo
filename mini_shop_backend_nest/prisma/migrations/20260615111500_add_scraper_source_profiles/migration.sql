CREATE TABLE "ScraperSourceProfile" (
    "id" SERIAL NOT NULL,
    "sourceWebsite" TEXT NOT NULL,
    "sourceBaseUrl" TEXT NOT NULL,
    "exampleSearchUrl" TEXT NOT NULL,
    "exampleSearchTerm" TEXT NOT NULL,
    "searchUrlTemplate" TEXT NOT NULL,
    "productLinkSelector" TEXT,
    "productUrlCandidates" JSONB NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScraperSourceProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScraperSourceProfile_sourceWebsite_sourceBaseUrl_key"
ON "ScraperSourceProfile"("sourceWebsite", "sourceBaseUrl");
