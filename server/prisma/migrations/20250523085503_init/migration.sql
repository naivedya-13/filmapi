/*
  Warnings:

  - Made the column `ScreenName` on table `session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `session` MODIFY `ScreenName` VARCHAR(191) NOT NULL;
