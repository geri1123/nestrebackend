## Advertising Module (Domain Overview)

Purpose:
- Allow users to promote their property listings using paid advertisements
- Charge ads from the user wallet with full transactional safety
- Control visibility and duration of promoted listings

Core entities:
- `ProductAdvertisement` → stores an ad for a product (status, type, dates, walletTxId)
- `AdvertisementPricing` → config table for ad price, duration, discount, active flag
- `Wallet` / `WalletTransaction` → source of funds for purchasing advertisements
- `product` → listing being advertised (must be active and owned by the buyer)
- `user` → ad owner / wallet owner

Ad types (enum: `advertisement_type`):
- `cheap` → low price, shorter duration
- `normal` → default plan
- `premium` → higher price, longer duration / better visibility

Ad status (enum: `advertisement_status`):
- `active` → currently running
- `inactive` → manually or system-disabled
- `expired` → automatically ended after endDate
- `pending` → reserved for possible future flows (e.g. review/payment confirmation)

Wallet transactions (enum: `wallet_transaction_type`):
- `purchase` → used for advertisement payments
- (also supports `topup`, `withdraw` for general wallet flows)

Business rules:
- Only the product owner can purchase an ad
- Product must be `active`
- Only one active ad per product at a time
- Advertisement type must be configured and `isActive = true`
- Wallet must have sufficient balance → otherwise reject
- Wallet debit and ad creation happen in a single DB transaction
- Ads automatically transition to `expired` when endDate < now()

Why:
- Provides a structured, configurable way to monetize listings
- Keeps financial operations consistent via wallet + transactions
- Cleanly links products, users, wallet transactions, and ads in the data model


Location:
- Domain logic: `modules/advertisement/domain`
- Use cases: `modules/advertisement/application/use-cases`
- Controller: `modules/advertisement/controller`
- Repository implementation: `modules/advertisement/infrastructure/repositories`