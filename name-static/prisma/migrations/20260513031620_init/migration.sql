-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "nameFirst" TEXT NOT NULL,
    "nameLast" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "isLunar" BOOLEAN NOT NULL DEFAULT false,
    "fatherSurname" TEXT,
    "fatherZodiac" TEXT,
    "motherSurname" TEXT,
    "motherZodiac" TEXT,
    "childZodiac" TEXT,
    "resultJson" TEXT NOT NULL,
    "interpretation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
