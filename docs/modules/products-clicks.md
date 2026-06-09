### Product Clicks Module

---

### Overview

The Product Clicks module tracks how many times each property listing has been viewed. Click events are stored in MongoDB (for high-write-volume append-only data), while the aggregated `clickCount` is cached/denormalized back to the PostgreSQL `Product` table. The module also provides a time-series query for the last N days of clicks per product — used by the Dashboard module.

---

### Architecture

```
product-clicks/
├── domain/
│   ├── entities/
│   │   └── product-click.entity.ts
│   └── repositories/
│       └── product-click.repository.interface.ts
├── schemas/
│   └── product_clicks.schema.ts          ← Mongoose schema
├── product-clicks.module.ts
└── product-clicks.service.ts
```

---

### ProductClicksService

The primary interface for recording and querying clicks.

**Methods:**

**`recordClick(productId, userId?)`**: Records a view event in MongoDB. If `userId` is provided it can be used to deduplicate (avoid counting the owner's own views). Increments `clickCount` on the Prisma `Product` record.

**`getClicksPerDay(productIds: string[], days: number)`** → `{ date: string; clicks: number }[]`:
Returns a time-series array of click totals grouped by UTC date for the last `days` days. Always returns exactly `days` entries — days with zero clicks are included with `clicks: 0`. Dates are formatted as `YYYY-MM-DD`. Used by `GetUserStatsUseCase` in the Dashboard module.

---

### MongoDB Schema

### ProductClickSchema (Mongoose)

**Collection:** `product_clicks`

**Fields:**
- `productId`: string (indexed)
- `userId`: string (optional — for deduplication)
- `clickedAt`: Date (indexed, default: `Date.now`)
- `ipAddress`: string (optional — for anonymous deduplication)
- `userAgent`: string (optional)

**Indexes:** `productId` + `clickedAt` (compound) for efficient time-range queries.

---

### Repository Interface

### IProductClickRepository

- `record(productId, userId?, meta?)` → `Promise<void>`: Inserts a click document
- `countByProduct(productId)` → `Promise<number>`: Total lifetime clicks for a product
- `getClicksGroupedByDay(productIds, fromDate, toDate)` → `Promise<{ date: string; clicks: number }[]>`: Aggregation pipeline grouping by UTC date

---

### Module Configuration

**Imports:** `MongooseModule.forFeature([ProductClickSchema])`, `PrismaModule`

**Exports:** `ProductClicksService` — consumed by `DashboardModule` and `ProductModule`

---

### Design Notes

- MongoDB is used because click events are extremely write-heavy and append-only — relational constraints are not needed
- The `clickCount` on the PostgreSQL `Product` table is a denormalized cache for quick reads in product lists
- The `getClicksPerDay` query uses MongoDB's `$group` aggregation stage with `$dateToString` to bucket by UTC date
- See `docs/database-mongodb.md` for MongoDB connection configuration