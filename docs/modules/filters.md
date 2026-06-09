### Filters Module

---

### Overview

The Filters module provides all public reference/lookup data needed for the product search UI: categories with subcategories, listing types, subcategory-specific attributes, countries, and cities. All endpoints are `@Public()` and return translated content based on the request language. Product counts are included so the frontend can show how many listings exist per category.

---

### Architecture

```
filters/
├── filters.controller.ts
├── filters.module.ts
├── filters.service.ts
├── decorators/
│   └── filters-swagger.decorators.ts
├── dto/
│   ├── attribute.dto.ts
│   ├── filters.dto.ts
│   └── location.dto.ts
└── repositories/
    ├── category/
    │   ├── Icategory.repository.ts
    │   └── category.repository.ts
    ├── listingtype/
    │   ├── Ilistingtype.repository.ts
    │   └── listingtype.repository.ts
    ├── attributes/
    │   ├── Iattribute.repository.ts
    │   └── attributes.repository.ts
    └── location/
        ├── Ilocation.repository.ts
        └── location.repository.ts
```

---

### FiltersService

The main service orchestrating data retrieval for all filter-related queries.

**Methods:**
- `getFilters(lang, productsStatus)` → `{ categories, listingTypes, totalProductCount }` — fetches categories (with subcategories and product counts), listing types, and total product count in parallel
- `getAttributes(subcategoryId, lang)` → attributes array — fetches all attributes and values for a subcategory, translated
- `getCountries()` → countries array
- `getCities(countryCode)` → cities for a country

---

### API Endpoints

All endpoints are `@Public()` and `@ApiTags('Filters')`.

---

### GET /filters

Returns all categories (with subcategories), listing types, and total active product count. Language is determined from the `Accept-Language` header or default (`al`).

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Residenciale",
      "slug": "residential",
      "productCount": 68,
      "subcategories": [
        { "id": 1, "name": "Shtëpi private", "slug": "house", "categoryId": 1, "productCount": 61 }
      ]
    }
  ],
  "listingTypes": [
    { "id": 1, "name": "Në shitje", "slug": "for-sale", "productCount": 38 }
  ],
  "totalProductCount": 100
}
```

---

### GET /filters/attributes/:subcategoryId

Returns all attributes and their selectable values for a specific subcategory. Used to render dynamic attribute filters/inputs when creating or searching listings.

**Path Parameter:** `subcategoryId` (integer)

**Response:**
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
        { "id": 4, "valueCode": "2-rooms", "name": "2 Dhoma" },
        { "id": 5, "valueCode": "3-rooms", "name": "3 Dhoma" }
      ]
    }
  ]
}
```

**Input types:** `text`, `number`, `select`, `multiselect`, `checkbox`, `radio`, `boolean`

Returns `{ success: false, attributes: [] }` for invalid subcategoryId (non-numeric or ≤ 0) without throwing.

---

### GET /filters/countries

Returns all countries with their ISO codes.

**Response:**
```json
{
  "success": true,
  "countries": [
    { "id": 4, "name": "Albania", "code": "AL" }
  ]
}
```

---

### GET /filters/cities/:countryCode

Returns all cities for a given country code.

**Path Parameter:** `countryCode` (e.g. `"AL"`)

**Response:**
```json
{
  "success": true,
  "cities": [
    { "id": 1, "name": "Tirana", "countryId": 4 }
  ]
}
```

---

### Repository Interfaces

**ICategoryRepository:** `getFilters(lang, status)` — returns categories + subcategories + product counts in the given language; `getTotalProductCount(status)` — total active listing count

**IListingTypeRepository:** `getAll(lang, status)` — listing types with translated names and product counts

**IAttributeRepo:** `getValidAttributeIdsBySubcategory(subcategoryId)` — for validation in product-attribute module; `getAttributeById(id)`, `getAttributeValueByCode(attrId, code)`, `getAttributesBySubcategory(subcategoryId, lang)` — for attribute lookups

**ILocationRepository:** `getCountries()`, `getCitiesByCountryCode(code)`

---

### Module Configuration

**Controller:** `FiltersController`

**Providers + Exports (repository tokens):**
- `CATEGORY_REPO` → `CategoryRepository`
- `LISTING_TYPE_REPO` → `ListingTypeRepo`
- `LOCATION_REPO` → `LoationRepository`
- `ATTRIBUTE_REPO` → `AttributeRepo`
- `FiltersService`

**Exports:** All repository tokens and `FiltersService` — consumed by `ProductAttributeValueModule` for attribute validation during product creation.