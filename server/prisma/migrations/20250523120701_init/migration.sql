/*
  Warnings:

  - You are about to drop the column `filmId` on the `booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[SessionId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `SessionId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `SessionId` on table `session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_filmId_fkey`;

-- DropIndex
DROP INDEX `Booking_filmId_fkey` ON `booking`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `filmId`,
    ADD COLUMN `SessionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `session` MODIFY `SessionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Session_SessionId_key` ON `Session`(`SessionId`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_SessionId_fkey` FOREIGN KEY (`SessionId`) REFERENCES `Session`(`SessionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
