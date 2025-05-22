/*
  Warnings:

  - Made the column `FormatCode` on table `session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `session` MODIFY `FormatCode` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_FormatCode_fkey` FOREIGN KEY (`FormatCode`) REFERENCES `filFormat`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
