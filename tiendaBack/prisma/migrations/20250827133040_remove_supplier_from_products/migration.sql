/*
  Warnings:

  - You are about to drop the column `SupplierID` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `fk_Products_Suppliers_idx` ON `products`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `SupplierID`;
