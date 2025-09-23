-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_ProductID_fkey`;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `products`(`ProductsID`) ON DELETE CASCADE ON UPDATE CASCADE;
