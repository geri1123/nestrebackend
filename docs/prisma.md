## Prisma Schema (Domain Overview)

Purpose:
- Define the relational MySQL schema for the Real Estate platform
- Used by Prisma Client for typed DB access

Datasource:
- Provider: `mysql`
- URL: `env("DATABASE_URL")`

Main entities:
- `user` → platform users (role, status, profile, wallet, login info)
- `agency` → real estate agencies (owner user, license, status)
- `agencyagent` → relation between agencies and agent users (role in agency, status, commission)
- `agencyagent_permission` → fine-grained agent permissions inside an agency
- `product` → property listings (city, agency/user, subcategory, listing type)
- `productimage` → images attached to products (URL + Cloudinary publicId)
- `attribute`, `attribute_value`, translations → dynamic product attributes (multi-language)
- `category` / `subcategory` + translations → classification of products
- `listing_type` + translations → e.g. for-sale / for-rent (multi-language)
- `notification` / `notificationtranslation` → user notifications (localized messages)
- `registrationrequest` → agency / agent / role change requests & review info
- `SavedProduct` → user saved / favorite products
- `Wallet` / `WalletTransaction` → user wallet & transaction history
- `ProductAdvertisement` → paid product ads (status, adType, links to wallet transactions)
- `AdvertisementPricing` → pricing config for advertisement types
- `usernamehistory` → historical record of username changes
- `city` / `country` → geo data for products

Enums:
- `LanguageCode` → `en`, `al`, `it` (localization)
- `user_role` → `user`, `agency_owner`, `agent`
- `user_status` → `active`, `inactive`, `pending`, `suspended`
- `agency_status`, `agencyagent_status` → lifecycle of agency / agency agents
- `registrationrequest_status` / `registrationrequest_request_type` / `registrationrequest_requested_role`
- `product_status` → `active`, `inactive`, `draft`, `sold`, `pending`
- `advertisement_type` → `cheap`, `normal`, `premium`
- `advertisement_status` → `active`, `inactive`, `expired`, `pending`
- `wallet_transaction_type` → `topup`, `withdraw`, `purchase`
- `NotificationStatus` → `unread`, `read`

Why:
- Gives a clear picture of the data model
- Helps understand relations between modules (users, agencies, products, wallet, ads)
- Useful when writing use-cases, repositories and migrations