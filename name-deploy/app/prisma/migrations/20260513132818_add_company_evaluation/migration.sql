-- CreateTable
CREATE TABLE "CompanyEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "founderName" TEXT NOT NULL,
    "founderZodiac" TEXT,
    "partnerNames" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "interpretation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
