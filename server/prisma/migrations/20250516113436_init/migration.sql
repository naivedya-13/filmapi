-- CreateTable
CREATE TABLE `Film` (
    `id` VARCHAR(191) NOT NULL,
    `shortCode` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `rating` VARCHAR(191) NULL,
    `ratingDescription` VARCHAR(191) NULL,
    `synopsis` VARCHAR(191) NULL,
    `synopsisAlt` VARCHAR(191) NULL,
    `shortSynopsis` VARCHAR(191) NULL,
    `shortSynopsisAlt` VARCHAR(191) NULL,
    `hoFilmCode` VARCHAR(191) NULL,
    `corporateFilmId` VARCHAR(191) NULL,
    `runTime` INTEGER NULL,
    `openingDate` VARCHAR(191) NULL,
    `graphicUrl` VARCHAR(191) NULL,
    `filmNameUrl` VARCHAR(191) NULL,
    `trailerUrl` VARCHAR(191) NULL,
    `isComingSoon` BOOLEAN NOT NULL,
    `isScheduledAtCinema` BOOLEAN NOT NULL,
    `titleAlt` VARCHAR(191) NULL,
    `ratingAlt` VARCHAR(191) NULL,
    `ratingDescriptionAlt` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `genreId` VARCHAR(191) NULL,
    `genreId2` VARCHAR(191) NULL,
    `genreId3` VARCHAR(191) NULL,
    `ediCode` VARCHAR(191) NULL,
    `twitterTag` VARCHAR(191) NULL,
    `filmWebId` VARCHAR(191) NULL,
    `movieXchangeCode` VARCHAR(191) NULL,
    `distributorName` VARCHAR(191) NULL,
    `governmentCode` VARCHAR(191) NULL,
    `filmRatingStatisticsId` VARCHAR(191) NULL,
    `filmTrailerRatingStatisticsId` VARCHAR(191) NULL,

    UNIQUE INDEX `Film_filmRatingStatisticsId_key`(`filmRatingStatisticsId`),
    UNIQUE INDEX `Film_filmTrailerRatingStatisticsId_key`(`filmTrailerRatingStatisticsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilmFormatCode` (
    `id` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Translation` (
    `id` VARCHAR(191) NOT NULL,
    `languageTag` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilmAdditionalUrl` (
    `id` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `sequence` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilmRatingStatistics` (
    `id` VARCHAR(191) NOT NULL,
    `ratingCount` INTEGER NOT NULL,
    `averageScore` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilmTrailerRatingStatistics` (
    `id` VARCHAR(191) NOT NULL,
    `ratingCount` INTEGER NOT NULL,
    `ratingCountLiked` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cinema` (
    `id` VARCHAR(191) NOT NULL,
    `cinemaNationalId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAlt` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `emailAddress` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `parkingInfo` VARCHAR(191) NULL,
    `loyaltyCode` VARCHAR(191) NULL,
    `isGiftStore` BOOLEAN NULL,
    `description` VARCHAR(191) NULL,
    `descriptionAlt` VARCHAR(191) NULL,
    `publicTransport` VARCHAR(191) NULL,
    `currencyCode` VARCHAR(191) NULL,
    `allowPrintAtHomeBookings` BOOLEAN NOT NULL,
    `allowOnlineVoucherValidation` BOOLEAN NOT NULL,
    `displaySofaSeats` BOOLEAN NOT NULL,
    `timeZoneId` VARCHAR(191) NULL,
    `hopk` VARCHAR(191) NULL,
    `tipsCompulsory` BOOLEAN NOT NULL,
    `tipPercentages` VARCHAR(191) NULL,
    `serverName` VARCHAR(191) NULL,
    `primaryDataLanguage` VARCHAR(191) NULL,
    `alternateDataLanguage1` VARCHAR(191) NULL,
    `alternateDataLanguage2` VARCHAR(191) NULL,
    `alternateDataLanguage3` VARCHAR(191) NULL,
    `hasConcessions` BOOLEAN NULL,

    UNIQUE INDEX `Cinema_cinemaNationalId_key`(`cinemaNationalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduledFilm` (
    `id` VARCHAR(191) NOT NULL,
    `cinemaId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAlt` VARCHAR(191) NULL,
    `distributor` VARCHAR(191) NULL,
    `rating` VARCHAR(191) NULL,
    `ratingAlt` VARCHAR(191) NULL,
    `synopsis` VARCHAR(191) NULL,
    `synopsisAlt` VARCHAR(191) NULL,
    `openingDate` DATETIME(3) NULL,
    `filmHopk` VARCHAR(191) NULL,
    `filmHoCode` VARCHAR(191) NULL,
    `shortCode` VARCHAR(191) NULL,
    `runTime` VARCHAR(191) NULL,
    `trailerUrl` VARCHAR(191) NULL,
    `loyaltyAdvanceBookingDate` DATETIME(3) NULL,
    `advanceBookingDate` DATETIME(3) NULL,
    `hasDynamicallyPricedTickets` BOOLEAN NOT NULL,
    `isPlayThroughMarketingFilm` BOOLEAN NOT NULL,
    `parentPlayThroughFilmId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScreenAttribute` (
    `mainID` INTEGER NOT NULL AUTO_INCREMENT,
    `id` VARCHAR(191) NOT NULL,
    `cinemaId` VARCHAR(191) NOT NULL,
    `screenNumber` INTEGER NOT NULL,
    `shortName` VARCHAR(191) NULL,
    `isConcept` BOOLEAN NOT NULL,
    `description` VARCHAR(191) NULL,
    `descriptionAlt` VARCHAR(191) NULL,

    PRIMARY KEY (`mainID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attribute` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `shortName` VARCHAR(191) NULL,
    `altDescription` VARCHAR(191) NULL,
    `altShortName` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `messageAlt` VARCHAR(191) NULL,
    `warningMessage` VARCHAR(191) NULL,
    `warningMessageAlt` VARCHAR(191) NULL,
    `salesChannels` VARCHAR(191) NULL,
    `isUsedForConcepts` BOOLEAN NOT NULL,
    `isUsedForSessionAdvertising` BOOLEAN NOT NULL,
    `displayPriority` INTEGER NOT NULL,
    `isPromoted` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionAttributeCinema` (
    `id` VARCHAR(191) NOT NULL,
    `attributeId` VARCHAR(191) NOT NULL,
    `cinemaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CinemaOperator` (
    `id` VARCHAR(191) NOT NULL,
    `cinemaId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `shortName` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL,
    `hoOperatorCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `cinemaId` VARCHAR(191) NOT NULL,
    `scheduledFilmId` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `showtime` DATETIME(3) NOT NULL,
    `isAllocatedSeating` BOOLEAN NOT NULL,
    `allowChildAdmits` BOOLEAN NOT NULL,
    `seatsAvailable` INTEGER NULL,
    `allowComplimentaryTickets` BOOLEAN NOT NULL,
    `eventId` VARCHAR(191) NULL,
    `globalEventId` VARCHAR(191) NULL,
    `priceGroupCode` VARCHAR(191) NULL,
    `screenName` VARCHAR(191) NULL,
    `screenNameAlt` VARCHAR(191) NULL,
    `screenNumber` INTEGER NULL,
    `cinemaOperatorCode` VARCHAR(191) NULL,
    `formatCode` VARCHAR(191) NULL,
    `formatHOPK` VARCHAR(191) NULL,
    `salesChannels` VARCHAR(191) NULL,
    `allowTicketSales` BOOLEAN NOT NULL,
    `hasDynamicallyPricedTickets` BOOLEAN NOT NULL,
    `playThroughId` VARCHAR(191) NULL,
    `sessionBusinessDate` VARCHAR(191) NOT NULL,
    `sessionDisplayPriority` INTEGER NOT NULL,
    `groupSessionsByAttribute` BOOLEAN NOT NULL,
    `soldoutStatus` INTEGER NULL,
    `typeCode` VARCHAR(191) NULL,
    `minimumTicketPriceInCents` INTEGER NULL,
    `inSeatDeliveryFeeId` VARCHAR(191) NULL,

    UNIQUE INDEX `Session_inSeatDeliveryFeeId_key`(`inSeatDeliveryFeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionAreaCategory` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionInSeatDeliveryFee` (
    `id` VARCHAR(191) NOT NULL,
    `priceType` INTEGER NOT NULL,
    `fixedPriceInCents` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `showTime` DATETIME(3) NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `paymentMethod` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'WALLET') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaction_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seat` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `seatNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilmSynopsisTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FilmSynopsisTranslations_AB_unique`(`A`, `B`),
    INDEX `_FilmSynopsisTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilmTitleTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FilmTitleTranslations_AB_unique`(`A`, `B`),
    INDEX `_FilmTitleTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilmShortSynopsisTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FilmShortSynopsisTranslations_AB_unique`(`A`, `B`),
    INDEX `_FilmShortSynopsisTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilmRatingDescriptionTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FilmRatingDescriptionTranslations_AB_unique`(`A`, `B`),
    INDEX `_FilmRatingDescriptionTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttributeDescriptionTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttributeDescriptionTranslations_AB_unique`(`A`, `B`),
    INDEX `_AttributeDescriptionTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttributeShortNameTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttributeShortNameTranslations_AB_unique`(`A`, `B`),
    INDEX `_AttributeShortNameTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttributeMessageTranslations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttributeMessageTranslations_AB_unique`(`A`, `B`),
    INDEX `_AttributeMessageTranslations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttributeToCinema` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttributeToCinema_AB_unique`(`A`, `B`),
    INDEX `_AttributeToCinema_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttributeToSession` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttributeToSession_AB_unique`(`A`, `B`),
    INDEX `_AttributeToSession_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Film` ADD CONSTRAINT `Film_filmRatingStatisticsId_fkey` FOREIGN KEY (`filmRatingStatisticsId`) REFERENCES `FilmRatingStatistics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Film` ADD CONSTRAINT `Film_filmTrailerRatingStatisticsId_fkey` FOREIGN KEY (`filmTrailerRatingStatisticsId`) REFERENCES `FilmTrailerRatingStatistics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilmFormatCode` ADD CONSTRAINT `FilmFormatCode_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilmAdditionalUrl` ADD CONSTRAINT `FilmAdditionalUrl_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduledFilm` ADD CONSTRAINT `ScheduledFilm_cinemaId_fkey` FOREIGN KEY (`cinemaId`) REFERENCES `Cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduledFilm` ADD CONSTRAINT `ScheduledFilm_parentPlayThroughFilmId_fkey` FOREIGN KEY (`parentPlayThroughFilmId`) REFERENCES `ScheduledFilm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScreenAttribute` ADD CONSTRAINT `ScreenAttribute_cinemaId_fkey` FOREIGN KEY (`cinemaId`) REFERENCES `Cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAttributeCinema` ADD CONSTRAINT `SessionAttributeCinema_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `Attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CinemaOperator` ADD CONSTRAINT `CinemaOperator_cinemaId_fkey` FOREIGN KEY (`cinemaId`) REFERENCES `Cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_cinemaId_fkey` FOREIGN KEY (`cinemaId`) REFERENCES `Cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_inSeatDeliveryFeeId_fkey` FOREIGN KEY (`inSeatDeliveryFeeId`) REFERENCES `SessionInSeatDeliveryFee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAreaCategory` ADD CONSTRAINT `SessionAreaCategory_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmSynopsisTranslations` ADD CONSTRAINT `_FilmSynopsisTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmSynopsisTranslations` ADD CONSTRAINT `_FilmSynopsisTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmTitleTranslations` ADD CONSTRAINT `_FilmTitleTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmTitleTranslations` ADD CONSTRAINT `_FilmTitleTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmShortSynopsisTranslations` ADD CONSTRAINT `_FilmShortSynopsisTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmShortSynopsisTranslations` ADD CONSTRAINT `_FilmShortSynopsisTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmRatingDescriptionTranslations` ADD CONSTRAINT `_FilmRatingDescriptionTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmRatingDescriptionTranslations` ADD CONSTRAINT `_FilmRatingDescriptionTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeDescriptionTranslations` ADD CONSTRAINT `_AttributeDescriptionTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeDescriptionTranslations` ADD CONSTRAINT `_AttributeDescriptionTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeShortNameTranslations` ADD CONSTRAINT `_AttributeShortNameTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeShortNameTranslations` ADD CONSTRAINT `_AttributeShortNameTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeMessageTranslations` ADD CONSTRAINT `_AttributeMessageTranslations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeMessageTranslations` ADD CONSTRAINT `_AttributeMessageTranslations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Translation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeToCinema` ADD CONSTRAINT `_AttributeToCinema_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeToCinema` ADD CONSTRAINT `_AttributeToCinema_B_fkey` FOREIGN KEY (`B`) REFERENCES `Cinema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeToSession` ADD CONSTRAINT `_AttributeToSession_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttributeToSession` ADD CONSTRAINT `_AttributeToSession_B_fkey` FOREIGN KEY (`B`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
