-- DropForeignKey
ALTER TABLE "attribute_translation" DROP CONSTRAINT "attr_translation_attr_id_fkey";

-- DropForeignKey
ALTER TABLE "attribute_value_translations" DROP CONSTRAINT "attr_val_translation_fkey";

-- DropForeignKey
ALTER TABLE "categorytranslation" DROP CONSTRAINT "cattranslation_category_id_fkey";

-- DropForeignKey
ALTER TABLE "listing_type_translation" DROP CONSTRAINT "listingtype_translation_fkey";

-- DropForeignKey
ALTER TABLE "productattributevalue" DROP CONSTRAINT "prodattrval_product_id_fkey";

-- DropForeignKey
ALTER TABLE "productimage" DROP CONSTRAINT "productimage_product_id_fkey";

-- DropForeignKey
ALTER TABLE "savedproduct" DROP CONSTRAINT "savedproduct_product_fk";

-- DropForeignKey
ALTER TABLE "savedproduct" DROP CONSTRAINT "savedproduct_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subcategorytranslation" DROP CONSTRAINT "subcattranslation_subcat_id_fkey";

-- DropForeignKey
ALTER TABLE "usernamehistory" DROP CONSTRAINT "usernamehistory_user_id_fkey";

-- AddForeignKey
ALTER TABLE "attribute_translation" ADD CONSTRAINT "attr_translation_attr_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_value_translations" ADD CONSTRAINT "attr_val_translation_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorytranslation" ADD CONSTRAINT "cattranslation_category_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_type_translation" ADD CONSTRAINT "listingtype_translation_fkey" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategorytranslation" ADD CONSTRAINT "subcattranslation_subcat_id_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usernamehistory" ADD CONSTRAINT "usernamehistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productattributevalue" ADD CONSTRAINT "prodattrval_product_id_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productimage" ADD CONSTRAINT "productimage_product_id_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedproduct" ADD CONSTRAINT "savedproduct_product_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedproduct" ADD CONSTRAINT "savedproduct_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
