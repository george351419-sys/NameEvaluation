-- CreateTable
CREATE TABLE `Evaluation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NOT NULL,
    `givenName` VARCHAR(191) NOT NULL,
    `nameFirst` VARCHAR(191) NOT NULL,
    `nameLast` VARCHAR(191) NOT NULL,
    `birthDate` VARCHAR(191) NOT NULL,
    `isLunar` BOOLEAN NOT NULL DEFAULT false,
    `zodiacOverride` VARCHAR(191) NULL,
    `fatherSurname` VARCHAR(191) NULL,
    `fatherZodiac` VARCHAR(191) NULL,
    `motherSurname` VARCHAR(191) NULL,
    `motherZodiac` VARCHAR(191) NULL,
    `childZodiac` VARCHAR(191) NULL,
    `resultJson` LONGTEXT NOT NULL,
    `interpretation` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `founderName` VARCHAR(191) NOT NULL,
    `founderZodiac` VARCHAR(191) NULL,
    `partnerNames` VARCHAR(191) NOT NULL,
    `resultJson` LONGTEXT NOT NULL,
    `interpretation` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NamingEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NOT NULL,
    `ownZodiac` VARCHAR(191) NOT NULL,
    `fatherSurname` VARCHAR(191) NOT NULL,
    `fatherZodiac` VARCHAR(191) NULL,
    `motherSurname` VARCHAR(191) NOT NULL,
    `motherZodiac` VARCHAR(191) NOT NULL,
    `resultJson` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
