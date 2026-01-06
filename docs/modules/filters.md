# Filters Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Filters Module provides public lookup and search-filter data for the Real Estate platform. It centralizes and optimizes retrieval of search-related metadata such as:

- Categories & subcategories (with product counts)
- Listing types (e.g., For Sale, For Rent) (with product counts)
- Dynamic product attributes per subcategory (e.g., rooms, bathrooms)
- Countries & cities

Key properties:
- Fully localized
- Cache-optimized to reduce DB load and improve latency
- All endpoints are public (safe reference data)
- DB access via Prisma repositories

Module location:
- `src/modules/filters`

Exports:
- `FiltersService` (plus controllers/providers as usual)

---

## Endpoints

All endpoints are public (no auth required). Language is resolved via middleware (see Localization).

### GET /filters
Returns all main filter options used across the platform.

- Path: `/filters`
- Method: `GET`
- Response (success):
  ```json
  {
    "success": true,
    "categories": [...],
    "listingTypes": [...]
  }
  ```
- Includes:
  - Categories (with nested subcategories and product counts)
  - Listing types (with product counts)
- Typical uses:
  - Homepage search
  - Product listing filters
  - Mobile / Web filter UI

### GET /filters/attributes/:subcategoryId
Returns dynamic attributes tied to a Subcategory.

- Path: `/filters/attributes/:subcategoryId`
- Method: `GET`
- Path params:
  - `subcategoryId` — integer ID of the subcategory
- Response (success example):
  ```json
  {
    "success": true,
    "attributes": [
      {
        "id": 1,
        "code": "rooms",
        "inputType": "select",
        "name": "Dhoma",
        "values": [
          { "id": 4, "value_code": "2-rooms", "name": "2 Dhoma" }
        ]
      }
    ]
  }
  ```
- Response (invalid ID):
  ```json
  {
    "success": false,
    "attributes": []
  }
  ```
- Typical uses:
  - Creating a property
  - Editing a property
  - Filtering search results

### GET /filters/countries
Returns all supported countries.

- Path: `/filters/countries`
- Method: `GET`
- Typical uses:
  - Property posting
  - User profiles
  - Agency registration

### GET /filters/cities/:countryCode
Returns all cities for a given country.

- Path: `/filters/cities/:countryCode`
- Method: `GET`
- Path params:
  - `countryCode` — ISO country code (string)
- Typical uses:
  - Location filtering
  - Property publishing

---

## Response DTOs (Summary)

Below are the primary DTO shapes used by the API. DTOs include OpenAPI decorators and examples in implementation.

TypeScript-style DTOs (illustrative):

```ts
// Category DTOs
export interface CategoryDto {
  id: number;
  code: string;
  name: string; // localized
  subcategories?: SubcategoryDto[];
}

export interface SubcategoryDto {
  id: number;
  code: string;
  name: string; // localized
  productCount?: number;
}

export interface ListingTypeDto {
  id: number;
  code: string;
  name: string; // localized
  productCount?: number;
}

export interface FiltersResponseDto {
  success: boolean;
  categories: CategoryDto[];
  listingTypes: ListingTypeDto[];
}

// Attribute DTOs
export interface AttributeDto {
  id: number;
  code: string;
  inputType: 'select' | 'checkbox' | 'number' | 'text' | 'range' | string;
  name: string; // localized or "No translation"
  values?: AttributeValueDto[];
}

export interface AttributeValueDto {
  id: number;
  value_code: string;
  name: string; // localized or "No translation"
}

export interface AttributesResponseDto {
  success: boolean;
  attributes: AttributeDto[];
}

// Location DTOs
export interface CountryDto {
  code: string;
  name: string; // localized or "No translation"
}

export interface CityDto {
  id: number;
  name: string; // localized or "No translation"
}

export interface CountriesResponseDto {
  success: boolean;
  countries: CountryDto[];
}

export interface CitiesResponseDto {
  success: boolean;
  cities: CityDto[];
}
```

Notes:
- All DTOs validate types and provide examples via OpenAPI decorators in code.
- If translation is missing for a string, the module returns "No translation" as the value (explicitly).

---

## Caching Strategy

The module uses cache to reduce DB load. TTLs are tuned per data volatility.

TTL table:
- Categories: 2 days
- Listing Types: 12 hours
- Attributes: 24 hours
- Countries: 7 days
- Cities: 12 hours
- Default fallback TTL: 1 hour

Cache keys (examples):
- `categories:<lang>`
- `listingTypes:<lang>`
- `attributes:<subcategoryId>:<lang>`
- `countries`
- `cities:<countryCode>`

Behavior:
- On request: check cache key
  - If cache hit: return cached value and optionally log `[CACHE HIT]`
  - If cache miss: load from DB, set cache, log `[CACHE MISS]` and `[CACHE SET]`
- Console logs used for quick debugging:
  - `[CACHE HIT]`
  - `[CACHE MISS]`
  - `[CACHE SET]`

Cache fallback:
- If caching layer fails, fall back to DB and serve data.
- Errors are logged but responses aim to stay available (unless DB fails).

---

## Repositories & Data Access

All DB access goes through Prisma repositories. Responsibilities:

- CategoryRepository
  - Loads categories + subcategories
  - Joins translations
  - Computes product count for each subcategory (only active products)
- ListingTypeRepository
  - Loads listing types with localized names
  - Computes product counts (active)
- AttributeRepository
  - Loads subcategory-specific attributes
  - Loads attribute values with localization
- LocationRepository
  - Loads countries and cities with localization

Implementation notes:
- Counts only include active products.
- Repositories handle missing translations (return "No translation").

---

## Localization

- Language is determined by middleware (example: from `Accept-Language` header or custom nginx middleware).
- Default language: `al` (Albanian) — adjust to your platform default if different.
- Translation tables used:
  - `categorytranslation`
  - `subcategorytranslation`
  - `attributeTranslation`
  - `attributeValueTranslations`
- When a translation row is missing, return `"No translation"` for that field rather than null.

---

## Security

- All endpoints are public. In code this is annotated with the platform's public marker, e.g.:
  ```ts
  @Public()
  ```
- Rationale:
  - Data is harmless reference data
  - Caching and public exposure are safe and required for performance and UX

---

## Error Handling & Logging

- Standard response shape includes `success` boolean.
- On partial or full failure, log errors server-side with context (repository, key, subcategoryId, etc.).
- Example failing attributes response:
  ```json
  {
    "success": false,
    "attributes": []
  }
  ```
- Logs to check:
  - Cache logs: `[CACHE HIT]`, `[CACHE MISS]`, `[CACHE SET]`
  - Repository errors: include stack and context (do not leak sensitive info)

---

## Usage Examples (curl)

Get all filters:
```bash
curl -X GET 'https://api.example.com/filters' -H 'Accept-Language: en'
```

Get attributes for subcategory id 42:
```bash
curl -X GET 'https://api.example.com/filters/attributes/42' -H 'Accept-Language: en'
```

Get countries:
```bash
curl -X GET 'https://api.example.com/filters/countries'
```

Get cities for country code `AL`:
```bash
curl -X GET 'https://api.example.com/filters/cities/AL'
```


## Implementation Tips & Best Practices

- Make caching language-aware for localized resources (include `<lang>` in cache key).
- Cache product counts separately if they change more frequently than static metadata.
- Use efficient Prisma queries and appropriate indices on translation and product tables.
- Ensure repositories return the same DTO shape whether data comes from DB or cache.
- Add metrics around cache hit ratio and response latency.
- For attributes, support input types: select, checkbox, range, number, text to let frontends render appropriate controls.
- When adding new attributes or translations, consider cache invalidation policy for affected keys.

---

## Why This Module Exists

- Centralizes search filter logic and data
- Improves UX performance by caching critical, widely used metadata
- Ensures consistent localized labels across web and mobile
- Keeps code DRY by preventing duplicate queries in different services

---

## Appendix

- Console log examples:
  ```
  [CACHE MISS] categories:en
  [CACHE SET] categories:en (ttl=172800)
  [CACHE HIT] categories:en
  ```
- Example cache TTLs in seconds:
  - Categories: 172800 (2 days)
  - ListingTypes: 43200 (12 hours)
  - Attributes: 86400 (24 hours)
  - Countries: 604800 (7 days)
  - Cities: 43200 (12 hours)
  - Default: 3600 (1 hour)
  
  
## Folder location
- `src/modules/filters`