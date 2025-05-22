/*
  Warnings:

  - Made the column `ScheduledFilmId` on table `session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `session` MODIFY `ScheduledFilmId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_ScheduledFilmId_fkey` FOREIGN KEY (`ScheduledFilmId`) REFERENCES `Film`(`FilmID`) ON DELETE RESTRICT ON UPDATE CASCADE;
