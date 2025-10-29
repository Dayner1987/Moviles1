-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_CategoryID_fkey`;

-- DropIndex
DROP INDEX `products_CategoryID_fkey` ON `products`;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_Products_Categories` FOREIGN KEY (`CategoryID`) REFERENCES `categories`(`CategoriesID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
