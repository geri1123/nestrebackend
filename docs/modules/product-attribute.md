### Product Attribute Module

---

### Overview

The Product Attribute module manages the assignment of attribute values to product listings. It validates that submitted attributes belong to the product's subcategory, handles the special case of boolean attributes (which have no explicit value from the user), and persists all attribute-value pairs efficiently with `createMany`. It is a supporting module with no HTTP controller — all operations are triggered internally during product create/update flows.

---

### Architecture

```
product-attribute/
├── application/
│   └── use-cases/
│       ├── create-product-attributes.use-case.ts
│       ├── delete-product-attributes.use-case.ts
│       └── get-attributes-by-product.use-case.ts
├── domain/
│   ├── entities/
│   │   └── product-attribute-value.entity.ts
│   └── repositories/
│       └── product-attribute.repository.interface.ts
├── infrastructure/
│   └── persistence/
│       └── product-attribute.repository.ts
└── product-attribute.module.ts
```

---

### Domain Entity

### ProductAttributeValue

Represents a single attribute-value assignment on a product. Uses private constructor — instantiated via `ProductAttributeValue.create(data)`.

**Properties:** `id`, `productId`, `attributeId`, `attributeValueId`

**`toResponse()`:** Returns a plain object with all four fields.

---

### Repository Interface

### IProductAttributeValueRepository

- `create(entity)` → `Promise<ProductAttributeValue>`: Single insert
- `createMultiple(productId, attributes[])` → `Promise<void>`: Batch insert with `skipDuplicates: true`
- `deleteByProductId(productId)` → `Promise<{ count: number }>`: Deletes all attributes for a product
- `findByProductId(productId)` → `Promise<ProductAttributeValue[]>`: Returns all attribute values for a product

---

### Use Cases

---

### CreateProductAttributeValuesUseCase

Validates and batch-inserts attribute values for a product.

**Dependencies:** `IProductAttributeValueRepository`, `IAttributeRepo` (from FiltersModule)

**Input:** `productId`, `subcategoryId`, `attributes: { attributeId, attributeValueId? }[]`, `language`

**Validation Flow (per attribute):**

1. Fetch `validAttributeIdsBySubcategory(subcategoryId)` — set of valid attribute IDs for this subcategory
2. For each submitted attribute:
   - If `attributeId` not in valid set → throw `BadRequestException` (invalid attribute for subcategory)
   - If `attributeValueId` is missing:
     - Fetch attribute details
     - If `inputType === 'boolean'` → auto-resolve to the `'true'` value via `getAttributeValueByCode(attrId, 'true')`
     - Otherwise → throw `BadRequestException` (valueId required for non-boolean)
3. Batch-insert all validated pairs via `createMultiple`

**Error handling:** Prisma `P2002` (duplicate) is caught and re-thrown as a localized `BadRequestException`.

**Short-circuit:** If `attributes` array is empty or null, returns immediately (no-op).

---

### DeleteProductAttributeValuesUseCase

Deletes all attribute values for a product (used when updating a product to clear and re-assign attributes).

**Input:** `productId`

**Returns:** `{ count: number }`

---

### GetAttributesByProductUseCase

Returns all attribute-value assignments for a product. Used when building the product detail response.

**Input:** `productId`

**Returns:** `Promise<ProductAttributeValue[]>`

---

### Module Configuration

**Imports:** `FiltersModule` (for `IAttributeRepo`)

**Providers:** `CreateProductAttributeValuesUseCase`, `DeleteProductAttributeValuesUseCase`, `GetAttributesByProductUseCase`, `ProductAttributeValueRepository` (token: `PRODUCT_ATTRIBUTE_VALUE_REPO`)

**Exports:** All use cases + `PRODUCT_ATTRIBUTE_VALUE_REPO` token — consumed by `ProductModule`

---

### Boolean Attribute Special Case

Some attributes (e.g. "Has parking", "Has elevator") are boolean. The user submits the attribute ID without a value ID (just indicating it's present). The use case auto-resolves this to the `'true'` `AttributeValue` record for that attribute. The `'false'` value is never submitted — the absence of the attribute implies false.

---

### Database Schema

**ProductAttributeValue table:** `id`, `productId` (FK), `attributeId` (FK), `attributeValueId` (FK), with a unique constraint on `(productId, attributeId, attributeValueId)` (skipDuplicates handles races)

**Relationships:**
- Many-to-one with `Product`
- Many-to-one with `Attribute`
- Many-to-one with `AttributeValue`