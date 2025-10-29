-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_Products_Categories`;

-- DropIndex
DROP INDEX `fk_Products_Categories_idx` ON `products`;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_CategoryID_fkey` FOREIGN KEY (`CategoryID`) REFERENCES `categories`(`CategoriesID`) ON DELETE CASCADE ON UPDATE CASCADE;
