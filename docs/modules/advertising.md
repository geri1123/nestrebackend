### Advertising Module (advertise-product)

---

### Overview

The Advertising module allows users to promote their active property listings using paid advertisements charged directly from their wallet. Supports three tiers (`cheap`, `normal`, `premium`), each with its own price, duration, and optional discount. All financial operations and ad creation happen inside a single Prisma transaction to ensure consistency. A cron-driven use case handles ad expiry and sends notifications to affected users.

---

### Architecture

```
advertise-product/
├── application/
│   └── use-cases/
│       ├── advertise-product.use-case.ts
│       └── expired-advertisement.use-case.ts
├── controller/
│   └── advertise-product.controller.ts
├── domain/
│   ├── entities/
│   │   └── advertisement.entity.ts
│   └── repositories/
│       └── Iproduct-advertisement.repository.ts
├── dto/
│   └── advertise.dto.ts
├── infrastructure/
│   └── persistence/
│       └── product-advertisement.repository.ts
└── advertise-product.module.ts
```

---

### Domain

---

### Advertisement Entity

Represents a paid promotion for a product listing.

**Fields:** `id`, `productId`, `userId`, `adType` (enum: `cheap | normal | premium`), `status` (enum: `active | inactive | expired | pending`), `startDate`, `endDate`, `walletTxId`

---

### IProductAdvertisementRepository

- `createAdvertisementTx(tx, productId, userId, adType, startDate, endDate, walletTxId)` → `Promise<Advertisement>`: Creates ad inside caller's transaction
- `getActiveAd(productId)` → `Promise<ProductAdvertisement | null>`: Checks for an existing active ad
- `findExpiredAds(now)` → `Promise<{ id, userId, productId }[]>`: Returns ads past their `endDate`
- `expireAds(now)` → `Promise<number>`: Bulk-updates expired ads to status `expired`, returns count
- `updateStatus(adId, status)` → `Promise<ProductAdvertisement>`: Manual status update

---

### Use Cases

---

### AdvertiseProductUseCase

Purchases a paid advertisement for a product listing.

**Dependencies:** `IProductAdvertisementRepository`, `ChangeWalletBalanceUseCase`, `FindProductByIdUseCase`, `GetPricingUseCase`, `PrismaService`

**Validation (pre-transaction):**
1. Fetch product — throws `BadRequestException` if not found
2. Verify product owner matches `userId` — throws `ForbiddenException` if not
3. Verify product `status === 'active'` — throws `BadRequestException` if not
4. Check no active ad exists — throws `BadRequestException` if one does
5. Fetch pricing for `adType` — throws `BadRequestException` if `isActive === false`

**Price Calculation:**

```
finalPrice = discount
  ? Math.round((price - (price * discount / 100)) * 100) / 100
  : price
```

Discount is stored as a percentage (e.g. `20` = 20%). Rounding to 2 decimal places.

**Transaction Flow (Prisma `$transaction`):**
1. `ChangeWalletBalanceUseCase.execute({ userId, type: 'purchase', amount: finalPrice, language }, tx)` — deducts wallet balance
2. `adRepo.createAdvertisementTx(tx, productId, userId, adType, startDate, endDate, walletTxId)` — creates the ad record

If wallet has insufficient funds, the wallet use case throws `BadRequestException("Insufficient balance")` which is caught and re-thrown as a localized error.

**Returns:** Created advertisement record.

---

### ExpireProductAdsUseCase

Bulk-expires all advertisements whose `endDate` has passed. Called by the cron job.

**Dependencies:** `IProductAdvertisementRepository`, `NotificationService`

**Flow:**
1. `adRepo.findExpiredAds(now)` — fetch all ads to expire (capture `userId` + `productId` for notifications)
2. `adRepo.expireAds(now)` — bulk UPDATE to `expired` status
3. For each expired ad, emit an `advertisement_expire` notification to the product owner

**Returns:** Number of ads expired.

---

### API Endpoint

---

### POST /advertise

Creates a paid advertisement for a product listing.

**Authentication:** Required

**Request Body:**
```json
{ "productId": 42, "adType": "normal" }
```

`adType` defaults to `"normal"` if not provided. Valid values: `cheap`, `normal`, `premium`.

**Response:**
```json
{ "success": true, "message": "Successfully advertised" }
```

**Errors:**
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Product not found, not active, already advertised, ad type inactive, or insufficient wallet balance
- `403 Forbidden`: User does not own the product

---

### Module Configuration

**Imports:** `ProductModule`, `WalletModule`, `AdvertisementPricingModule`, `NotificationModule`

**Providers:** `AdvertiseProductUseCase`, `ExpireProductAdsUseCase`, `ProductAdvertisementRepository` (token: `ADVERTISE_REPO`)

**Exports:** `ExpireProductAdsUseCase` (consumed by `CleanupModule` for cron scheduling)

---

### Business Rules

1. Only the product owner can advertise their listing
2. Product must be `active` (not draft, inactive, or expired)
3. Only one active ad per product at a time
4. The advertisement type config must have `isActive = true`
5. Wallet balance must be sufficient — debit and ad creation are atomic
6. Discount is applied as a percentage: `price × (1 - discount/100)`

---

### Database Schema

**ProductAdvertisement table:** `id`, `productId` (FK), `userId` (FK), `adType` (enum), `status` (enum), `startDate`, `endDate`, `walletTxId` (FK to WalletTransaction), `createdAt`, `updatedAt`

---

### Future Considerations

- Pause/resume advertisements
- Refunds for early cancellation
- Ad impressions and click tracking per advertisement
- Upgrade path (cheap → normal → premium)
- Admin manual override of ad status