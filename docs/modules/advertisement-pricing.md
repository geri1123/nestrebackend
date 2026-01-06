## Advertisement Pricing Module (Admin-Only)

Purpose:
- Manage pricing rules for product advertisements
- Define cost, duration, discount and activation state per ad type
- Centralized configuration used whenever a user purchases an advertisement

Scope:
- This module is only used by **platform administrators**
- Application users cannot modify pricing

Main entity:
- `AdvertisementPricingEntity`
  - `adType` — advertisement plan (`cheap`, `normal`, `premium`)
  - `price` — base price charged to the user wallet
  - `duration` — number of days the ad runs
  - `discount` — optional price reduction (0–1)
  - `isActive` — enables / disables that pricing tier
  - timestamps

Use-cases:
- `CreatePricingUseCase`
  - creates pricing rule for an ad type
  - prevents duplicates
- `GetAllPricingUseCase`
  - returns full pricing list
- `GetPricingUseCase`
  - fetches pricing for a specific ad type
  - used by the Advertising Module when charging a wallet
- `UpdatePricingUseCase`
  - allows modifying price / duration / discount / activation state

Repository contract:
- `IAdvertisementPricingRepository`
  - `getPricing(adType)`
  - `getAll()`
  - `update(adType, data)`
  - `create(data)`

Controller routes (public read-only):
- `GET /advertisement-pricing`
  - list all pricing rules
- `GET /advertisement-pricing/:type`
  - get pricing for a specific ad type

Write operations:
- (create / update endpoints may be restricted to admin panel usage)

Validation:
- DTO class-validator ensures:
  - price ≥ 0
  - duration ≥ 1
  - discount ≥ 0
  - valid enum type

Why:
- Keeps advertisement billing configurable
- Enables monetization strategy changes without code changes
- Separates financial logic from product listing flow
- Ensures stable pricing lookup for ad purchases

Module location:
`src/modules/advertisement-pricing`