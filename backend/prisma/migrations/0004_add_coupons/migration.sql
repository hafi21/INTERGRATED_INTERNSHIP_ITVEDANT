-- CreateTable
CREATE TABLE `coupons` (
    `coupon_id` INTEGER NOT NULL AUTO_INCREMENT,
    `coupon_code` VARCHAR(50) NOT NULL,
    `discount_type` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `valid_from` DATETIME(3) NOT NULL,
    `valid_to` DATETIME(3) NOT NULL,
    `usage_limit` INTEGER NOT NULL,
    `minimum_order_amount` DECIMAL(10, 2) NULL,
    `applicable_product_ids` JSON NULL,
    `applicable_category_ids` JSON NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupons_coupon_code_key`(`coupon_code`),
    INDEX `idx_coupons_status`(`status`),
    INDEX `idx_coupons_validity`(`valid_from`, `valid_to`),
    PRIMARY KEY (`coupon_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `orders`
    ADD COLUMN `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `coupon_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `idx_orders_coupon_id` ON `orders`(`coupon_id`);

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`coupon_id`) ON DELETE SET NULL ON UPDATE CASCADE;
