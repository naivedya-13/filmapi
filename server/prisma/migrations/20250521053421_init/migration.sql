-- CreateTable
CREATE TABLE `Film` (
    `ID` VARCHAR(191) NOT NULL,
    `FilmID` VARCHAR(191) NOT NULL,
    `ShortCode` VARCHAR(191) NULL,
    `Title` VARCHAR(191) NULL,
    `Rating` VARCHAR(191) NULL,
    `RatingDescription` VARCHAR(255) NULL,
    `Synopsis` VARCHAR(255) NULL,
    `SynopsisAlt` VARCHAR(255) NULL,
    `ShortSynopsis` VARCHAR(255) NULL,
    `HOFilmCode` VARCHAR(191) NULL,
    `CorporateFilmId` VARCHAR(191) NULL,
    `RunTime` INTEGER NULL,
    `OpeningDate` VARCHAR(191) NULL,
    `GraphicUrl` VARCHAR(191) NULL,
    `FilmNameUrl` VARCHAR(191) NULL,
    `TrailerUrl` VARCHAR(191) NULL,
    `IsComingSoon` BOOLEAN NOT NULL,
    `IsScheduledAtCinema` BOOLEAN NOT NULL,
    `TitleAlt` VARCHAR(191) NULL,
    `RatingAlt` VARCHAR(191) NULL,
    `RatingDescriptionAlt` VARCHAR(255) NULL,
    `ShortSynopsisAlt` VARCHAR(255) NULL,
    `WebsiteUrl` VARCHAR(191) NULL,
    `GenreId` VARCHAR(191) NULL,
    `GenreId2` VARCHAR(191) NULL,
    `GenreId3` VARCHAR(191) NULL,
    `EDICode` VARCHAR(191) NULL,
    `TwitterTag` VARCHAR(191) NULL,
    `FilmWebId` VARCHAR(191) NULL,
    `MovieXchangeCode` VARCHAR(191) NULL,
    `DistributorName` VARCHAR(191) NULL,
    `GovernmentCode` VARCHAR(191) NULL,
    `SynopsisTranslations` JSON NULL,
    `TitleTranslations` JSON NULL,
    `ShortSynopsisTranslations` JSON NULL,
    `RatingDescriptionTranslations` JSON NULL,
    `AdditionalUrls` JSON NULL,
    `FormatCodes` JSON NULL,
    `CustomerRatingStatistics` JSON NULL,
    `CustomerRatingTrailerStatistics` JSON NULL,
    `ticketPrice` INTEGER NOT NULL,

    UNIQUE INDEX `Film_FilmID_key`(`FilmID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cinema` (
    `CinemaID` VARCHAR(191) NOT NULL,
    `CinemaNationalId` VARCHAR(191) NULL,
    `Name` VARCHAR(191) NULL,
    `NameAlt` VARCHAR(191) NULL,
    `ScheduledFilm` JSON NULL,
    `MinimumTicketPriceInCents` INTEGER NULL,
    `Showtime` VARCHAR(191) NULL,
    `IsAllocatedSeating` VARCHAR(191) NULL,
    `AllowChildAdmits` VARCHAR(191) NULL,
    `SeatsAvailable` INTEGER NULL,
    `AllowComplimentaryTickets` VARCHAR(191) NULL,
    `EventId` VARCHAR(191) NULL,
    `GlobalEventId` VARCHAR(191) NULL,
    `PriceGroupCode` VARCHAR(191) NULL,
    `ScreenName` VARCHAR(191) NULL,
    `ScreenNameAlt` VARCHAR(191) NULL,
    `ScreenNumber` INTEGER NULL,
    `CinemaOperatorCode` VARCHAR(191) NULL,
    `FormatCode` VARCHAR(191) NULL,
    `FormatHOPK` VARCHAR(191) NULL,
    `SalesChannels` VARCHAR(191) NULL,
    `Attributes` JSON NULL,
    `ShortNameTranslations` JSON NULL,
    `MessageTranslations` JSON NULL,
    `SessionAttributeCinemaIDs` JSON NULL,
    `IsPromoted` VARCHAR(191) NULL,
    `SessionAttributesNames` JSON NULL,
    `ConceptAttributesNames` JSON NULL,
    `AllowTicketSales` VARCHAR(191) NULL,
    `HasDynamicallyPricedTicketsAvailable` VARCHAR(191) NULL,
    `PlayThroughId` VARCHAR(191) NULL,
    `SessionBusinessDate` VARCHAR(191) NULL,
    `SessionDisplayPriority` INTEGER NULL,
    `GroupSessionsByAttribute` VARCHAR(191) NULL,
    `SoldoutStatus` VARCHAR(191) NULL,
    `TypeCode` VARCHAR(191) NULL,
    `InSeatDeliveryFee` JSON NULL,
    `FirstDaysSessions` JSON NULL,

    PRIMARY KEY (`CinemaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Screen` (
    `ID` VARCHAR(191) NOT NULL,
    `ScreenID` VARCHAR(191) NOT NULL,
    `AttributeID` VARCHAR(191) NULL,
    `CinemaId` VARCHAR(191) NULL,
    `ScreenNumber` INTEGER NULL,
    `ShortName` VARCHAR(191) NULL,
    `IsConcept` VARCHAR(191) NULL,
    `Description` VARCHAR(191) NULL,
    `DescriptionAlt` VARCHAR(191) NULL,

    UNIQUE INDEX `Screen_ScreenID_key`(`ScreenID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `ID` VARCHAR(191) NOT NULL,
    `CinemaId` VARCHAR(191) NOT NULL,
    `ScheduledFilmId` VARCHAR(191) NULL,
    `SessionId` VARCHAR(191) NULL,
    `AreaCategoryCodes` JSON NULL,
    `MinimumTicketPriceInCents` INTEGER NULL,
    `Showtime` VARCHAR(191) NULL,
    `IsAllocatedSeating` VARCHAR(191) NULL,
    `AllowChildAdmits` VARCHAR(191) NULL,
    `SeatsAvailable` INTEGER NULL,
    `AllowComplimentaryTickets` VARCHAR(191) NULL,
    `EventId` VARCHAR(191) NULL,
    `GlobalEventId` VARCHAR(191) NULL,
    `PriceGroupCode` VARCHAR(191) NULL,
    `ScreenName` VARCHAR(191) NULL,
    `ScreenNameAlt` VARCHAR(191) NULL,
    `ScreenNumber` INTEGER NULL,
    `CinemaOperatorCode` VARCHAR(191) NULL,
    `FormatCode` VARCHAR(191) NULL,
    `FormatHOPK` VARCHAR(191) NULL,
    `SalesChannels` VARCHAR(191) NULL,
    `Attributes` JSON NULL,
    `SessionAttributesNames` JSON NULL,
    `ConceptAttributesNames` JSON NULL,
    `AllowTicketSales` VARCHAR(191) NULL,
    `HasDynamicallyPricedTicketsAvailable` VARCHAR(191) NULL,
    `PlayThroughId` VARCHAR(191) NULL,
    `SessionBusinessDate` VARCHAR(191) NULL,
    `SessionDisplayPriority` VARCHAR(191) NULL,
    `GroupSessionsByAttribute` VARCHAR(191) NULL,
    `SoldoutStatus` INTEGER NULL,
    `TypeCode` VARCHAR(191) NULL,
    `InSeatDeliveryFee` JSON NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `ID` VARCHAR(191) NOT NULL,
    `filmId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `showTime` VARCHAR(191) NOT NULL,
    `seats` JSON NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `Bookingstatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `Transactionstatus` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_CinemaId_fkey` FOREIGN KEY (`CinemaId`) REFERENCES `Cinema`(`CinemaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`FilmID`) ON DELETE RESTRICT ON UPDATE CASCADE;
