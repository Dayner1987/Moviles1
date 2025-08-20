/*
  Warnings:

  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `suppliers`;

-- DropTable
DROP TABLE `supplies`;

-- CreateTable
CREATE TABLE `Supplier` (
    `idSuppliers` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `phone` INTEGER NOT NULL,

    PRIMARY KEY (`idSuppliers`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supply` (
    `idSupplies` INTEGER NOT NULL AUTO_INCREMENT,
    `productID` INTEGER NOT NULL,
    `supplierID` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idSupplies`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_supplierID_fkey` FOREIGN KEY (`supplierID`) REFERENCES `Supplier`(`idSuppliers`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supply` ADD CONSTRAINT `Supply_productID_fkey` FOREIGN KEY (`productID`) REFERENCES `products`(`ProductsID`) ON DELETE RESTRICT ON UPDATE CASCADE;
