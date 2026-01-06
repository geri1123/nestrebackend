# Product Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Product Module implements product (listing) CRUD, search, presentation (frontend DTOs), and related use-cases for the Real Estate platform. Main responsibilities:

- Create, update and delete products (with images and attribute values)
- Public and protected product retrieval (with permission checks)
- Powerful search API with:
  - Slug & code resolution (category/subcategory/listing type)
  - Attribute filters (new code-based + legacy ID-based)
  - Pagination, sorting, price/area/buildYear ranges, cities/country
  - Advertisement prioritization and click-based sorting
- Product click tracking integration
- Mapping DB entities to frontend-friendly DTOs
- Repository layer implemented with Prisma
- Search query builder and slug/attribute resolution helpers

Module location:
- `src/modules/product/` (controllers, application use-cases, infrastructure, dto, domain)

Exports:
- `PRODUCT_REPO`, `SEARCH_PRODUCT_REPO` bindings
- Use cases and DTOs as needed by other modules

---

## Public REST Endpoints (summary)

Two controllers:

- ManageProductController (authenticated / protected routes)
  - POST /products/add — create product (multipart images + body)
  - PATCH /products/update/:id — update product (images allowed)
  - GET /products/dashboard/products — list user's or agency's products (dashboard)

- SearchProductsController (public & protected read-only endpoints)
  - GET /products/search — public search (filters in query)
  - GET /products/agency/:agencyId — public agency products
  - GET /products/agent/:agentId — public agent products
  - GET /products/public/:id — public product view (increments clicks)
  - GET /products/protected/:id — protected product view (auth required)
  - GET /products/most-clicks — top clicked products

Notes:
- File uploads use `FilesInterceptor('images', 7)`.
- DTO validation is performed server-side (class-validator + transformation).
- Swagger decorators are used for API docs.

---

## Key DTOs

- CreateProductDto
  - title, price, cityId, subcategoryId, listingTypeId
  - optional: description, address, area, buildYear, attributes[], status
  - `attributes` is an array of ProductAttributeValueDto:
    - attributeId (int)
    - attributeValueId? (int | optional — supports boolean attributes)

- UpdateProductDto
  - Partial fields similar to CreateProductDto
  - `attributes?` as ProductAttributeValueDto[] for replace-on-update semantics

- SearchFiltersDto (used by search repository)
  - category / subcategory / listingtype (slugs)
  - categoryId / subcategoryId / listingTypeId (resolved IDs)
  - pricelow / pricehigh, areaLow / areaHigh
  - cities[] / country
  - attributeCodes?: Record<string, string> (new code-based format — e.g. bedrooms: "2-bedrooms,3-bedrooms")
  - attributes?: Record<number, number[]> (resolved attributeId -> [valueId...])
  - buildYearMin / buildYearMax
  - sortBy: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'most_clicks'
  - limit / offset / userId / agencyId / status

- ProductFrontendDto
  - id, title, price, city, status, createdAt, image[], categoryName, subcategoryName
  - user, agency, isAdvertised, advertisement, totalClicks, etc.

- ProductsSearchResponseDto
  - products[], totalCount, currentPage, totalPages

---

## Controllers & Guards Behavior

- ManageProductController
  - `@UseGuards(UserStatusGuard)` ensures user status is valid for creation.
  - `createProduct`:
    - Validates body against `CreateProductDto` and throws structured validation errors.
    - Requires user to be authenticated; requires agency association for non-user roles.
    - Uses `CreateProductUseCase` to persist product, upload images and create attribute values.
  - `updateProduct`:
    - Guarded by `ProductOwnershipAndPermissionGuard` and `UserStatusGuard`.
    - Validates `UpdateProductDto`.
    - Uses `UpdateProductUseCase` to update entity, attributes and images.

- SearchProductsController
  - Public search endpoints are annotated with `@Public()`.
  - `searchAll` uses `SearchFiltersHelper.parse` to canonicalize query then executes `SearchProductsUseCase`.
  - `getPublicProduct`:
    - Attaches optional user via `SoftAuthService` (if token present).
    - Increments click counts for analytics using `ProductClicksService`.
    - Returns product mapped DTO or 404.
  - `getProtectedProduct`:
    - Requires authentication and permission checks done in use-case; returns 404 if not visible.

---

## Application Use-Cases (business logic)

- CreateProductUseCase
  - Validates and builds domain `Product` entity.
  - Persists product via `IProductRepository.create`.
  - Concurrently uploads images (UploadProductImagesUseCase) and creates attribute values (CreateProductAttributeValuesUseCase).
  - Returns created product + uploaded images or throws `BadRequestException` with localized messages.

- UpdateProductUseCase
  - Fetches product, ensures existence & permissions in controller guard.
  - Uses `Product.createForUpdate()` to prepare partial updates and calls repository.update.
  - Replaces attributes when provided: delete old -> create new.
  - Replaces images when provided: delete old -> upload new.
  - Returns updated response DTO.

- GetProductByIdUseCase / FindProductByIdUseCase / GetProductForPermissionUseCase
  - Fetch product with different levels of detail:
    - `findById` minimal
    - `findByIdWithDetails` used for constructing frontend DTO
    - `findForPermissionCheck` returns only ids for permission checks
  - `GetProductByIdUseCase` enforces visibility rules for protected routes:
    - If product is not `active`, it is only returned if:
      - requester is owner OR
      - requester is agency_owner of same agency OR
      - requester is agent with `canViewAllPosts` permission
    - Returns `null` when product is not visible.

- SearchProductsUseCase
  - Runs repository calls concurrently:
    - `searchProducts(filters, language, isProtectedRoute)`
    - `getProductsCount(filters, language, isProtectedRoute)`
  - Maps results to `ProductFrontendDto` via `ProductFrontendMapper`.
  - Returns paginated metadata: products, totalCount, currentPage, totalPages.

- GetMostClickedProductsUseCase
  - Builds a minimal filter: sortBy 'most_clicks', `status: active`, limit passed.
  - Calls search repository and returns mapped frontend DTOs.

---

## Search Flow (detailed)

1. Controller receives query params and page.
2. `SearchFiltersHelper.parse(rawQuery, page)`:
   - Normalizes pagination (limit fixed at 12 by default; offset calculated).
   - Extracts "new format" attribute codes from arbitrary query keys (e.g., `bedrooms=2-bedrooms,3-bedrooms`) into `attributeCodes`.
   - Parses legacy attributes format `attributes[1]=4,5` into `attributes` numeric mapping.
   - Parses `cities` multi-values (comma separated or repeated params).
   - Converts numeric strings to numbers for ID/price/area/buildYear fields.
   - Returns `SearchFiltersDto`.

3. `SearchProductsUseCase` calls `SearchProductRepository.searchProducts` which does:
   - `SearchFiltersResolver.resolve(filters)`:
     - Normalizes slugs (lowercase, replaces `ë`→`e`, `ç`→`c`) and resolves:
       - category slug -> categoryId
       - subcategory slug -> subcategoryId (auto-binds parent categoryId when missing)
       - listing type slug -> listingTypeId
     - Resolves `attributeCodes` to attributeId and attribute_value ids:
       - Uses `attribute.code` lookup (optionally scoped by `subcategoryId`)
       - Splits `valueCodes` and matches `attribute_value.value_code` to produce IDs
       - Populates `filters.attributes: Record<number, number[]>` (merges with existing)
     - Logs resolution steps and warnings for not-found items (non-fatal).
   - `ProductSearchQueryBuilder.build(filters, language, isProtectedRoute)`:
     - Constructs Prisma `where` object with:
       - area, price, buildYear ranges
       - subcategory/category filters
       - listingTypeId
       - attribute `AND` conditions for each attributeId requiring `productattributevalue.some`
       - city / country matching (case-insensitive normalization)
       - status handling:
         - `isProtectedRoute` => allow multiple statuses including `draft`
         - otherwise restrict to `active`
       - user / agency filters
       - Excludes suspended users and suspended agencies (or agency null)
   - `SearchProductRepository.searchProducts` performs `prisma.product.findMany`:
     - Selects related translations (subcategory/category/listing type) for the provided language
     - Selects product attribute values with localized attribute names & value names
     - Selects up to 2 images
     - Retrieves active advertisement (if any) — used to prioritize results
   - Post-processing:
     - Fetch click counts via `ProductClicksService.getClicksForProducts(productIds)`
     - Attach `clickCount` to product items
     - Sort:
       - Advertised products first (descending)
       - If `sortBy === 'most_clicks'`, sort by clickCount descending
       - Otherwise respect `secondaryOrderBy` from initial sortBy or createdAt desc
     - Paginate using `filters.offset/filters.limit` and return the page.

4. Count endpoint uses the same resolved `where` object and `prisma.product.count`.

---

## Repositories (Prisma-backed)

- ProductRepository (IProductRepository)
  - create(product: Product): Creates DB row and maps back to domain `Product` object
  - findById(id): Minimal product (used for permission checks)
  - findByIdWithDetails(id, language): Returns a detailed object (joins, translations)
  - findForPermissionCheck(id): Returns { id, userId, agencyId }
  - update(id, partial): Updates fields present in partial and returns Product domain object
  - delete(id): Deletes product (currently hard delete)

- SearchProductRepository (ISearchProductRepository)
  - searchProducts(filters, language, isProtectedRoute): core search (detailed above)
  - getProductsCount(filters, language, isProtectedRoute): count using same `where` conditions

Important notes:
- Translation selects use `where: { language }` and `take: 1` — frontends get first matching translation for the requested language.
- Advertisement selection looks for active ads where startDate <= now and endDate >= now.
- Clicks are stored and aggregated separately (ProductClicksService) and merged in-memory to support complex ranking.

---

## Product Domain Entity

- `Product` domain object constructed via:
  - `Product.create()` for new entities
  - `Product.createForUpdate()` returns a Partial<Product> for updates
  - `toResponse()` maps an entity instance to a plain object for persistence/response usage

This ensures the application layer uses a normalized domain object rather than raw DB rows.

---

## Logging, Error Handling & Validation

- DTOs are validated with `class-validator`. Controller uses `plainToInstance` + `validate()` and `throwValidationErrors`.
- Use-cases catch and rethrow logical exceptions:
  - Create -> throws `BadRequestException` with localized message if persistence/upload fails
  - Read/update -> `NotFoundException` with localized message when entity missing
- Search & resolver log many steps:
  - Incoming RAW query, page, language
  - Filters after parse
  - Resolved slug and attribute IDs
  - Built Prisma `where` conditions (console debug)
  - Product counts and returned sizes
- Warnings are emitted (console.warn) when slugs/attribute codes cannot be resolved — they do not abort the search.
- Sensitive errors should be logged server-side; public responses are localized and generic.

---

## Security & Permissions

- Protected routes (dashboard, protected product) use guards:
  - `ProductOwnershipAndPermissionGuard` verifies ownership or agency permissions
  - `UserStatusGuard` ensures user is active (not suspended)
- For protected product retrieval:
  - Only owners, agency owners of same agency, or agents with `canViewAllPosts` can view non-active products.
- Public endpoints:
  - `search`, `public/:id`, `most-clicks` are public; `public/:id` uses `SoftAuthService` to optionally attach user context for click attribution.

---

## Clicks & Advertisements

- Public product view (`/products/public/:id`) increments click counter:
  - Clicks are recorded in `ProductClicksService` by productId, userId (or 'guest'), and IP.
  - Aggregated click counts are merged into search results to support `most_clicks` sorting and analytics.
- Search query gives priority to products with active advertisements (advertised appear first).

---

## Parsing & Backwards Compatibility

- SearchFiltersHelper.parse supports:
  - New attribute format: arbitrary query keys representing attribute `code` values (e.g., `bedrooms=2-bedrooms,3-bedrooms`)
  - Old attribute format: `attributes[<attributeId>]=4,5` (legacy clients)
  - Both are reconciled: `attributeCodes` -> resolved to `attributes` (ids) by SearchFiltersResolver
- Pagination:
  - Default fixed limit: 12 (configurable when calling parse)
  - Page param normalized to >= 1
  - Offset = (page - 1) * limit

---

## Examples

1) Search by category slug + bedrooms codes + cities:
GET /products/search?category=commercial&bedrooms=2-bedrooms,3-bedrooms&cities=Tirana,Durres&page=2

- parse() builds SearchFiltersDto with attributeCodes: { bedrooms: '2-bedrooms,3-bedrooms' }
- Resolver finds attributeId for `bedrooms` and valueIds for codes, populates `attributes`
- Query builder builds `AND` conditions requiring products to have the attribute value ids
- Repository returns paginated products with click counts and advertisement priority

2) Create product (multipart):
POST /products/add
- Body JSON fields + up to 7 images in `images` multipart field
- Server validates `CreateProductDto` then persists and uploads images concurrently

3) Get public product and increment click:
GET /products/public/123
- Soft auth attaches optional user
- Click is recorded with productId '123', userId or 'guest' and request IP

---

## Observability & Recommended Metrics

Track:
- Search request rates, average response time
- Filter resolution time (slug/attribute DB hits)
- Cache hit ratio (if later added to repo lookups)
- Click increments per minute
- Product create/update success/failure rates
- Web requests that result in permission denials

Add structured (not console) logging, and increase log level for resolver/debug flows in staging only.

---

## Suggested Improvements / TODOs

- Return `total` from search endpoint alongside `products` in dashboard list (currently computed from count).
- Add caching for slug/attribute lookups (Categories, ListingTypes, Attributes) to reduce DB overhead on high traffic.
- Soft-delete support (avoid hard-deleting products; adapt delete behavior).
- Add replay/push for unread notifications of interest (if integrating product events).
- Add full-text search and indices for title/description for improved search relevance.
- Move console.log debug statements to a structured logger (winston/pino) and make level-configurable.
- Add integration tests for:
  - Attribute code resolution
  - Advertisement prioritization
  - Protected route visibility logic
- Allow configuration of fixed limit and maximum allowed limit via environment config.

---

## Module Wiring (excerpt)

Providers registered in the module:

- Repositories:
  - PRODUCT_REPO -> ProductRepository
  - SEARCH_PRODUCT_REPO -> SearchProductRepository
- Utilities:
  - SearchFiltersHelper
  - ProductSearchQueryBuilder
  - SearchFiltersResolver
- Use-cases:
  - CreateProductUseCase, UpdateProductUseCase, GetProductByIdUseCase, SearchProductsUseCase, etc.

Controllers:
- SearchProductsController
- ManageProductController

Imports:
- UsersModule, AgentModule, AgencyModule, ProductClicksModule, ProductImageModule, ProductAttributeValueModule, SoftAuthModule, CommonModule

