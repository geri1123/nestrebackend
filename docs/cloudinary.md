## CloudinaryService

Purpose:
- Handle image upload and deletion via Cloudinary
- Centralize image processing logic
- Return CDN-hosted image URLs

Behavior:
- Uses Cloudinary streaming upload
- Logs upload and delete operations
- Throws errors (no silent failures)

Upload rules:
- Max size: 5MB
- Type: image
- Max resolution: 800×800
- Crop mode: limit
- Quality: auto
- Format: auto

Upload result:
- url → public CDN URL
- publicId → identifier used for deletion

Delete:
- Deletes image by publicId
- Logs result
- Re-throws errors

Configuration:
- Loaded from AppConfigService
- Requires:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

Design:
- Implemented as NestJS service
- Global module
- Uses stream upload (no temp files)

Notes:
- Images are public by default
- Do not upload sensitive content
- Supports images only

Usage:
- Profile images
- Product images
- Media assets