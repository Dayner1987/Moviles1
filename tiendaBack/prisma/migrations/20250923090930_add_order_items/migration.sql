/*
  Warnings:

  - You are about to drop the column `ProductID` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_Orders_Products`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_Orders_Status`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_Orders_Users`;

-- DropIndex
DROP INDEX `fk_Orders_Products_idx` ON `orders`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `ProductID`;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `OrderID` INTEGER NOT NULL,
    `ProductID` INTEGER NOT NULL,
    `Quantity` INTEGER NOT NULL,
    `Price` DOUBLE NOT NULL,

    INDEX `order_items_OrderID_idx`(`OrderID`),
    INDEX `order_items_ProductID_idx`(`ProductID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `users`(`clientID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_StatusOrderID_fkey` FOREIGN KEY (`StatusOrderID`) REFERENCES `order_status`(`idEstado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_OrderID_fkey` FOREIGN KEY (`OrderID`) REFERENCES `orders`(`OrdersID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `products`(`ProductsID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `orders_StatusOrderID_idx` ON `orders`(`StatusOrderID`);
DROP INDEX `fk_Orders_Status_idx` ON `orders`;

-- RedefineIndex
CREATE INDEX `orders_UserID_idx` ON `orders`(`UserID`);
DROP INDEX `fk_Orders_Users_idx` ON `orders`;
