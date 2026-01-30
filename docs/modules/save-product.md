### Saved Product Module Documentation

---

### Overview

The Saved Product module allows users to bookmark/save products they're interested in for later viewing. It provides functionality to save products, retrieve saved products with pagination, and remove products from the saved list. This creates a personalized collection of products for each user.

---

### Architecture

This module follows Domain-Driven Design (DDD) principles with clear separation of concerns:

```
save-product/
├── application/
│   └── use-cases/              # Business logic use cases
├── controller/
│   └── saved-product.controller.ts
├── domain/
│   ├── entities/               # Domain entities
│   └── repositories/           # Repository interfaces
├── dto/                        # Data transfer objects
├── infrastructure/
│   └── persistence/            # Data persistence implementation
└── save-product.module.ts
```

---

### Domain Model

---

### Entities

---

### SavedProductEntity

Represents a saved product bookmark for a user.

**Properties:**
- `id`: Unique identifier
- `productId`: ID of the saved product
- `userId`: ID of the user who saved the product
- `savedAt`: Timestamp when the product was saved

**Methods:**
- `static create(userId, productId)`: Factory method to create a new saved product entity
- `isSavedBy(userId)`: Checks if the product is saved by a specific user

**Usage Example:**
```typescript
const savedProduct = SavedProductEntity.create(userId, productId);
```

---

### Repository Interface

---

### ISavedProductRepository

Defines the contract for saved product data operations.

**Methods:**

- `findByUserAndProduct(userId, productId)`: Finds a specific saved product
  - Returns: `Promise<SavedProductEntity | null>`

- `save(entity)`: Saves a product to user's collection
  - Returns: `Promise<SavedProductEntity>`

- `delete(userId, productId)`: Removes a saved product
  - Returns: `Promise<void>`

- `countByUser(userId)`: Counts total saved products for a user
  - Returns: `Promise<number>`

- `findByUserPaginated(userId, language, skip, take)`: Retrieves paginated saved products with full details
  - Returns: `Promise<any[]>` (includes product details, images, categories, etc.)

---

### Use Cases

---

### SaveProductUseCase

Adds a product to the user's saved collection.

**Purpose:** Allow users to bookmark products for later viewing.

**Dependencies:**
- `ISavedProductRepository`

**Method:**
```typescript
execute(userId: number, productId: number, language: SupportedLang): Promise<SavedProductEntity>
```

**Business Logic:**
1. Checks if the product is already saved by the user
2. Throws `ForbiddenException` if already saved
3. Creates new saved product entity
4. Persists to database
5. Returns the saved entity

**Throws:**
- `ForbiddenException`: Product already saved or save operation failed

---

### GetSavedProductsUseCase

Retrieves paginated list of saved products with full details.

**Purpose:** Display user's saved products collection.

**Dependencies:**
- `ISavedProductRepository`

**Method:**
```typescript
execute(userId: number, language: SupportedLang, page: number = 1, limit: number = 12): Promise<PaginatedSavedProductsDto>
```

**Business Logic:**
1. Calculates pagination offset
2. Fetches total count and saved products in parallel
3. Maps database results to DTOs with safe null handling
4. Includes product details (images, category, subcategory, listing type, location, user)
5. Returns paginated response

**Features:**
- Safe null handling for all nested properties
- Multi-language support for categories and listing types
- Formats dates for display
- Default fallback values for missing data

---

### UnsaveProductUseCase

Removes a product from user's saved collection.

**Purpose:** Allow users to remove bookmarked products.

**Dependencies:**
- `ISavedProductRepository`

**Method:**
```typescript
execute(userId: number, productId: number, language: SupportedLang): Promise<void>
```

**Business Logic:**
1. Verifies the saved product exists
2. Throws `NotFoundException` if not found
3. Deletes the saved product record

**Throws:**
- `NotFoundException`: Product not found in saved collection

---

### Data Transfer Objects (DTOs)

---

### SavedProductImage

Represents a product image in the saved products list.

**Properties:**
- `imageUrl`: URL of the product image (nullable)

---

### SavedProductDto

Contains complete information about a saved product for display.

**Properties:**
- `id`: Product ID
- `title`: Product title
- `price`: Product price
- `categoryName`: Translated category name
- `subcategoryName`: Translated subcategory name
- `listingTypeName`: Translated listing type name
- `city`: City name (optional)
- `country`: Country name (optional)
- `user`: Object containing username
- `images`: Array of SavedProductImage
- `savedAt`: Formatted date when product was saved (nullable)

---

### PaginatedSavedProductsDto

Wrapper for paginated saved products response.

**Properties:**
- `products`: Array of SavedProductDto
- `count`: Total number of saved products
- `currentPage`: Current page number
- `totalPages`: Total number of pages

---

### Infrastructure

---

### SavedProductRepository

Implements `ISavedProductRepository` using Prisma ORM.

**Key Features:**
- Composite unique constraint on `user_id` and `product_id`
- Only retrieves active products
- Deep includes for product relationships (images, categories, user, location)
- Language-specific translations for categories and listing types
- Optimized queries with select statements
- Ordered by saved date (most recent first)

**Data Includes:**
- Product images (limited to 2)
- Category and subcategory with translations
- User information
- City and country
- Listing type with translations

**Query Optimization:**
- Uses `findUnique` with composite key for efficient lookups
- Filters by product status (active only)
- Limits image results to reduce payload size

---

### API Endpoints

---

### POST /save-product/:id

Saves a product to user's collection.

**Authentication:** Required

**Parameters:**
- `id` (path): Product ID to save

**Response:**
```json
{
  "success": true,
  "message": "Product saved successfully"
}
```

**Errors:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Product already saved or save failed

---

### GET /save-product/get-saved

Retrieves user's saved products with pagination.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "products": [
    {
      "id": 123,
      "title": "Product Title",
      "price": 99.99,
      "categoryName": "Electronics",
      "subcategoryName": "Phones",
      "listingTypeName": "For Sale",
      "city": "Tirana",
      "country": "Albania",
      "user": { "username": "seller123" },
      "images": [
        { "imageUrl": "https://..." }
      ],
      "savedAt": "2024-01-15"
    }
  ],
  "count": 45,
  "currentPage": 1,
  "totalPages": 4
}
```

**Features:**
- 12 products per page
- Sorted by most recently saved
- Only includes active products
- Language-specific category/listing type names

---

### DELETE /save-product/unsave/:id

Removes a product from user's saved collection.

**Authentication:** Required

**Parameters:**
- `id` (path): Product ID to unsave

**Response:**
```json
{
  "success": true,
  "message": "Product unsaved successfully"
}
```

**Errors:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Product not found in saved collection

---

### Module Configuration

---

### Dependencies
- `PrismaModule`: For database access (implicit)

---

### Providers
- `SaveProductUseCase`: Save product functionality
- `UnsaveProductUseCase`: Unsave product functionality
- `GetSavedProductsUseCase`: Retrieve saved products functionality
- `ISavedProductRepository`: Provided by SavedProductRepository

---

### Database Schema Considerations

The module expects a `savedProduct` table with:

**Fields:**
- `id` (primary key)
- `user_id` (foreign key to users)
- `product_id` (foreign key to products)
- `saved_at` (timestamp)

**Constraints:**
- Composite unique index on `(user_id, product_id)` to prevent duplicates

**Relationships:**
- Many-to-one with `user` table
- Many-to-one with `product` table
- Product includes relationships to: images, subcategory, category, user, city, listing_type

---

### Usage Examples

---

### Save a Product
```typescript
const savedProduct = await saveProductUseCase.execute(
  userId: 123,
  productId: 456,
  language: 'en'
);
```

---

### Get Saved Products
```typescript
const result = await getSavedProductsUseCase.execute(
  userId: 123,
  language: 'en',
  page: 1,
  limit: 12
);

console.log(`Total saved: ${result.count}`);
console.log(`Showing page ${result.currentPage} of ${result.totalPages}`);
```

---

### Unsave a Product
```typescript
await unsaveProductUseCase.execute(
  userId: 123,
  productId: 456,
  language: 'en'
);
```

---

### Best Practices

1. **Duplicate Prevention**: The composite unique constraint ensures users can't save the same product twice
2. **Error Handling**: All use cases provide localized error messages
3. **Null Safety**: GetSavedProductsUseCase includes comprehensive null checks for nested properties
4. **Performance**: Repository limits image results and uses efficient queries
5. **Active Products Only**: Only active products are returned in saved lists
6. **Pagination**: Default 12 items per page for optimal user experience
7. **Language Support**: Categories and listing types are returned in user's language

---

### Error Handling

The module handles several error scenarios:

1. **Already Saved**: Attempting to save a product twice throws ForbiddenException
2. **Not Found**: Unsaving a non-existent saved product throws NotFoundException
3. **Authentication**: All endpoints require authentication
4. **Safe Defaults**: Missing data returns sensible defaults (e.g., "No Category", "Unknown" user)

---

### Localization

The module supports multi-language responses:
- Error messages localized via `t()` function
- Category names translated based on user language
- Subcategory names translated based on user language
- Listing type names translated based on user language

---

### Future Considerations

- Add bulk save/unsave operations
- Implement saved product collections/folders
- Add sorting options (by price, date, title)
- Include product availability status
- Add analytics for saved product trends
- Implement saved product notifications (price drops, availability changes)
- Add sharing functionality for saved collections
- Support for notes/tags on saved products