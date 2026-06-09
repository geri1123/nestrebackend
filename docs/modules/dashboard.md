### Dashboard Module Documentation

---

### Overview

The Dashboard module provides analytics statistics for authenticated users, scoped appropriately to their role. Agency owners see aggregate stats across their entire agency; agents and regular users see stats only for their own listings. The module aggregates data from multiple other modules (products, saved products, product clicks) in a single efficient call.

---

### Architecture

```
dashboard/
├── application/
│   └── use-cases/
│       └── get-user-stats.use-case.ts
├── controllers/
│   └── dashboard.controller.ts
├── decorators/
│   └── dashboard.decorators.ts
├── dto/
│   └── dashboard-stats.dto.ts
└── dashboard.module.ts
```

---

### DashboardStats Interface

```typescript
interface DashboardStats {
  scope: 'user' | 'agency';   // Who the stats cover
  activeProperties: number;    // Listings currently active
  totalClicks: number;         // Lifetime click total across all listings
  totalSaves: number;          // How many times listings were saved by others
  totalProperties: number;     // Total listings (any status)
  clicksLast7Days: { date: string; clicks: number }[];  // Per-day breakdown (UTC, oldest first)
}
```

---

### Use Case

---

### GetUserStatsUseCase

Aggregates dashboard statistics for the requesting user, with role-aware scoping.

**Dependencies:** `IProductRepository`, `ISavedProductRepository`, `IUserDomainRepository`, `IAgencyDomainRepository`, `ProductClicksService`

**Role Logic:**

- `agency_owner` — Looks up the owner's agency via `agencyRepo.findByOwnerUserId`. If found, fetches stats for the whole agency (`findStatsForAgency`, `countSavesByAgency`). If the owner has no agency yet, falls back to user-scoped stats.
- `agent` / `user` — Uses `findStatsForUser` and `countSavesByOwner` scoped to the user's own products.

**Flow:**
1. Fetch the user record to determine role
2. Based on role, run `productRepo.findStats*` + `savedProductRepo.countSaves*` in parallel via `Promise.all`
3. Extract product IDs and compute `activeProperties`, `totalClicks`, `totalProperties` from the product stats
4. Fetch `clicksLast7Days` from `ProductClicksService.getClicksPerDay(productIds, 7)`
5. Return `DashboardStats`

**Defensive Fallback:** If the user is not found (should never happen with auth in place), returns an empty stats object with 7 zero-click days so the frontend never receives a broken response.

---

### API Endpoint

---

### GET /dashboard/me/stats

Returns dashboard statistics for the authenticated user.

**Authentication:** Required (JWT)

**Response:**
```json
{
  "scope": "agency",
  "activeProperties": 12,
  "totalClicks": 1247,
  "totalSaves": 38,
  "totalProperties": 18,
  "clicksLast7Days": [
    { "date": "2026-05-31", "clicks": 43 },
    { "date": "2026-06-01", "clicks": 67 },
    { "date": "2026-06-02", "clicks": 31 },
    { "date": "2026-06-03", "clicks": 55 },
    { "date": "2026-06-04", "clicks": 88 },
    { "date": "2026-06-05", "clicks": 102 },
    { "date": "2026-06-06", "clicks": 74 }
  ]
}
```

**Errors:**
- `401 Unauthorized`: User not authenticated

---

### Module Configuration

**Imports:** `ProductModule`, `SaveProductModule`, `ProductClicksModule`, `UsersModule`, `AgencyModule`

**Providers:** `GetUserStatsUseCase`

**No exports** — leaf module consumed only via HTTP.

---

### Scope Behavior Summary

| Role | `scope` value | Stats cover |
|---|---|---|
| `user` | `"user"` | Only the user's own products |
| `agent` | `"user"` | Only the agent's own products |
| `agency_owner` (with agency) | `"agency"` | All products under the agency |
| `agency_owner` (no agency yet) | `"user"` | Owner's own products (fallback) |

---

### Click Data Format

`clicksLast7Days` always returns exactly 7 entries, one per day, starting from 6 days ago up to today (UTC). Days with zero clicks are included explicitly so the frontend can always render a complete 7-day chart without gaps.

---

### Future Considerations

- Date range selection (30 days, 90 days, custom)
- Per-product breakdown
- Conversion metrics (clicks → contact form submissions)
- Revenue stats (wallet income from advertisement purchases)
- Export as CSV/PDF