/*
  Warnings:

  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CategoryID` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `Status_order` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `UserRoleID` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `idOrders` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supply` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `OrdersID` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `StatusOrderID` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SupplierID` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_Orders_Products`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_Orders_Users`;

-- DropForeignKey
ALTER TABLE `supply` DROP FOREIGN KEY `Supply_productID_fkey`;

-- DropForeignKey
ALTER TABLE `supply` DROP FOREIGN KEY `Supply_supplierID_fkey`;

-- DropIndex
DROP INDEX `fk_Orders_Users_idx` ON `orders`;

-- AlterTable
ALTER TABLE `orders` DROP PRIMARY KEY,
    DROP COLUMN `CategoryID`,
    DROP COLUMN `Status_order`,
    DROP COLUMN `UserRoleID`,
    DROP COLUMN `idOrders`,
    ADD COLUMN `OrdersID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `StatusOrderID` INTEGER NOT NULL,
    ADD PRIMARY KEY (`OrdersID`);

-- AlterTable
ALTER TABLE `products` ADD COLUMN `SupplierID` INTEGER NOT NULL;

-- DropTable
DROP TABLE `supplier`;

-- DropTable
DROP TABLE `supply`;

-- CreateTable
CREATE TABLE `order_status` (
    `idEstado` INTEGER NOT NULL AUTO_INCREMENT,
    `estado` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`idEstado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `idSuppliers` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `phone` INTEGER NOT NULL,

    PRIMARY KEY (`idSuppliers`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fk_Orders_Users_idx` ON `orders`(`UserID`);

-- CreateIndex
CREATE INDEX `fk_Orders_Status_idx` ON `orders`(`StatusOrderID`);

-- CreateIndex
CREATE INDEX `fk_Products_Suppliers_idx` ON `products`(`SupplierID`);

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_Products_Suppliers` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers`(`idSuppliers`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_Orders_Products` FOREIGN KEY (`ProductID`) REFERENCES `products`(`ProductsID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_Orders_Users` FOREIGN KEY (`UserID`) REFERENCES `users`(`clientID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_Orders_Status` FOREIGN KEY (`StatusOrderID`) REFERENCES `order_status`(`idEstado`) ON DELETE RESTRICT ON UPDATE CASCADE;
