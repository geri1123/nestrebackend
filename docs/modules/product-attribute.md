# Product Attribute Value Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Product Attribute Value Module manages association of product listings with attribute values (e.g., "bedrooms = 2", "parking = yes"). It provides application use-cases and a Prisma-backed repository to:

- Persist product ⇄ attribute_value relationships
- Bulk-create attribute values for a product
- Delete attribute values for a product (on update/delete)
- Fetch attribute values attached to a product

This module is used by the Product module during product creation and update. It depends on the Filters/Attribute repository to validate attributes and resolve attribute details (inputType, allowed values).

Module location example:
- `src/modules/product-attribute/`

Exports:
- Use-cases: CreateProductAttributeValuesUseCase, DeleteProductAttributeValuesUseCase, GetAttributesByProductUseCase
- Binding for `PRODUCT_ATTRIBUTE_VALUE_REPO` repository

---

## Purpose & Responsibilities

- Validate incoming attribute assignments against subcategory-allowed attributes.
- Support boolean attributes without explicit attributeValueId (maps missing value to 'true').
- Prevent duplicate attribute-value rows and handle DB unique-constraint errors gracefully.
- Provide bulk creation for efficiency (parallel DB inserts with error handling).
- Cleanly delete attribute values by product ID when replacing attributes on update.

---

## Public API (application-level use-cases)

1. CreateProductAttributeValuesUseCase
   - Signature:
     execute(productId: number, subcategoryId: number, attributes: { attributeId: number; attributeValueId?: number }[], language?: SupportedLang): Promise<void>
   - Behavior:
     - Returns early if `attributes` is empty.
     - Asks Filters/Attribute repository for valid attribute IDs for the given `subcategoryId`.
     - Validates each provided attributeId against the allowed set.
     - If attributeValueId is missing:
       - If attribute inputType is `boolean`, it resolves the attribute_value with code `'true'` and uses its id.
       - Otherwise throws BadRequestException with validation error message (localized).
     - Collects processed pairs { attributeId, attributeValueId } and calls repository.createMultiple to persist them.
   - Errors:
     - Throws localized BadRequestException for invalid attribute or missing value when required.
     - Logs warnings for invalid attributes and rejects with validation failure.

2. DeleteProductAttributeValuesUseCase
   - Signature:
     execute(productId: number): Promise<{ count: number }>
   - Behavior:
     - Calls repository.deleteByProductId to remove all attribute links for the product.
     - Returns delete count (useful for auditing).

3. GetAttributesByProductUseCase
   - Signature:
     execute(productId: number): Promise<ProductAttributeValue[]>
   - Behavior:
     - Returns the list of ProductAttributeValue domain objects from repository.findByProductId.

---

## Domain Entity

ProductAttributeValue (domain entity)
- Fields:
  - id: number
  - productId: number
  - attributeId: number
  - attributeValueId: number
- Factory: `ProductAttributeValue.create({...})`
- toResponse: maps the domain object to plain response-friendly object.

---

## Repository (Prisma-backed)

ProductAttributeValueRepository implements IProductAttributeValueRepository and provides:

- create(attributeValue: ProductAttributeValue): Promise<ProductAttributeValue>
  - Inserts a single productattributevalue row and maps it back to domain entity.

- createMultiple(productId: number, attributes: { attributeId: number; attributeValueId: number }[], language: SupportedLang): Promise<void>
  - Performs parallel create operations (Promise.all).
  - Error handling:
    - Catches Prisma known request errors; if error.code === 'P2002' (unique constraint), throws localized BadRequestException describing duplicate attribute value.
    - For other errors, throws generic localized BadRequestException with error message.
  - Note: this method intentionally returns void — failures raise exceptions.

- deleteByProductId(productId: number): Promise<{ count: number }>
  - deleteMany where productId and returns result containing count.

- findByProductId(productId: number): Promise<ProductAttributeValue[]>
  - Finds all rows for product and maps results to ProductAttributeValue domain objects.

Key implementation notes:
- Prisma model used: `productattributevalue` table (naming follows Prisma schema).
- Duplicate insert handling relies on catching Prisma P2002 (unique constraint) error and converting it to a validation error that clients can understand.

---

## Dependencies & Integration

- Filters/Attributes Repository (IAttributeRepo)
  - Methods used:
    - getValidAttributeIdsBySubcategory(subcategoryId): number[]
    - getAttributeById(attributeId): attribute (contains inputType)
    - getAttributeValueByCode(attributeId, valueCode): attributeValue (used to resolve boolean 'true' value)
  - The CreateProductAttributeValuesUseCase relies on the attribute repo to ensure attribute assignments are valid for given subcategory and to lookup boolean `true` value id.

- ProductRepository (caller)
  - Typically CreateProductUseCase and UpdateProductUseCase call the attribute use-cases after product persistence.

---

## Module Wiring

Example providers in `ProductAttributeValueModule`:

- PROVIDE: PRODUCT_ATTRIBUTE_VALUE_REPO -> useClass: ProductAttributeValueRepository
- Use-cases registered as providers and exported:
  - CreateProductAttributeValuesUseCase
  - DeleteProductAttributeValuesUseCase
  - GetAttributesByProductUseCase
- FiltersModule is imported to ensure `AttributeRepo` is available.

File structure (example):
```
src/modules/product-attribute/
├─ application/
│  └─ use-cases/
│     ├─ create-product-attributes.use-case.ts
│     ├─ delete-product-attributes.use-case.ts
│     └─ get-attributes-by-product.use-case.ts
├─ domain/
│  ├─ entities/
│  │  └─ product-attribute-value.entity.ts
│  └─ repositories/
│     └─ product-attribute.repository.interface.ts
├─ infrastructure/
│  └─ persistence/
│     └─ product-attribute.repository.ts
├─ product-attribute.module.ts
```

---

## Error Cases & Messages

- Invalid attribute for subcategory:
  - When attributeId is not allowed for the product’s subcategory, the use-case throws:
    - BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { attributes: [ t('invalidAttributeForSubcategory', language) ] }
      })
- Missing attributeValueId for non-boolean attribute:
  - Throws BadRequestException with localized message recommending attributeValueId is required.
- Boolean attribute but 'true' value missing in DB:
  - Throws BadRequestException indicating the boolean attribute is missing a 'true' value row.
- Duplicate attribute-value insertion:
  - Prisma P2002 triggers BadRequestException with localized duplicate message: t('duplicateAttributeValue', language)
- Generic DB errors:
  - Re-thrown as BadRequestException with `t('somethingWentWrong', language)` and error message in `errors.general`.

---

## Usage Examples

A. Create attributes for newly created product (pseudo-code within CreateProductUseCase):
```ts
await createProductAttributeValuesUseCase.execute(
  createdProduct.id,
  dto.subcategoryId,
  dto.attributes,   // array of { attributeId, attributeValueId? }
  language
);
```

B. Handle update: delete old attributes then create new ones:
```ts
await deleteProductAttributeValuesUseCase.execute(productId);
await createProductAttributeValuesUseCase.execute(productId, subcategoryId, newAttributes, language);
```

C. Read attributes for presentation or edit form:
```ts
const attributeRows = await getAttributesByProductUseCase.execute(productId);
// attributeRows: ProductAttributeValue[]
```

---

## Best Practices & Recommendations

- Validate attribute arrays on the client where possible (send attributeValueId for non-boolean types).
- For boolean attributes, ensure the Filters/Attributes data includes value with code `'true'` (and optionally `'false'`) to allow omission of attributeValueId.
- Keep a unique constraint in DB on (productId, attributeId) or (productId, attributeId, attributeValueId) depending on schema expectations; repository catches duplicates and provides clear validation errors.
- Prefer bulk operations for performance: `createMultiple` reduces round trips.
- Use localized error messages (t('...')) to surface understandable validation errors to API clients.

---

## Observability & Tests

- Add unit tests for:
  - Successful createMultiple for mixed attributes
  - Handling missing attributeValueId for non-boolean attributes
  - Boolean attribute path that resolves 'true'
  - Duplicate insertion -> expect BadRequestException with duplicate key message
- Add integration tests that wire FiltersModule attribute data to validate resolution logic against actual attribute and attribute_value rows.
- Log warnings for invalid attribute IDs (already present). Consider sending metrics for invalid attribute submission rate (helps detect stale clients).

---

## Suggested Improvements / To-dos

- Cache valid attribute IDs per subcategory in FiltersModule (Redis / in-process LRU) to reduce DB hits during product creation at scale.
- Add a bulk upsert method (delete+insert in a single transaction) to ensure atomic replacement of product attributes on update.
- Add transaction wrapper around product creation + attribute insert to guarantee consistency (if product creation succeeds but attributes fail, decide whether to rollback product).
- Normalize attribute value resolution to support multiple value codes (e.g., `'yes'`, `'true'`, `'1'`) for boolean attributes via configurable aliases.
- Add more granular error codes in responses to help clients programmatically handle validation errors.

