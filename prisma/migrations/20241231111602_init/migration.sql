/*
  Warnings:

  - You are about to drop the column `catoryId` on the `book` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `book` DROP FOREIGN KEY `Book_catoryId_fkey`;

-- DropIndex
DROP INDEX `Book_catoryId_fkey` ON `book`;

-- AlterTable
ALTER TABLE `book` DROP COLUMN `catoryId`,
    ADD COLUMN `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
