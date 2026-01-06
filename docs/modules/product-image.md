# Product Image Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Product Image Module handles upload, persistence and removal of product images for listings. It:

- Uploads images to a cloud storage provider (Cloudinary in the current implementation).
- Persists image metadata (URL and cloud provider `publicId`) in the DB via Prisma.
- Deletes images both from Cloudinary and the DB when requested (product updates / deletes).
- Provides read operations to fetch product images (used in product detail and edit flows).
- Exposes application-level use-cases for the Product module.

Module location (example):
- `src/modules/product-image/`

Exports:
- Use-cases: `UploadProductImagesUseCase`, `DeleteProductImagesByProductIdUseCase`, `GetImagesByProductUseCase`
- Repository binding: `PRODUCT_IMAGE_REPO`

---

## Responsibilities

- Validate image files (mime-type, size, count).
- Upload images to Cloudinary and store resulting `url` and `publicId`.
- Remove images from Cloudinary when product images are replaced or product is deleted.
- Provide repository abstraction to decouple persistence (Prisma) from use-cases and allow easier testing.

---

## Public Use-cases

1. UploadProductImagesUseCase
   - Signature:
     execute(files: Express.Multer.File[], productId: number, userId: number, language?: SupportedLang): Promise<{ id: number; imageUrl: string; publicId?: string }[]>
   - Validation:
     - Required: at least one file.
     - Maximum files: 7 (configurable in code).
     - File mime-type must start with `image/`.
     - Maximum file size: 5 MB per image.
   - Upload flow:
     - Iterates files and uploads each to Cloudinary using `cloudinaryService.uploadFile(file, path)`.
     - Creates `ProductImage` domain entity for each uploaded result and persists it via `IProductImageRepository.create`.
     - Returns an array of records `{ id, imageUrl, publicId }`.
   - Errors:
     - Throws `BadRequestException` with localized messages for validation failures or general upload errors.
     - Logs errors server-side before throwing a generic localized error for clients.

2. DeleteProductImagesByProductIdUseCase
   - Signature:
     execute(productId: number): Promise<boolean>
   - Behavior:
     - Fetches images for the product via `productImageRepository.findByProductId`.
     - For each image, if it has a `publicId` calls `cloudinaryService.deleteFile(publicId)`.
     - Deletes DB rows via `productImageRepository.deleteByProductId`.
     - Returns `true` on success.
   - Notes:
     - Attempts to delete cloud files first, then DB rows. The DB delete is performed regardless of cloud deletion results (but errors should be logged).

3. GetImagesByProductUseCase
   - Signature:
     execute(productId: number): Promise<ProductImage[]>
   - Behavior:
     - Returns product image domain entities for the given product ID.

---

## Domain Entity

ProductImage
- Fields:
  - id: number
  - productId: number
  - userId: number
  - imageUrl: string
  - publicId?: string
- Factory:
  - `ProductImage.create({ productId, userId, imageUrl, publicId? })`
- toResponse: returns plain object for persistence/response.

---

## Repository Interface

IProductImageRepository (PRODUCT_IMAGE_REPO)
- Methods:
  - create(image: ProductImage): Promise<ProductImage>;
  - findByProductId(productId: number): Promise<ProductImage[]>;
  - deleteByProductId(productId: number): Promise<void>;
  - delete(id: number): Promise<void>;

Concrete implementation: `ProductImageRepository` (Prisma-backed)
- `create` -> `prisma.productimage.create`
- `findByProductId` -> `prisma.productimage.findMany`
- `deleteByProductId` -> `prisma.productimage.deleteMany`
- `delete` -> `prisma.productimage.delete`

Notes:
- Repository maps Prisma rows to `ProductImage` domain objects before returning.

---

## Cloudinary Integration

- The module depends on a `CloudinaryService` abstraction (provided by `CloudinaryModule`) with methods like:
  - `uploadFile(file: Express.Multer.File, path: string): Promise<{ url: string; publicId: string }>`
  - `deleteFile(publicId: string): Promise<void>`
- Uploaded images store both `imageUrl` (public URL) and `publicId` (Cloudinary reference) in the database.
- `publicId` is required to delete the file from Cloudinary.

Best practices:
- Store both `url` and `publicId` so you can:
  - Remove files from Cloudinary when images are deleted/updated.
  - Re-generate transformed URLs (if needed) using `publicId`.
- Include the product/user context in Cloudinary folder path, e.g. `products/<userId>/<productId>`, to make browsing/cleanup easier.

---

## Validation Rules (current implementation)

- Files:
  - Mime-type must start with `image/`.
  - Max file size: 5 MB per file.
  - Max files per request: 7.
- Errors returned to client use localized messages via `t('...')` keys:
  - `noImage` — no files provided
  - `maxFiveImagesAllowed` — files count exceeded (message key suggests 5; code allows 7 — align messages and code)
  - `invalidFileType` — invalid mime-type
  - `imageTooLarge` — file too large
  - `imageUrlMissingAfterUpload` — cloud upload returned unexpected result
  - `errorUploadingProductImages` — general upload error

Action item: reconcile the `maxFiveImagesAllowed` message key with configured limit (7) for clarity.

---

## Error Handling

- Validation issues throw `BadRequestException` with translated messages.
- Upload failures log the error server-side (`console.error`) and throw a localized `BadRequestException`.
- Cloudinary deletion errors (in Delete use-case) are not fatal for the DB delete but should be logged (consider returning error metadata in future).

---

## Module Wiring

ProductImageModule (registered providers & exports):
- Imports:
  - `CommonModule` (for utilities, localization, etc.)
  - `CloudinaryModule` (provides `CloudinaryService`)
- Providers:
  - Binding: `{ provide: PRODUCT_IMAGE_REPO, useClass: ProductImageRepository }`
  - Use-cases: `UploadProductImagesUseCase`, `DeleteProductImagesByProductIdUseCase`, `GetImagesByProductUseCase`
- Exports:
  - `PRODUCT_IMAGE_REPO`, `UploadProductImagesUseCase`, `DeleteProductImagesByProductIdUseCase`, `GetImagesByProductUseCase`

Usage example (Create product flow):
1. Product created in DB (product repository).
2. Call `UploadProductImagesUseCase.execute(files, createdProduct.id, userId, language)` to upload and persist images.
3. Returned `images` are attached to product response.

Usage example (Update product flow):
1. If images are being replaced, call `DeleteProductImagesByProductIdUseCase.execute(productId)` to remove old images from Cloudinary and DB.
2. Then call `UploadProductImagesUseCase.execute(...)` to persist new images.

---

## Concurrency & Transactions

- Current flow: images are uploaded to Cloudinary first and then persisted in DB one-by-one.
- Potential inconsistency:
  - Upload succeeds but DB insert fails -> orphaned cloud files.
  - DB insert succeeds but subsequent operations fail -> partially completed state.

Recommendations:
- Wrap DB inserts for multiple images in a DB transaction where supported:
  - Upload each file to Cloudinary first, accumulate results (publicId + url).
  - Start DB transaction and insert all image rows.
  - If DB transaction fails, attempt to delete uploaded cloud files (best-effort).
- Alternatively, perform an upsert or include cloudinary upload and DB insert inside a two-phase workflow with compensating deletes on failure.

---

## Security & Privacy

- User-supplied files should be validated for content type and size (already present).
- Consider scanning images for malware or inappropriate content if platform policy requires it.
- Public URLs expose images; consider access control for private images (e.g., pre-signed URLs or authenticated CDN) if needed.
- `publicId` and `imageUrl` are not sensitive, but ensure only authorized users can delete images.

---

## Observability & Metrics

Track:
- Upload success / failure rates
- Average upload time per file
- Cloudinary deletion failures
- Number of images per product distribution

Log at minimum:
- Failure stack traces (structured logger recommended)
- Cloudinary responses for failed uploads (avoid logging full files)

---





## Example Request/Response snippets

Upload (multipart form):
```
POST /products/add
Content-Type: multipart/form-data
Form fields:
- title, price, cityId, subcategoryId, listingTypeId, ...
- images[] (file) up to 7 files
```

Successful upload result (returned by use-case):
```json
[
  { "id": 123, "imageUrl": "https://res.cloudinary.com/.../image1.jpg", "publicId": "products/42/123/abc" },
  { "id": 124, "imageUrl": "https://res.cloudinary.com/.../image2.jpg", "publicId": "products/42/123/def" }
]
```

Delete images (used inside update/delete flows):
- `DeleteProductImagesByProductIdUseCase.execute(productId)` returns `true` on success.

