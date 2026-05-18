-- CreateTable
CREATE TABLE "NamingEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surname" TEXT NOT NULL,
    "ownZodiac" TEXT NOT NULL,
    "fatherSurname" TEXT NOT NULL,
    "fatherZodiac" TEXT,
    "motherSurname" TEXT NOT NULL,
    "motherZodiac" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
