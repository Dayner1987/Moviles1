/*
  Warnings:

  - You are about to alter the column `name` on the `suppliers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(45)`.

*/
-- AlterTable
ALTER TABLE `suppliers` MODIFY `name` VARCHAR(45) NOT NULL;

-- CreateTable
CREATE TABLE `supplies` (
    `idSupplies` INTEGER NOT NULL AUTO_INCREMENT,
    `productID` INTEGER NOT NULL,
    `supplierID` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idSupplies`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
