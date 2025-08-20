-- Script SQL para esquema tiendabelleza (corregido y listo)

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Crear base de datos
CREATE SCHEMA IF NOT EXISTS `tiendabelleza` DEFAULT CHARACTER SET utf8;
USE `tiendabelleza`;

-- Tabla Roles
DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `RolesID` INT NOT NULL AUTO_INCREMENT,
  `NameRol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`RolesID`)
) ENGINE=InnoDB;

-- Tabla Users
DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `clientID` INT NOT NULL AUTO_INCREMENT,
  `Roles_RolesID` INT NOT NULL,
  `Name1` VARCHAR(20) NOT NULL,
  `Name2` VARCHAR(20),
  `LastName1` VARCHAR(20) NOT NULL,
  `LastName2` VARCHAR(20),
  `CI` INT NOT NULL,
  `Address` VARCHAR(30) NOT NULL,
  `Password` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`clientID`),
  INDEX `fk_Users_Roles_idx` (`Roles_RolesID`),
  CONSTRAINT `fk_Users_Roles`
    FOREIGN KEY (`Roles_RolesID`)
    REFERENCES `Roles` (`RolesID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- Tabla Categories
DROP TABLE IF EXISTS `Categories`;
CREATE TABLE `Categories` (
  `CategoriesID` INT NOT NULL AUTO_INCREMENT,
  `Name_categories` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`CategoriesID`)
) ENGINE=InnoDB;

-- Tabla Products
DROP TABLE IF EXISTS `Products`;
CREATE TABLE `Products` (
  `ProductsID` INT NOT NULL AUTO_INCREMENT,
  `CategoryID` INT NOT NULL,
  `Name_product` VARCHAR(45) NOT NULL,
  `Price` FLOAT NOT NULL,
  `Description` VARCHAR(45) NOT NULL,
  `Amount` INT NOT NULL,
  PRIMARY KEY (`ProductsID`),
  INDEX `fk_Products_Categories_idx` (`CategoryID`),
  CONSTRAINT `fk_Products_Categories`
    FOREIGN KEY (`CategoryID`)
    REFERENCES `Categories` (`CategoriesID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- Tabla Orders
DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `idOrders` INT NOT NULL AUTO_INCREMENT,
  `ProductID` INT NOT NULL,
  `CategoryID` INT NOT NULL,
  `UserID` INT NOT NULL,
  `UserRoleID` INT NOT NULL,
  `Date_order` DATE NOT NULL,
  `Status_order` VARCHAR(45) NOT NULL,
  `United_price` FLOAT NOT NULL,
  PRIMARY KEY (`idOrders`),
  INDEX `fk_Orders_Products_idx` (`ProductID`),
  INDEX `fk_Orders_Users_idx` (`UserID`, `UserRoleID`),
  CONSTRAINT `fk_Orders_Products`
    FOREIGN KEY (`ProductID`)
    REFERENCES `Products` (`ProductsID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Orders_Users`
    FOREIGN KEY (`UserID`)
    REFERENCES `Users` (`clientID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- Restaurar configuraciones originales
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
