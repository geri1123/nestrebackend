-- DropForeignKey
ALTER TABLE "productadvertisement" DROP CONSTRAINT "productad_product_id_fkey";

-- CreateIndex
CREATE INDEX "wallettransaction_walletId_createdAt_idx" ON "wallettransaction"("walletId", "createdAt");

-- AddForeignKey
ALTER TABLE "productadvertisement" ADD CONSTRAINT "productad_product_id_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
