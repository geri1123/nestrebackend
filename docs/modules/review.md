### Review Module Documentation

---

### Overview

The Review module allows authenticated users to leave star ratings and optional comments on agencies. It enforces strict business rules: agency owners and their agents cannot review their own agency, each user can only review an agency once, and ratings must be integers between 1 and 5. The public endpoint returns paginated reviews with reviewer profile info, average rating, and pagination metadata.

---

### Architecture

```
review/
├── application/
│   └── use-cases/
│       ├── create-review.use-case.ts
│       ├── update-review.use-case.ts
│       └── get-agency-reviews.use-case.ts
├── controllers/
│   └── review.controller.ts
├── domain/
│   ├── entities/
│   │   └── review.entity.ts
│   ├── errors/
│   │   ├── cannon-review-own-agency.error.ts
│   │   ├── invalid-rating.error.ts
│   │   ├── not-review-author.error.ts
│   │   └── review-already-exists.error.ts
│   ├── repositories/
│   │   └── review-repository.interface.ts
│   └── value-objects/
│       └── agency-values.vo.ts
├── dto/
│   ├── create-review.dto.ts
│   ├── update-review.dto.ts
│   └── get-agency-reviews.dto.ts
├── infrastructure/
│   ├── mappers/
│   │   └── review.mapper.ts
│   └── persistence/
│       └── review.repository.ts
├── responses/
│   └── review.swagger.response.ts
└── review.module.ts
```

---

### Domain Model

---

### ReviewEntity

Rich domain entity encapsulating all review business rules. Uses a private constructor — instantiated only via `create()` or `fromPersistence()`.

**Properties:**
- `id`: Numeric ID (0 for new, real ID after persistence)
- `reviewerUserId`: ID of the user who wrote the review
- `agencyId`: ID of the reviewed agency
- `rating`: Integer 1–5
- `comment`: Optional text, max 1000 characters (trimmed, null if blank)
- `createdAt`, `updatedAt`: Timestamps

**Constants:**
- `MIN_RATING = 1`, `MAX_RATING = 5`, `MAX_COMMENT_LENGTH = 1000`

**Factory Method — `ReviewEntity.create(params)`:**

Enforces all creation rules:
1. Throws `CannotReviewOwnAgencyError` if `reviewerUserId === agencyOwnerUserId`
2. Throws `CannotReviewOwnAgencyError` if `reviewerIsAgentOfAgency === true`
3. Validates rating range — throws `InvalidRatingError` if out of range or non-integer
4. Normalizes comment (trim, null if empty, truncate at 1000 chars)

**Instance Methods:**
- `isAuthoredBy(userId)`: Returns `true` if the user is the review author
- `updateContent({ rating?, comment? })`: Validates and applies changes, updates `updatedAt`

**Persistence Method — `ReviewEntity.fromPersistence(props)`:** Reconstructs entity from DB row without re-running business rules.

---

### Domain Errors

| Error class | When thrown |
|---|---|
| `CannotReviewOwnAgencyError` | Reviewer is the agency owner or an agent of the agency |
| `InvalidRatingError` | Rating is not an integer or outside 1–5 |
| `NotReviewAuthorError` | User tries to edit someone else's review |
| `ReviewAlreadyExistsError` | Unique DB constraint on `(reviewerUserId, agencyId)` fires |

---

### Repository Interface

---

### IReviewRepository

- `save(entity)` → `Promise<ReviewEntity>`: Persists new review; throws `ReviewAlreadyExistsError` on duplicate
- `findById(id)` → `Promise<ReviewEntity | null>`
- `findByReviewerAndAgency(reviewerUserId, agencyId)` → `Promise<ReviewEntity | null>`
- `existsByReviewerAndAgency(reviewerUserId, agencyId)` → `Promise<boolean>`: Fast existence check
- `update(entity)` → `Promise<ReviewEntity>`: Updates rating and comment
- `findByAgency(params)` → `Promise<AgencyReviewsVo>`: Paginated reviews with reviewer profile and aggregate stats
- `getAverageRating(agencyId)` → `Promise<{ averageRating: number | null; totalReviews: number }>`: Lightweight stats-only query

---

### AgencyReviewsVo (Value Object)

Returned by `findByAgency`. Encapsulates paginated results and computed properties.

**Constructor params:** `reviews`, `totalCount`, `rawAverageRating`, `limit`, `offset`

**Computed getters:**
- `averageRating`: Raw average rounded to 1 decimal (e.g. `4.27` → `4.3`), or `null` if no reviews
- `totalPages`: `Math.ceil(totalCount / limit)`
- `hasMore`: Whether there are more pages after the current one

---

### Use Cases

---

### CreateReviewUseCase

Creates a review after full validation.

**Dependencies:** `IReviewRepository`, `IAgencyDomainRepository`, `IAgentDomainRepository`

**Flow:**
1. Fetch agency — throws `404 NotFoundException` if not found
2. Check if reviewer is an agent of the agency (`agentRepo.findByAgencyAndAgent`) — stored as `reviewerIsAgentOfAgency`
3. Check if reviewer already reviewed this agency (`existsByReviewerAndAgency`) — throws `409 ConflictException` if true
4. Call `ReviewEntity.create()` — catches domain errors and maps to HTTP exceptions:
   - `CannotReviewOwnAgencyError` → `403 ForbiddenException`
   - `InvalidRatingError` → `403 ForbiddenException`
5. Persist via `reviewRepo.save()` — catches `ReviewAlreadyExistsError` (race condition) → `409 ConflictException`
6. Returns saved `ReviewEntity`

---

### UpdateReviewUseCase

Updates an existing review, enforcing author-only access.

**Dependencies:** `IReviewRepository`

**Flow:**
1. Fetch review by ID — throws `404 NotFoundException` if not found
2. Check `review.isAuthoredBy(reviewerUserId)` — throws `403 ForbiddenException` if not the author
3. Call `review.updateContent({ rating, comment })` — throws `403 ForbiddenException` on `InvalidRatingError`
4. Persist via `reviewRepo.update(review)`
5. Returns updated `ReviewEntity`

---

### GetAgencyReviewsUseCase

Returns paginated reviews for an agency.

**Dependencies:** `IReviewRepository`

**Page size:** Fixed at 10 per page.

**Flow:**
1. Computes `limit = 10`, `offset = (page - 1) * 10`
2. Calls `reviewRepo.findByAgency({ agencyId, limit, offset })`
3. Returns `AgencyReviewsVo` (computed `averageRating`, `totalPages`, `hasMore`)

---

### Infrastructure

---

### ReviewRepository

Implements `IReviewRepository` via Prisma.

**`save`:** Catches Prisma error `P2002` (unique constraint on `reviewerUserId_agencyId`) and maps to `ReviewAlreadyExistsError`.

**`findByAgency`:** Uses a single Prisma `$transaction` with three parallel queries — `findMany` (with reviewer profile include), `count`, and `aggregate` (AVG rating). Returns an `AgencyReviewsVo`.

**`update`:** Updates only `rating` and `comment` fields.

**ReviewMapper:** Converts Prisma `Review` rows to `ReviewEntity` instances via `fromPersistence`.

---

### API Endpoints

---

### POST /reviews

Creates a new review for an agency.

**Authentication:** Required

**Request Body:**
```json
{ "agencyId": 42, "rating": 5, "comment": "Great service, very responsive agents." }
```

**Validation:** `agencyId` integer, `rating` integer 1–5, `comment` string max 1000 chars (optional)

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "agencyId": 42,
    "rating": 5,
    "comment": "Great service!",
    "createdAt": "2026-06-06T10:30:00.000Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Reviewer is the agency owner or an agent of the agency
- `404 Not Found`: Agency not found
- `409 Conflict`: Already reviewed this agency

---

### PATCH /reviews/:id

Updates the authenticated user's own review.

**Authentication:** Required

**Path Parameter:** `id` — Review ID

**Request Body:** `{ "rating": 4, "comment": "Updated my opinion." }` (both fields optional)

To clear a comment send `"comment": null`.

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": 7,
    "rating": 4,
    "comment": "Updated my opinion after second visit.",
    "updatedAt": "2026-06-06T11:00:00.000Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the review author, or invalid rating
- `404 Not Found`: Review not found

---

### GET /reviews/agency/:agencyId

Returns paginated reviews for an agency. **Public** — no authentication required.

**Path Parameter:** `agencyId` — Agency ID

**Query Parameters:**
- `page` (optional, default: 1, min: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1024,
        "rating": 5,
        "comment": "Great service!",
        "createdAt": "2026-05-20T10:30:00.000Z",
        "updatedAt": "2026-05-20T10:30:00.000Z",
        "reviewer": {
          "id": 88,
          "username": "andi_t",
          "firstName": "Andi",
          "lastName": "Tafa",
          "profileImgUrl": "https://cdn.example.com/u/88.jpg"
        }
      }
    ],
    "meta": {
      "totalCount": 127,
      "averageRating": 4.3,
      "currentPage": 1,
      "totalPages": 13,
      "hasMore": true
    }
  }
}
```

**Page size:** Fixed at 10. Most recent reviews shown first.

---

### Module Configuration

**Imports:** `PrismaModule`, `AgencyModule`, `AgentModule`

**Controllers:** `ReviewController`

**Providers:**
- `CreateReviewUseCase`, `UpdateReviewUseCase`, `GetAgencyReviewsUseCase`
- `ReviewRepository` (token: `REVIEW_REPO`)

**Exports:** `REVIEW_REPO` — allows other modules (e.g. Agency) to query review stats

---

### Business Rules Summary

1. A user cannot review an agency they own
2. An agent cannot review the agency they work for
3. Each user may submit at most one review per agency
4. Rating must be a whole number between 1 and 5
5. Comments are optional, trimmed, and capped at 1000 characters
6. Only the review author can edit their own review
7. Duplicate submissions are caught both at application level (pre-check) and at DB level (unique constraint) to handle race conditions

---

### Database Schema

**Review table:** `id`, `reviewerUserId` (FK users), `agencyId` (FK agencies), `rating` (int), `comment` (nullable text), `createdAt`, `updatedAt`

**Unique constraint:** `(reviewerUserId, agencyId)` — one review per user per agency

---

### Future Considerations

- Admin ability to delete abusive reviews
- Review flagging/reporting by other users
- Verified reviewer badge (user has transacted with the agency)
- Agency response to review
- Review sorting options (highest/lowest rating, most recent)