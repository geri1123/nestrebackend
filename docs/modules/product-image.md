### Product Image Module

---

### Overview

The Product Image module manages uploading, retrieving, and deleting images for property listings. Images are stored on Cloudinary (cloud CDN) and their URLs and public IDs are persisted in the database. The module supports both single-product bulk deletes (with Cloudinary cleanup) and targeted deletion by image IDs. It has no HTTP controller — all operations are triggered internally by the Product module.

---

### Architecture

```
product-image/
├── application/
│   └── use-cases/
│       ├── upload-product-images.use-case.ts
│       ├── delete-product-images-by-product-id.use-case.ts
│       └── get-images-by-product.use-case.ts
├── domain/
│   ├── entities/
│   │   └── product-image.entity.ts
│   └── repositories/
│       └── product-image.repository.interface.ts
├── infrastructure/
│   └── persistence/
│       └── product-image.repository.ts
└── product-image.module.ts
```

---

### Domain Entity

### ProductImage

Represents a single product image. Private constructor — use `ProductImage.create(data)`.

**Properties:** `id`, `productId`, `userId`, `imageUrl`, `publicId` (Cloudinary public ID, used for deletion)

**`toResponse()`:** Returns plain object with all fields.

---

### Repository Interface

### IProductImageRepository

- `create(image)` → `Promise<ProductImage>`: Inserts a single image record
- `findByProductId(productId)` → `Promise<ProductImage[]>`: All images for a product
- `findByIds(ids)` → `Promise<ProductImage[]>`: Fetch by specific IDs (for targeted deletion)
- `deleteByProductId(productId)` → `Promise<void>`: Delete all images for a product from DB
- `deleteByUrls(urls)` → `Promise<void>`: Delete by URL list
- `deleteByIds(ids)` → `Promise<void>`: Delete by ID list from DB
- `delete(id)` → `Promise<void>`: Delete single image from DB

---

### Use Cases

---

### UploadProductImagesUseCase

Uploads images to Cloudinary and persists records.

**Dependencies:** `IProductImageRepository`, `CloudinaryService`

**Input:** `files: Express.Multer.File[]`, `productId`, `userId`, `language`

**Validation:**
- `files` must be non-empty — throws `BadRequestException` if no files
- Maximum 7 files per upload — throws if exceeded
- Each file must have `mimetype` starting with `image/` — throws on non-image
- Each file must be ≤ 5MB — throws if too large

**Flow (per file in parallel):**
1. `CloudinaryService.uploadFile(file, 'products/{userId}/{productId}')` → `{ url, publicId }`
2. `ProductImage.create({ productId, userId, imageUrl: url, publicId })`
3. `productImageRepository.create(entity)`
4. Returns `{ id, imageUrl, publicId }`

**Returns:** `{ id, imageUrl }[]`

---

### DeleteProductImagesByProductIdUseCase

Handles image deletion with separate strategies for two scenarios:

**`execute(productId)`** — Full cleanup (used when updating/replacing images):
1. `findByProductId(productId)` — get all image records
2. Delete each image from Cloudinary via `cloudinaryService.deleteFile(publicId)` (parallel)
3. `productImageRepository.deleteByProductId(productId)` — remove DB records

**`deleteFromCloud(publicId)`** — Cloud-only deletion (used when the product itself is deleted, since DB cascade handles the records):
1. `cloudinaryService.deleteFile(publicId)` — removes from Cloudinary only

**`deleteByIds(ids)`** — Targeted deletion by image IDs:
1. `findByIds(ids)` — fetch image records for public IDs
2. Delete each from Cloudinary (parallel)
3. `deleteByIds(ids)` — remove DB records

---

### GetImagesByProductUseCase

Simple lookup — returns all `ProductImage` records for a given `productId`.

---

### Module Configuration

**Providers:** `UploadProductImagesUseCase`, `DeleteProductImagesByProductIdUseCase`, `GetImagesByProductUseCase`, `ProductImageRepository` (token: `PRODUCT_IMAGE_REPO`)

**Exports:** All three use cases + `PRODUCT_IMAGE_REPO` — consumed by `ProductModule`

---

### Cloudinary Path Structure

Images are uploaded to: `products/{userId}/{productId}/` — this allows easy bulk deletion by prefix when needed.

---

### Database Schema

**ProductImage table:** `id`, `productId` (FK, `onDelete: Cascade`), `userId` (FK), `imageUrl` (nullable string), `publicId` (nullable string — Cloudinary identifier), `createdAt`

**Note on cascade:** When a product is deleted, DB cascade removes the `ProductImage` records automatically. The use case only needs to clean up Cloudinary. This is why `deleteFromCloud` exists as a separate method.

---

### File Constraints

| Constraint | Limit |
|---|---|
| Max files per upload | 7 |
| Max file size | 5 MB |
| Allowed types | Any `image/*` MIME type |