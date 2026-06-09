### Advertisement Pricing Module

---

### Overview

The Advertisement Pricing module manages the pricing configuration for each advertisement type (`cheap`, `normal`, `premium`). It provides CRUD operations for admin configuration and exposes a public read endpoint so the frontend can display available plans. All endpoints are currently `@Public()`.

---

### Architecture

```
advertisement-pricing/
├── application/
│   └── use-cases/
│       ├── create-pricing.use-case.ts
│       ├── get-all-pricing.use-case.ts
│       ├── get-pricing.use-case.ts
│       └── update-pricing.use-case.ts
├── domain/
│   ├── entities/
│   │   └── advertisement-pricing.entity.ts
│   └── repositories/
│       └── advertisement-pricing.repository.interface.ts
├── dto/
│   └── create-pricing.dto.ts
├── infrastructure/
│   └── persistence/
│       └── advertisement-pricing.repository.ts
├── response/
│   └── advertisement-pricing.swagger.response.ts
└── advertisement-pricing.module.ts
```

---

### Domain Entity

### AdvertisementPricingEntity

**Properties:**
- `id`: numeric ID
- `adType`: `'cheap' | 'normal' | 'premium'`
- `price`: number (stored as Prisma `Decimal`, converted on read)
- `duration`: integer days the ad runs
- `discount`: percentage off (e.g. `20` = 20%), nullable
- `isActive`: whether this tier can be purchased
- `createdAt`, `updatedAt`

---

### Repository Interface

### IAdvertisementPricingRepository

- `getPricing(adType)` → `Promise<AdvertisementPricingEntity | null>`: Fetch by type
- `getAll()` → `Promise<AdvertisementPricingEntity[]>`: Fetch all tiers
- `update(adType, data)` → `Promise<AdvertisementPricingEntity>`: Partial update
- `create(data)` → `Promise<AdvertisementPricingEntity>`: Create a new tier

---

### Use Cases

---

### GetAllPricingUseCase

Returns all pricing plans. Computes `finalPrice` for each plan with the discount applied:

```
finalPrice = discount
  ? Math.round((price - price * discount / 100) * 100) / 100
  : price
```

The `finalPrice` field is appended to each returned object so the frontend can display it directly without recalculating.

---

### GetPricingUseCase

Returns a single pricing plan by `adType` string. Throws `NotFoundException` if not found. Used internally by `AdvertiseProductUseCase` to validate and fetch the cost before charging the wallet.

---

### CreatePricingUseCase

Creates a new pricing plan for an ad type. Throws `BadRequestException` if a plan already exists for the given `adType` (one plan per type enforced at application level).

---

### UpdatePricingUseCase

Updates fields of an existing pricing plan. Accepts partial updates: `price`, `duration`, `discount`, `isActive`. Used to toggle ad types on/off, change prices, or apply/remove discounts.

---

### DTO

### CreatePricingDto

- `adType` (`AdvertisementType` enum, required)
- `price` (number ≥ 0, required)
- `duration` (number ≥ 1, required — days)
- `discount` (number ≥ 0, optional — percentage)
- `isActive` (boolean, optional — defaults to `true`)

---

### API Endpoints

All endpoints are `@Public()` — no authentication required.

---

### GET /advertisement-pricing

Returns all pricing plans with computed `finalPrice`.

**Response:**
```json
[
  { "id": 2, "adType": "cheap", "price": 5.99, "duration": 7, "discount": null, "isActive": true, "finalPrice": 5.99 },
  { "id": 3, "adType": "normal", "price": 12.99, "duration": 14, "discount": 20, "isActive": true, "finalPrice": 10.39 },
  { "id": 4, "adType": "premium", "price": 19.99, "duration": 30, "discount": null, "isActive": true, "finalPrice": 19.99 }
]
```

---

### POST /advertisement-pricing

Creates a new pricing plan. Throws `400` if the `adType` already exists.

**Request Body:** `CreatePricingDto`

---

### GET /advertisement-pricing/:type

Returns a single pricing plan by `adType` string (e.g. `/advertisement-pricing/normal`).

**Response:** Single `AdvertisementPricingEntity`.

---

### Module Configuration

**Controllers:** `AdvertisementPricingController`

**Providers:** `CreatePricingUseCase`, `GetAllPricingUseCase`, `GetPricingUseCase`, `UpdatePricingUseCase`, `AdvertisementPricingRepository` (token: `ADVERTISEMENT_PRICING_REPO`)

**Exports:** `GetAllPricingUseCase`, `GetPricingUseCase` — used by `AdvertiseProductModule`

---

### Infrastructure

`AdvertisementPricingRepository` uses Prisma with `findUnique({ where: { adType } })` for single lookups (adType has a unique constraint). Converts `Decimal` price/discount fields to `number` via `.toNumber()` before returning entities.

---

### Default Pricing (example seed)

| Type | Price | Duration | Discount | Final Price |
|---|---|---|---|---|
| `cheap` | €5.99 | 7 days | — | €5.99 |
| `normal` | €12.99 | 14 days | 20% | €10.39 |
| `premium` | €19.99 | 30 days | — | €19.99 |