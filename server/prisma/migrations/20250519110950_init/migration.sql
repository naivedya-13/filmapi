/*
  Warnings:

  - You are about to drop the `seat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `seats` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `seat` DROP FOREIGN KEY `Seat_bookingId_fkey`;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `seats` JSON NOT NULL;

-- AlterTable
ALTER TABLE `film` ADD COLUMN `ticketPrice` INTEGER NOT NULL DEFAULT 100;

-- DropTable
DROP TABLE `seat`;
