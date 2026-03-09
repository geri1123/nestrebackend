-- CreateEnum
CREATE TYPE "advertisement_type" AS ENUM ('cheap', 'normal', 'premium');

-- CreateEnum
CREATE TYPE "advertisement_status" AS ENUM ('active', 'inactive', 'expired', 'pending');

-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('en', 'al', 'it');

-- CreateEnum
CREATE TYPE "wallettransaction_type" AS ENUM ('topup', 'withdraw', 'purchase');

-- CreateEnum
CREATE TYPE "registrationrequest_request_type" AS ENUM ('agent_license_verification', 'agency_registration', 'role_change_request');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read');

-- CreateEnum
CREATE TYPE "agencyagent_role_in_agency" AS ENUM ('agent', 'senior_agent', 'team_lead');

-- CreateEnum
CREATE TYPE "registrationrequest_status" AS ENUM ('pending', 'approved', 'rejected', 'under_review');

-- CreateEnum
CREATE TYPE "agency_status" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "agencyagent_status" AS ENUM ('active', 'inactive', 'terminated');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'agency_owner', 'agent');

-- CreateEnum
CREATE TYPE "registrationrequest_requested_role" AS ENUM ('agent', 'senior_agent', 'team_lead');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('active', 'inactive', 'draft', 'sold', 'pending');

-- CreateTable
CREATE TABLE "agency" (
    "id" SERIAL NOT NULL,
    "agency_name" TEXT NOT NULL,
    "public_code" TEXT,
    "logo" TEXT,
    "logo_public_id" TEXT,
    "license_number" TEXT NOT NULL,
    "agency_email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "status" "agency_status" NOT NULL DEFAULT 'active',
    "owner_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyagent" (
    "id" SERIAL NOT NULL,
    "agency_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "added_by" INTEGER,
    "id_card_number" TEXT,
    "role_in_agency" "agencyagent_role_in_agency" NOT NULL DEFAULT 'agent',
    "commission_rate" DECIMAL(5,2),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "agencyagent_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "agencyagent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" SERIAL NOT NULL,
    "subcategoryId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_translation" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "attribute_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "value_code" TEXT NOT NULL,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_value_translations" (
    "id" SERIAL NOT NULL,
    "attribute_value_id" INTEGER NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "attribute_value_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorytranslation" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "categorytranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_type" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "listing_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_type_translation" (
    "id" SERIAL NOT NULL,
    "listingTypeId" INTEGER NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "name" TEXT,
    "slug" TEXT,

    CONSTRAINT "listing_type_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificationtranslation" (
    "id" SERIAL NOT NULL,
    "notificationId" INTEGER NOT NULL,
    "languageCode" "LanguageCode" NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "notificationtranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrationrequest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" "registrationrequest_request_type" NOT NULL,
    "agency_name" TEXT,
    "agency_id" INTEGER,
    "supporting_documents" TEXT,
    "status" "registrationrequest_status" NOT NULL DEFAULT 'pending',
    "reviewed_by" INTEGER,
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "requested_role" "registrationrequest_requested_role",
    "license_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "registrationrequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategory" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategorytranslation" (
    "id" SERIAL NOT NULL,
    "subcategoryId" INTEGER NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "subcategorytranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "about_me" TEXT,
    "profile_img_url" TEXT,
    "profile_img_public_id" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "role" "user_role" NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'active',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_user" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "last_login" TIMESTAMP(3),
    "last_active" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usernamehistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "old_username" TEXT NOT NULL,
    "new_username" TEXT NOT NULL,
    "next_username_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usernamehistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "cityId" INTEGER NOT NULL,
    "agencyId" INTEGER,
    "userId" INTEGER NOT NULL,
    "subcategoryId" INTEGER NOT NULL,
    "listingTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "streetAddress" TEXT,
    "area" INTEGER,
    "buildYear" INTEGER,
    "status" "product_status" NOT NULL DEFAULT 'draft',
    "clickCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productattributevalue" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "attributeValueId" INTEGER NOT NULL,

    CONSTRAINT "productattributevalue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productimage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "publicId" TEXT,

    CONSTRAINT "productimage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyagent_permission" (
    "id" SERIAL NOT NULL,
    "agency_agent_id" INTEGER NOT NULL,
    "agency_id" INTEGER NOT NULL,
    "can_edit_own_post" BOOLEAN NOT NULL DEFAULT true,
    "can_edit_others_post" BOOLEAN NOT NULL DEFAULT false,
    "can_approve_requests" BOOLEAN NOT NULL DEFAULT false,
    "can_view_all_posts" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_posts" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_agents" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "agencyagent_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savedproduct" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savedproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallettransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "wallettransaction_type" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallettransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productadvertisement" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "walletTxId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "advertisement_status" NOT NULL DEFAULT 'active',
    "adType" "advertisement_type" NOT NULL DEFAULT 'normal',

    CONSTRAINT "productadvertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisementpricing" (
    "id" SERIAL NOT NULL,
    "adType" "advertisement_type" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisementpricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agency_public_code_key" ON "agency"("public_code");

-- CreateIndex
CREATE UNIQUE INDEX "agency_license_number_key" ON "agency"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "agency_owner_user_id_key" ON "agency"("owner_user_id");

-- CreateIndex
CREATE INDEX "agency_agency_name_idx" ON "agency"("agency_name");

-- CreateIndex
CREATE INDEX "agency_public_code_idx" ON "agency"("public_code");

-- CreateIndex
CREATE INDEX "agency_created_at_idx" ON "agency"("created_at");

-- CreateIndex
CREATE INDEX "agency_status_idx" ON "agency"("status");

-- CreateIndex
CREATE UNIQUE INDEX "agencyagent_id_card_number_key" ON "agencyagent"("id_card_number");

-- CreateIndex
CREATE INDEX "AgencyAgent_added_by_fkey" ON "agencyagent"("added_by");

-- CreateIndex
CREATE INDEX "AgencyAgent_agent_id_fkey" ON "agencyagent"("agent_id");

-- CreateIndex
CREATE INDEX "AgencyAgent_agency_id_fkey" ON "agencyagent"("agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "agencyagent_agency_id_agent_id_key" ON "agencyagent"("agency_id", "agent_id");

-- CreateIndex
CREATE INDEX "attributes_subcategoryId_fkey" ON "attributes"("subcategoryId");

-- CreateIndex
CREATE INDEX "attribute_translation_attribute_id_fkey" ON "attribute_translation"("attribute_id");

-- CreateIndex
CREATE INDEX "attribute_values_attribute_id_fkey" ON "attribute_values"("attribute_id");

-- CreateIndex
CREATE INDEX "attribute_value_translations_attribute_value_id_fkey" ON "attribute_value_translations"("attribute_value_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cattranslation_categoryid_language_key" ON "categorytranslation"("categoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "listingtype_translation_unique" ON "listing_type_translation"("listingTypeId", "language");

-- CreateIndex
CREATE INDEX "Notification_userId_fkey" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "NotificationTranslation_notificationId_fkey" ON "notificationtranslation"("notificationId");

-- CreateIndex
CREATE INDEX "RegistrationRequest_agency_id_idx" ON "registrationrequest"("agency_id");

-- CreateIndex
CREATE INDEX "RegistrationRequest_request_type_idx" ON "registrationrequest"("request_type");

-- CreateIndex
CREATE INDEX "RegistrationRequest_reviewed_by_idx" ON "registrationrequest"("reviewed_by");

-- CreateIndex
CREATE INDEX "RegistrationRequest_status_idx" ON "registrationrequest"("status");

-- CreateIndex
CREATE INDEX "RegistrationRequest_user_id_idx" ON "registrationrequest"("user_id");

-- CreateIndex
CREATE INDEX "registrationrequest_request_type_status_idx" ON "registrationrequest"("request_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "subcategory_slug_key" ON "subcategory"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_fkey" ON "subcategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "subcattranslation_subcat_language_key" ON "subcategorytranslation"("subcategoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE INDEX "user_role_status_idx" ON "user"("role", "status");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "user"("created_at");

-- CreateIndex
CREATE INDEX "user_last_active_idx" ON "user"("last_active");

-- CreateIndex
CREATE INDEX "UsernameHistory_user_id_idx" ON "usernamehistory"("user_id");

-- CreateIndex
CREATE INDEX "City_countryId_fkey" ON "city"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "country_name_key" ON "country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE INDEX "Product_agencyId_fkey" ON "product"("agencyId");

-- CreateIndex
CREATE INDEX "Product_cityId_fkey" ON "product"("cityId");

-- CreateIndex
CREATE INDEX "Product_listingTypeId_fkey" ON "product"("listingTypeId");

-- CreateIndex
CREATE INDEX "Product_subcategoryId_fkey" ON "product"("subcategoryId");

-- CreateIndex
CREATE INDEX "Product_userId_fkey" ON "product"("userId");

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");

-- CreateIndex
CREATE INDEX "product_createdAt_idx" ON "product"("createdAt");

-- CreateIndex
CREATE INDEX "product_status_createdAt_idx" ON "product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "product_cityId_status_idx" ON "product"("cityId", "status");

-- CreateIndex
CREATE INDEX "product_subcategoryId_status_idx" ON "product"("subcategoryId", "status");

-- CreateIndex
CREATE INDEX "product_agencyId_status_idx" ON "product"("agencyId", "status");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_attributeId_fkey" ON "productattributevalue"("attributeId");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_attributeValueId_fkey" ON "productattributevalue"("attributeValueId");

-- CreateIndex
CREATE UNIQUE INDEX "prodattrval_unique" ON "productattributevalue"("productId", "attributeId", "attributeValueId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_fkey" ON "productimage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_userId_fkey" ON "productimage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agencyagent_permission_agency_agent_id_key" ON "agencyagent_permission"("agency_agent_id");

-- CreateIndex
CREATE INDEX "agencyagent_permission_agency_id_fkey" ON "agencyagent_permission"("agency_id");

-- CreateIndex
CREATE INDEX "savedproduct_product_id_fkey" ON "savedproduct"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "savedproduct_user_id_product_id_key" ON "savedproduct"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE INDEX "wallettransaction_walletId_fkey" ON "wallettransaction"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "productadvertisement_walletTxId_key" ON "productadvertisement"("walletTxId");

-- CreateIndex
CREATE INDEX "productadvertisement_productId_idx" ON "productadvertisement"("productId");

-- CreateIndex
CREATE INDEX "productadvertisement_userId_idx" ON "productadvertisement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "advertisementpricing_adType_key" ON "advertisementpricing"("adType");

-- AddForeignKey
ALTER TABLE "agency" ADD CONSTRAINT "agency_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyagent" ADD CONSTRAINT "agencyagent_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyagent" ADD CONSTRAINT "agencyagent_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyagent" ADD CONSTRAINT "agencyagent_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attr_subcategory_id_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_translation" ADD CONSTRAINT "attr_translation_attr_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attr_value_attr_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_value_translations" ADD CONSTRAINT "attr_val_translation_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorytranslation" ADD CONSTRAINT "cattranslation_category_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_type_translation" ADD CONSTRAINT "listingtype_translation_fkey" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationtranslation" ADD CONSTRAINT "notiftranslation_notif_id_fkey" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrationrequest" ADD CONSTRAINT "regrequest_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrationrequest" ADD CONSTRAINT "regrequest_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrationrequest" ADD CONSTRAINT "regrequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_category_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategorytranslation" ADD CONSTRAINT "subcattranslation_subcat_id_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usernamehistory" ADD CONSTRAINT "usernamehistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_country_id_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_agency_id_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_city_id_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_listing_type_id_fkey" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_subcategory_id_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productattributevalue" ADD CONSTRAINT "prodattrval_attr_id_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productattributevalue" ADD CONSTRAINT "prodattrval_attrval_id_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "attribute_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productattributevalue" ADD CONSTRAINT "prodattrval_product_id_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productimage" ADD CONSTRAINT "productimage_product_id_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productimage" ADD CONSTRAINT "productimage_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyagent_permission" ADD CONSTRAINT "agentperm_agent_id_fkey" FOREIGN KEY ("agency_agent_id") REFERENCES "agencyagent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyagent_permission" ADD CONSTRAINT "agentperm_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedproduct" ADD CONSTRAINT "savedproduct_product_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedproduct" ADD CONSTRAINT "savedproduct_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallettransaction" ADD CONSTRAINT "wallettx_wallet_id_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productadvertisement" ADD CONSTRAINT "productad_product_id_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productadvertisement" ADD CONSTRAINT "productad_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productadvertisement" ADD CONSTRAINT "productad_wallettx_id_fkey" FOREIGN KEY ("walletTxId") REFERENCES "wallettransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
