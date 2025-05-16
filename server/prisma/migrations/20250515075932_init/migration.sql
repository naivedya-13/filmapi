-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_scheduledFilmId_fkey`;

-- DropIndex
DROP INDEX `Session_scheduledFilmId_fkey` ON `session`;
