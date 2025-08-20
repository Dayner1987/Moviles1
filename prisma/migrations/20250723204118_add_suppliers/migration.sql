-- CreateTable
CREATE TABLE `roles` (
    `RolesID` INTEGER NOT NULL AUTO_INCREMENT,
    `NameRol` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`RolesID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `clientID` INTEGER NOT NULL AUTO_INCREMENT,
    `Roles_RolesID` INTEGER NOT NULL,
    `Name1` VARCHAR(20) NOT NULL,
    `Name2` VARCHAR(20) NULL,
    `LastName1` VARCHAR(20) NOT NULL,
    `LastName2` VARCHAR(20) NULL,
    `CI` INTEGER NOT NULL,
    `Address` VARCHAR(30) NOT NULL,
    `Password` VARCHAR(100) NOT NULL,

    INDEX `fk_Users_Roles_idx`(`Roles_RolesID`),
    PRIMARY KEY (`clientID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `CategoriesID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name_categories` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`CategoriesID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `ProductsID` INTEGER NOT NULL AUTO_INCREMENT,
    `CategoryID` INTEGER NOT NULL,
    `Name_product` VARCHAR(45) NOT NULL,
    `Price` FLOAT NOT NULL,
    `Description` VARCHAR(45) NOT NULL,
    `Amount` INTEGER NOT NULL,

    INDEX `fk_Products_Categories_idx`(`CategoryID`),
    PRIMARY KEY (`ProductsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `idOrders` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductID` INTEGER NOT NULL,
    `CategoryID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,
    `UserRoleID` INTEGER NOT NULL,
    `Date_order` DATE NOT NULL,
    `Status_order` VARCHAR(45) NOT NULL,
    `United_price` FLOAT NOT NULL,

    INDEX `fk_Orders_Products_idx`(`ProductID`),
    INDEX `fk_Orders_Users_idx`(`UserID`, `UserRoleID`),
    PRIMARY KEY (`idOrders`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `idSuppliers` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` INTEGER NOT NULL,

    PRIMARY KEY (`idSuppliers`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_Users_Roles` FOREIGN KEY (`Roles_RolesID`) REFERENCES `roles`(`RolesID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_Products_Categories` FOREIGN KEY (`CategoryID`) REFERENCES `categories`(`CategoriesID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_Orders_Products` FOREIGN KEY (`ProductID`) REFERENCES `products`(`ProductsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_Orders_Users` FOREIGN KEY (`UserID`) REFERENCES `users`(`clientID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
