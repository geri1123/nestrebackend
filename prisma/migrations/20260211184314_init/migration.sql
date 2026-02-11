/*
  Warnings:

  - You are about to drop the `AdvertisementPricing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAdvertisement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ProductAdvertisement` DROP FOREIGN KEY `ProductAdvertisement_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductAdvertisement` DROP FOREIGN KEY `ProductAdvertisement_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductAdvertisement` DROP FOREIGN KEY `ProductAdvertisement_walletTxId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedProduct` DROP FOREIGN KEY `SavedProduct_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `SavedProduct` DROP FOREIGN KEY `SavedProduct_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Wallet` DROP FOREIGN KEY `Wallet_userId_fkey`;

-- DropForeignKey
ALTER TABLE `WalletTransaction` DROP FOREIGN KEY `WalletTransaction_walletId_fkey`;

-- AlterTable
ALTER TABLE `notificationtranslation` MODIFY `message` TEXT NOT NULL;

-- DropTable
DROP TABLE `AdvertisementPricing`;

-- DropTable
DROP TABLE `ProductAdvertisement`;

-- DropTable
DROP TABLE `SavedProduct`;

-- DropTable
DROP TABLE `Wallet`;

-- DropTable
DROP TABLE `WalletTransaction`;

-- CreateTable
CREATE TABLE `savedproduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `saved_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `savedproduct_user_id_product_id_key`(`user_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallet_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallettransaction` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `type` ENUM('topup', 'withdraw', 'purchase') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `balanceAfter` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productadvertisement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `walletTxId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,
    `status` ENUM('active', 'inactive', 'expired', 'pending') NOT NULL DEFAULT 'active',
    `adType` ENUM('cheap', 'normal', 'premium') NOT NULL DEFAULT 'normal',

    UNIQUE INDEX `productadvertisement_walletTxId_key`(`walletTxId`),
    INDEX `productadvertisement_productId_idx`(`productId`),
    INDEX `productadvertisement_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advertisementpricing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adType` ENUM('cheap', 'normal', 'premium') NOT NULL,
    `price` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `discount` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `advertisementpricing_adType_key`(`adType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `savedproduct` ADD CONSTRAINT `savedproduct_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `savedproduct` ADD CONSTRAINT `savedproduct_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallettransaction` ADD CONSTRAINT `wallettransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productadvertisement` ADD CONSTRAINT `productadvertisement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productadvertisement` ADD CONSTRAINT `productadvertisement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productadvertisement` ADD CONSTRAINT `productadvertisement_walletTxId_fkey` FOREIGN KEY (`walletTxId`) REFERENCES `wallettransaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
