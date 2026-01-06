# Product Clicks Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Product Clicks Module records and aggregates user interactions (clicks/views) for product listings. It is implemented with Mongoose/MongoDB and is used by the Product Module to:

- Increment per-product click counters (per user + IP)
- Persist click documents (with optional userAgent)
- Aggregate clicks across multiple products for ranking ("most_clicks")
- Provide per-product click lists (for analytics)

Primary files / classes provided:
- Domain: `ProductClickEntity`
- Abstract repository interface: `IProductClickRepository`
- Schema: `ProductClick` / `ProductClickSchema` (Mongoose)
- Service: `ProductClicksService` (Mongoose-backed implementation)
- Module: `ProductClicksModule` (exports `ProductClicksService`)

This module is intended for analytics, product ranking, and measuring engagement (not for security or strict deduplication guarantees).

---

## Data model (Mongoose schema)

ProductClick (document)
- productId: string (required) — product identifier (stringified)
- userId: string (required) — user identifier or "guest"
- count: number (defaults to 1) — aggregated count for this combination
- ipAddress?: string — client IP address used to help de-duplicate
- userAgent?: string — optional, useful for analytics/bot detection
- timestamps: createdAt, updatedAt (set by schema options)

Notes:
- The schema in code uses `@Schema({ timestamps: true })` which gives `createdAt`/`updatedAt`.
- Consider adding compound indexes for performance and upsert correctness:
  - e.g. { productId: 1, userId: 1, ipAddress: 1 } with a uniqueness constraint if you want to guarantee a single document per (product,user,ip). Without uniqueness, simultaneous upserts can create duplicates on very high concurrency.

Example index suggestion (add to schema init code):
```ts
ProductClickSchema.index({ productId: 1, userId: 1, ipAddress: 1 }, { unique: true });
ProductClickSchema.index({ productId: 1 });
```

---

## Domain entity

ProductClickEntity
- Fields:
  - productId: string
  - userId: string
  - ipAddress: string
  - count: number
  - userAgent?: string
  - createdAt?: Date
- Factory:
  - create(productId, userId, ipAddress, userAgent?) — returns entity with count = 1
- Methods:
  - incrementCount() — increments the in-memory counter (useful for in-process aggregation before persisting)

This entity is lightweight and useful if you later implement a separate repository (e.g., a Prisma-backed or SQL-backed implementation) or wrap operations in transactions.

---

## Repository interface

IProductClickRepository (abstract)
- create(click: ProductClickEntity): Promise<ProductClickEntity>
- incrementClick(productId: string, userId: string, ipAddress: string, userAgent?: string): Promise<ProductClickEntity>
- findByProductId(productId: string): Promise<ProductClickEntity[]>
- getClicksForProducts(productIds: string[]): Promise<Map<string, number>>

The current code uses `ProductClicksService` as the concrete implementation backed by a Mongoose model, but the interface allows swapping or mocking for testing.

---

## Service implementation (ProductClicksService)

Key methods:

- addClick(productId: string, userId: string, ip?: string, userAgent?: string)
  - Creates a new document and saves it (no upsert).
  - Useful when you want to keep every click as a separate row (not aggregated) — current schema has `count` so this method currently creates an aggregated-style document with default count=1.

- incrementClick(productId: string, userId: string, ip: string, userAgent?: string)
  - Atomic upsert using `findOneAndUpdate` with:
    - filter: { productId, userId, ipAddress: ip }
    - update: { $inc: { count: 1 }, $setOnInsert: { userAgent, createdAt: new Date() } }
    - options: { upsert: true, new: true }
  - Returns the upserted/updated document.
  - This pattern is efficient for incrementing counters while keeping one row per (product, user, ip).

- getClicksByProduct(productId: string)
  - Returns documents for a given product (useful for logs and per-user breakdowns).

- getClicksForProducts(productIds: (string | number)[])
  - Aggregation pipeline:
    - Match productId in provided list
    - Group by productId and sum counts
  - Returns a Map<string, number> mapping productId => totalClicks
  - Used by search ranking to attach click counts to product rows.

Implementation notes:
- `getClicksForProducts` converts productIds to strings, runs an aggregation and returns a Map for fast lookup.
- Methods return Mongoose documents; consider mapping them to plain JSON or domain entities if callers expect deterministic shapes.

---

## Module wiring

ProductClicksModule
- Imports: Mongoose feature for `ProductClick` with `ProductClickSchema`
- Providers: `ProductClicksService`
- Exports: `ProductClicksService` (so other modules, like Product Module, can inject it)

Example import from Product Module:
```ts
import { ProductClicksModule } from '../product-clicks/product-clicks.module';
@Module({
  imports: [ProductClicksModule, ...],
  // ...
})
export class ProductModule {}
```

---

## Usage examples

A. Increment on public product view (as in SearchProductsController):
```ts
const ip =
  req.headers['x-forwarded-for']?.toString().split(',')[0] ||
  req.ip ||
  'unknown';

await this.productClicksService.incrementClick(
  `${id}`,
  `${req.userId || 'guest'}`,
  ip,
  req.headers['user-agent']?.toString()
);
```

B. Get aggregated clicks for ranking:
```ts
const clicksMap = await this.productClicksService.getClicksForProducts([ '1', '2', '3' ]);
const clicksForProduct1 = clicksMap.get('1') || 0;
```

C. Get per-product click rows for analytics:
```ts
const rows = await this.productClicksService.getClicksByProduct('123');
```

---

## Performance & Scalability Considerations

- Indexes
  - Add indexes on `productId` for aggregation performance.
  - Consider a compound unique index on `{ productId, userId, ipAddress }` if you must prevent duplicates and rely on upsert semantics.

- Aggregation
  - `getClicksForProducts` runs an aggregation and returns totals. For very large productId sets, paginate the aggregation or use a cache.

- Sharding & Storage
  - Clicks can grow large. Consider:
    - Periodic rollups (daily/hourly aggregation into a separate collection)
    - TTL or archival of older click entries if raw per-click retention isn't needed
    - Storing only aggregated rows per (product,user,ip) as implemented helps control cardinality

- Concurrency & Upsert Race Conditions
  - `findOneAndUpdate` with `upsert: true` is atomic; however, without a uniqueness index, concurrent inserts can create duplicates. Add unique index to fully protect uniqueness.

- Caching
  - Cache aggregated click counts in Redis (with TTL) when used heavily by search ranking to avoid frequent Mongo aggregation queries.

- Rate limiting & bot detection
  - Incrementing on every hit may inflate counts due to bots or rapid repeated reloads.
  - Consider:
    - Rate-limiting increments per (userId/ip) within a time window (e.g., 1 click / 5 seconds)
    - Using userAgent heuristics or third-party bot detection
    - Debouncing increments in the client (e.g., only count clicks that result in a transition)

---

## Privacy & Compliance

- IP addresses and user agents are PII in some jurisdictions. Consider:
  - Hashing IP addresses or storing only a truncated form
  - Implement retention policies and deletion endpoints to comply with GDPR/CCPA
  - Document the retention and access rules for analytics teams

---

## Monitoring & Metrics

Recommended metrics:
- Increment rate (clicks/sec)
- Aggregation query latency (getClicksForProducts)
- Upsert conflict/duplicate rate (if duplicate documents appear)
- Storage growth (documents/month)
- Bot-detection hit rate (percentage of clicks flagged as bots)

Log key events (use structured logger, not console) for:
- Failed upserts
- Aggregation failures
- High-volume IPs or users

---

## Testing

Unit tests should cover:
- incrementClick: creating new doc and incrementing existing doc
- getClicksForProducts: returns correct totals for multiple productIds
- addClick: creates document with correct fields
- Index behavior: test that upsert + unique index prevents duplicates (integration)

Integration tests:
- Write tests against a test MongoDB instance (or in-memory MongoDB) to validate aggregation, upserts and index behavior.

---

## Suggested Improvements / To-dos

- Add schema indexes in code (schema.index calls) to ensure production performance:
  - unique compound index for upsert target
  - index on `productId` for aggregation
- Implement rate-limiting logic inside `incrementClick` or a wrapper (e.g., Redis-based sliding window) to mitigate spammy clicks.
- Add a daily/hourly rollup worker that aggregates raw clicks into a `product_clicks_agg` collection and then prune or archive raw rows.
- Provide an adapter that implements `IProductClickRepository` to allow switching between Mongoose and another store (e.g., Postgres/Redis) for experimentation.
- Add retention/TTL mechanism or archival pipeline for old click rows to control collection growth.
- Introduce metrics and structured logging (Prometheus + Grafana + pino/winston).

