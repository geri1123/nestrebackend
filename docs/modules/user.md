# Users Module Documentation

## Overview

The Users Module is a comprehensive NestJS module implementing Domain-Driven Design (DDD) principles to manage user profiles, authentication data, password recovery, and profile images. It follows clean architecture patterns with clear separation between domain logic, application use cases, infrastructure, and presentation layers.

## Architecture

```
src/modules/users/
├── application/
│   └── use-cases/
│       ├── Profile Management
│       ├── Password Management
│       └── User Lookup
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── types/
├── infrastructure/
│   └── persistence/
├── controllers/
├── dto/
└── responses/
```

## Module Dependencies

### External Modules
- **EmailModule**: Email notifications for password recovery and verification
- **AppCacheModule**: Redis-based caching for tokens and temporary data
- **CommonModule**: Shared utilities and helpers
- **CloudinaryModule**: Cloud-based image storage and management
- **PrismaModule**: Database ORM (implicit through repositories)

### Repository Tokens
- `USER_REPO`: Main user repository interface token
- `USERNAME_REPO`: Username history repository interface token

## Domain Layer

### Entities

#### User Entity
The core domain entity representing a user in the system.

```typescript
class User {
  id: number
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  aboutMe: string | null
  profileImgUrl: string | null
  profileImgPublicId: string | null
  phone: string | null
  role: userRole
  status: userStatus
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date | null
  lastLogin: Date | null
}
```

**Domain Rules:**
- `isActive()`: User must be active and email verified
- `canUpdateUsername(lastChangeDate, daysLimit)`: Username can only change every 60 days (default)
- `updateProfile(data)`: Updates firstName, lastName, aboutMe, phone
- `updateProfileImage(url, publicId)`: Sets profile image details
- `removeProfileImage()`: Clears profile image fields
- `hasProfileImage()`: Checks if user has a profile image

#### UsernameHistory Entity
Tracks username changes with cooldown enforcement.

```typescript
class UsernameHistory {
  id: number
  userId: number
  oldUsername: string
  newUsername: string
  nextUsernameUpdate: Date
}
```

### Value Objects

#### NavbarUser
Lightweight user representation for navigation/header display.

```typescript
class NavbarUser {
  username: string
  email: string
  profileImg: string | null
  lastLogin: Date | null
  role: string
}
```

### Repository Interfaces

#### IUserDomainRepository
Primary repository interface for user operations.

**Methods:**
- `findById(userId)`: Get user by ID
- `findByIdentifier(identifier)`: Find by username or email
- `findByEmail(email)`: Find by email
- `findByIdentifierForAuth(identifier)`: Minimal fields for authentication
- `findByIdentifierForVerification(identifier)`: Fields needed for email verification
- `findByIdWithPassword(userId)`: Get user with password hash
- `usernameExists(username)`: Check username availability
- `emailExists(email)`: Check email availability
- `create(data, tx?)`: Create new user
- `updateFields(userId, fields, tx?)`: Update specific fields
- `updateUsername(userId, newUsername)`: Change username
- `updatePassword(userId, newPassword)`: Update password hash
- `updateProfileImage(userId, imageUrl, publicId)`: Set profile image
- `deleteProfileImage(userId)`: Remove profile image
- `verifyEmail(userId, emailVerified, status, tx?)`: Mark email as verified
- `getNavbarUser(userId)`: Get navbar representation
- `findUnverifiedBefore(date)`: Find unverified users (cleanup)
- `deleteById(userId)`: Delete user account

#### IUsernameHistoryDomainRepository
Repository for username change history.

**Methods:**
- `getLastUsernameChange(userId)`: Get most recent username change
- `saveUsernameChange(userId, oldUsername, newUsername, nextUpdateDate)`: Record username change

## Application Layer (Use Cases)

### Profile Management

#### GetUserProfileUseCase
Retrieves complete user profile information.

**Input:** `userId`, `language`  
**Output:** `User` entity  
**Errors:** `NotFoundException` if user not found

```typescript
execute(userId: number, language: SupportedLang): Promise<User>
```

#### GetNavbarUserUseCase
Retrieves minimal user data for navigation display.

**Input:** `userId`, `language`  
**Output:** `NavbarUser` value object  
**Errors:** `NotFoundException` if user not found

```typescript
execute(userId: number, language: SupportedLang): Promise<NavbarUser>
```

#### UpdateUserProfileUseCase
Updates user profile fields (firstName, lastName, aboutMe, phone).

**Input:** `userId`, `UpdateProfileData`, `language`  
**Output:** Success message with updated fields  
**Business Logic:**
1. Verify user exists
2. Update domain entity
3. Map to database fields
4. Persist changes
5. Return localized success messages

```typescript
execute(
  userId: number,
  data: UpdateProfileData,
  language: SupportedLang
): Promise<{ success: boolean; message: string }>
```

#### ChangeUsernameUseCase
Changes user's username with cooldown enforcement.

**Input:** `userId`, `newUsername`, `language`  
**Output:** Success message  
**Business Logic:**
1. Verify user exists
2. Check username availability
3. Verify 60-day cooldown period
4. Update username
5. Record change in history
6. Set next available change date

**Errors:**
- Username already taken
- Changed too recently (within 60 days)

```typescript
execute(
  userId: number,
  newUsername: string,
  language: SupportedLang
): Promise<{ success: boolean; message: string }>
```

### Image Management

#### UploadProfileImageUseCase
Uploads and updates user profile image.

**Input:** `userId`, `file`, `language`  
**Output:** `{ url, publicId }`  
**Business Logic:**
1. Validate file (type, size)
2. Verify user exists
3. Upload to Cloudinary
4. Update domain entity
5. Persist to database
6. Delete old image if exists
7. Rollback on failure

**Error Handling:**
- File validation errors
- Upload failures
- Database update failures with Cloudinary rollback

```typescript
execute(
  userId: number,
  file: Express.Multer.File,
  lang: SupportedLang
): Promise<{ url: string; publicId: string }>
```

#### DeleteProfileImageUseCase
Removes user's profile image.

**Input:** `userId`, `language`  
**Output:** `void`  
**Business Logic:**
1. Verify user has an image
2. Delete from Cloudinary
3. Update domain entity
4. Clear database fields

**Errors:** No image to delete

```typescript
execute(userId: number, lang: SupportedLang): Promise<void>
```

### Password Management

#### RequestPasswordResetUseCase
Initiates password reset flow.

**Input:** `email`, `language`  
**Output:** `void` (always success for security)  
**Business Logic:**
1. Find user by email
2. Verify user is active
3. Generate secure token
4. Cache token with 10-minute TTL
5. Send recovery email with token

**Security:** Returns success even if user not found (prevents email enumeration)

```typescript
execute(email: string, lang: SupportedLang): Promise<void>
```

#### ResetPasswordUseCase
Completes password reset with token.

**Input:** `token`, `newPassword`, `language`  
**Output:** `void`  
**Business Logic:**
1. Validate token from cache
2. Verify user exists
3. Check new password differs from current
4. Hash and update password
5. Invalidate token

**Errors:**
- Invalid/expired token
- Same as current password
- User not found

```typescript
execute(token: string, newPassword: string, lang: SupportedLang): Promise<void>
```

#### VerifyPasswordResetTokenUseCase
Validates password reset token.

**Input:** `token`, `language`  
**Output:** `boolean`  
**Purpose:** Pre-validation before showing reset form

```typescript
execute(token: string, lang: SupportedLang): Promise<boolean>
```

### User Lookup Use Cases

#### FindUserByIdUseCase
Finds user by ID with error handling.

**Input:** `userId`, `language`  
**Output:** `User` entity  
**Errors:** `NotFoundException` if not found

#### FindUserByIdentifierUseCase
Finds user by username or email.

**Input:** `identifier`  
**Output:** `User | null`  
**Note:** No error thrown, returns null

#### FindUserForAuthUseCase
Retrieves minimal user data for authentication (includes password hash).

**Input:** `identifier`  
**Output:** Auth-specific user data  
**Fields:** id, password, status, role, username, email

#### FindUserForVerificationUseCase
Retrieves user data for email verification flow.

**Input:** `identifier`, `language`  
**Output:** Verification-specific user data  
**Fields:** id, email, first_name, role, status, email_verified  
**Errors:** `NotFoundException` if not found

#### FindUnverifiedUsersUseCase
Finds users with unverified emails before a date (for cleanup jobs).

**Input:** `beforeDate`  
**Output:** Array of user IDs

### System Use Cases

#### UpdateUserFieldsUseCase
Generic field update with transaction support.

**Input:** `userId`, `fields`, `language`, `tx?`  
**Output:** Success status  
**Purpose:** Low-level field updates with optional transaction

```typescript
execute(
  userId: number,
  fields: Partial<UpdateUserFields>,
  lang: SupportedLang,
  tx?: Prisma.TransactionClient
): Promise<{ success: boolean }>
```

#### UpdateLastLoginUseCase
Updates user's last login timestamp.

**Input:** `userId`  
**Output:** `void`  
**Purpose:** Called after successful authentication

#### VerifyUserEmailUseCase
Marks user email as verified and updates status.

**Input:** `userId`, `newStatus`, `tx?`  
**Output:** `void`  
**Purpose:** Called after email verification token validated

## Presentation Layer (Controllers)

### ProfileController
Handles user profile operations.

**Base Path:** `/profile`

#### Endpoints

**GET `/profile/me`**
- **Auth:** Required
- **Purpose:** Get complete user profile
- **Response:** `UserProfileResponse`

**GET `/profile/navbar`**
- **Auth:** Required
- **Purpose:** Get navbar user data
- **Response:** `NavbarProfileResponse`

**PATCH `/profile/update`**
- **Auth:** Required
- **Body:** `UpdateProfileDto`
- **Validation:** firstName, lastName, aboutMe, phone
- **Response:** Success message

**PATCH `/profile/username`**
- **Auth:** Required
- **Body:** `UsernameDto`
- **Validation:** 4-30 chars, alphanumeric + underscore
- **Response:** Success message

### ProfilePictureController
Manages profile image uploads and deletion.

**Base Path:** `/profile-image`

#### Endpoints

**PATCH `/profile-image`**
- **Auth:** Required
- **Content-Type:** multipart/form-data
- **Field:** `file`
- **Validation:** Image type, max size
- **Response:** 
```json
{
  "success": true,
  "message": "Image successfully uploaded",
  "imageUrl": "https://..."
}
```

**DELETE `/profile-image`**
- **Auth:** Required
- **Response:**
```json
{
  "success": true,
  "message": "Image successfully deleted"
}
```

### PasswordController
Handles password recovery flow.

**Base Path:** `/password`

#### Endpoints

**POST `/password/forgot-password`**
- **Auth:** Public
- **Body:** `RecoverPasswordDto` (email)
- **Response:**
```json
{
  "success": true,
  "message": "Password reset link sent"
}
```

**POST `/password/reset-password`**
- **Auth:** Public
- **Body:** `ResetPasswordDto` (token, newPassword, repeatPassword)
- **Validation:**
  - Password min 8 chars
  - Passwords must match
- **Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## DTOs (Data Transfer Objects)

### RecoverPasswordDto
```typescript
{
  email: string  // Valid email format
}
```

### ResetPasswordDto
```typescript
{
  token: string           // Reset token from email
  newPassword: string     // Min 8 characters
  repeatPassword: string  // Must match newPassword
}
```

### UpdateProfileDto
```typescript
{
  firstName?: string   // 1-50 chars
  lastName?: string    // 1-50 chars
  aboutMe?: string     // 0-500 chars
  phone?: string       // 5-20 chars
}
```

### UsernameDto
```typescript
{
  username: string  // 4-30 chars, alphanumeric + underscore only
}
```

## Response Objects

### UserProfileResponse
Complete user profile with all fields formatted for client.

### NavbarProfileResponse
Minimal user data for navigation display.

## Infrastructure Layer

### UserRepository
Implements `IUserDomainRepository` using Prisma ORM.

**Key Features:**
- Transaction support via optional `tx` parameter
- Password hashing on create/update
- Selective field queries for performance
- Composite username/email lookups

### UsernameHistoryRepository
Implements `IUsernameHistoryDomainRepository` using Prisma ORM.

**Key Features:**
- Ordered history retrieval
- Cooldown date tracking

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["error1", "error2"]
  }
}
```

### Common Exceptions
- **UnauthorizedException**: Missing or invalid authentication
- **NotFoundException**: User or resource not found
- **BadRequestException**: Validation failures, business rule violations
- **InternalServerErrorException**: Unexpected errors with rollback

## Security Features

### Password Management
- Bcrypt hashing for password storage
- 10-minute token expiration for reset
- Token invalidation after use
- Password history check (prevents reuse)
- Secure token generation

### Username Changes
- 60-day cooldown period
- History tracking
- Uniqueness validation

### Profile Images
- File type validation
- Size limit enforcement
- Secure cloud storage (Cloudinary)
- Automatic cleanup of old images
- Rollback on upload failure

## Localization

The module supports multi-language responses via the `SupportedLang` type (currently 'al' and 'en').

**Localized Messages:**
- Validation errors
- Success messages
- Error descriptions
- Email content

## Transaction Support

Several use cases support optional Prisma transactions:
- `updateFields`
- `create`
- `verifyEmail`

This allows atomic operations across multiple repositories.

## Caching Strategy

### Password Reset Tokens
- **Key Pattern:** `password_reset:{token}`
- **TTL:** 10 minutes
- **Data:** `{ userId, email }`
- **Invalidation:** On use or expiration

## Image Management

### Cloudinary Integration
- **Upload:** Organized by user ID in folders
- **Format:** Automatic optimization
- **Deletion:** Public ID tracking for cleanup
- **Rollback:** Failed uploads are cleaned up

### Upload Process
1. Validate file
2. Upload to Cloudinary
3. Update database
4. Delete old image
5. Rollback on any failure

## Best Practices

### Use Case Composition
- Use cases can depend on other use cases (e.g., `GetUserProfileUseCase` used by many)
- Repository access abstracted through interfaces
- Domain rules enforced in entities, not repositories

### Error Messages
- All user-facing messages are localized
- Validation errors include field-specific messages
- Security-sensitive errors don't leak information

### Testing Considerations
- Repository interfaces enable easy mocking
- Use cases are unit-testable
- Domain logic isolated in entities

## Module Exports

The module exports the following for use by other modules:
- `USER_REPO` token
- `GetUserProfileUseCase`
- `UpdateUserFieldsUseCase`
- `FindUnverifiedUsersUseCase`
- `FindUserByIdentifierUseCase`
- `FindUserByIdUseCase`
- `UpdateLastLoginUseCase`
- `FindUserForVerificationUseCase`
- `VerifyUserEmailUseCase`
- `UserRepository`
- `FindUserForAuthUseCase`

## Future Considerations

### Potential Enhancements
- Two-factor authentication
- Email change flow
- Account deletion with data export
- Profile visibility settings
- Activity logs
- Username reservation system
- Social profile links
- Batch user operations
- Advanced search capabilities

### Performance Optimizations
- Implement caching for frequently accessed profiles
- Add database indexes on common query fields
- Consider read replicas for profile queries
- Optimize image transformations

## Dependencies Summary

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/platform-express": "^10.x",
  "@prisma/client": "^5.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "bcrypt": "^5.x"
}
```

## Environment Variables

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASSWORD=

# Redis Cache
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# Database
DATABASE_URL=
```

---

## Quick Start Guide

### Using the Module in Another Module

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule],
  // Now you can inject exported use cases
})
export class MyModule {}
```

### Example: Getting User Profile

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { GetUserProfileUseCase } from './modules/users/application/use-cases/get-user-profile.use-case';

@Injectable()
export class MyService {
  constructor(
    private readonly getUserProfile: GetUserProfileUseCase
  ) {}

  async doSomething(userId: number) {
    const user = await this.getUserProfile.execute(userId, 'en');
    console.log(user.username);
  }
}
```

### Example: Password Reset Flow

```typescript
// 1. User requests reset
POST /password/forgot-password
Body: { "email": "user@example.com" }

// 2. User receives email with token

// 3. User submits new password
POST /password/reset-password
Body: {
  "token": "abc123...",
  "newPassword": "newSecure123",
  "repeatPassword": "newSecure123"
}
```

---

