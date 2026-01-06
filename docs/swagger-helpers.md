## ApiSearchFilters (Swagger Decorator)

Purpose:
- Reusable Swagger decorator for search filter query params
- Documents the `filters` query as a deepObject based on `SearchFiltersDto`

Behavior:
- Adds `SearchFiltersDto` to Swagger models (`ApiExtraModels`)
- Registers a query parameter:
  - name: `filters`
  - required: false
  - style: `deepObject`
  - explode: true
  - schema: $ref → `SearchFiltersDto`

Usage:
- Add on controller methods that support filtered product search
- Example:
  - `@ApiSearchFilters()`
  - `GET /products?filters[cityId]=1&filters[priceMin]=100`

Why:
- Avoids repeating Swagger config for filters
- Keeps API docs in sync with `SearchFiltersDto`
- Makes complex filter queries clearly documented in Swagger UI