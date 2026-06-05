#  Real Estate API

A production-ready **Real Estate Management API** built with **NestJS + TypeScript**, following Clean Architecture principles. Supports agencies, agents, property listings, wallet payments, real-time notifications, and multi-language responses.

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Modules Overview](#-modules-overview)
- [Architecture](#-architecture)
- [Authorization & Security](#-authorization--security)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Localization](#-localization)
- [Queue System](#-queue-system)
- [WebSocket & Notifications](#-websocket--notifications)
- [Wallet & Payments](#-wallet--payments)
- [Advertisement System](#-advertisement-system)
- [Caching (Redis)](#-caching-redis)
- [Testing](#-testing)

---

##  Features

- **User & Role Management** — Users, Agency Owners, Agents with fine-grained permissions
- **Agency Management** — Create/activate agencies, assign agents, paginated listings
- **Property Listings** — Full CRUD, image upload via Cloudinary, advanced search & filters
- **Advertisement System** — Paid promotions (`cheap`, `normal`, `premium`) with auto-expiry via cron jobs
- **Wallet System** — Top-up via Paysera/Whop, atomic balance transactions, purchase deductions
- **Real-time Notifications** — WebSocket gateway with localized messages stored in DB
- **Email System** — Transactional emails via Brevo (SMTP), queued with BullMQ
- **Redis Caching** — Filter data, password reset tokens, user session invalidation
- **Internationalization** — Albanian (default), English, Italian
- **Swagger API Docs** — Auto-generated, available at `/api/docs`
- **Rate Limiting** — Per-user or per-IP throttling with localized errors
- **Google OAuth 2.0** — Social login support

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma |
| Primary Database | PostgreSQL / MySQL |
| Secondary Database | MongoDB (product click tracking) |
| Cache / Queue | Redis + BullMQ |
| File Storage | Cloudinary |
| Email Provider | Brevo (SMTP) |
| Authentication | JWT (Access + Refresh tokens) + Google OAuth 2.0 |
| Payments | Paysera, Whop |
| Real-time | WebSocket (Socket.IO) |
| Validation | class-validator + class-transformer |
| Documentation | Swagger / OpenAPI |
| Testing | Jest |

---

##  Project Structure

```
src/
├── app.module.ts              # Root module — wires everything together
├── main.ts                    # Bootstrap: Swagger, CORS, pipes, filters
│
├── common/                    # Shared utilities, guards, decorators, pipes
│   ├── decorators/            # @Public, @Roles, @Permissions, @RequireAgencyContext
│   ├── filters/               # Global exception filter (AllExceptionsFilter)
│   ├── guard/                 # CustomThrottlerGuard
│   ├── helpers/               # Validation helpers, permissions helper
│   ├── pipes/                 # Multipart validation pipe
│   ├── soft-auth/             # Optional JWT auth for public routes
│   └── utils/                 # Date, hashing, username generator, image utils
│
├── infrastructure/            # Cross-cutting technical concerns
│   ├── auth/                  # JWT guards, agency/agent context services
│   ├── cloudinary/            # Image upload service
│   ├── config/                # AppConfigService (env variable access)
│   ├── database/              # MongoDB connection module
│   ├── email/                 # Email service + Brevo templates
│   ├── paysera/               # Paysera payment gateway
│   ├── prisma/                # Prisma ORM module + service
│   ├── queue/                 # BullMQ producers, processors, listeners
│   ├── redis/                 # Redis cache, pub/sub, cache invalidation
│   ├── websocket/             # Socket.IO gateway, auth, rate limiting
│   └── whop/                  # Whop payment integration
│
├── locales/                   # i18n translation files (al, en, it)
├── middlewares/               # LanguageMiddleware (sets req language from header)
│
└── modules/                   # Business domain modules (Clean Architecture)
    ├── auth/                  # Login, refresh token, Google OAuth
    ├── users/                 # Profile, password reset, avatar upload
    ├── registration/          # User, agency owner, agent registration flows
    ├── email-verification/    # Email verification + resend
    ├── agency/                # Agency CRUD, logo upload, activation
    ├── agent/                 # Agent management, permissions
    ├── agency-requests/       # Agency join requests (approve/reject)
    ├── registration-request/  # Agent registration request lifecycle
    ├── product/               # Property listings, search, filters
    ├── product-image/         # Product image upload/delete
    ├── product-attribute/     # Custom attribute values per product
    ├── product-clicks/        # Click tracking (MongoDB)
    ├── saved-product/         # Bookmark/save products
    ├── advertise-product/     # Paid product promotions
    ├── advertisement-pricing/ # Pricing plans for advertisements
    ├── wallet/                # Wallet balance, top-up, transactions
    ├── notification/          # In-app notifications (WS + DB)
    ├── filters/               # Search filter data (categories, cities, etc.)
    ├── review/                # Agency reviews & ratings
    ├── contact/               # Contact forms (user/agency/platform)
    ├── dashboard/             # User stats dashboard
    └── cleanup/               # Cron-based cleanup of unverified users
```

Each domain module follows **Clean Architecture**:

```
module/
├── application/
│   └── use-cases/       # Business logic, one class per operation
├── domain/
│   ├── entities/        # Domain entities
│   ├── repositories/    # Repository interfaces (ports)
│   └── types/           # Domain-specific types & value objects
├── infrastructure/
│   └── persistence/     # Prisma repository implementations
├── controllers/         # HTTP layer
├── dto/                 # Request/response DTOs
└── *.module.ts          # NestJS module wiring
```

---

##  Modules Overview

| Module | Description |
|---|---|
| `AuthModule` | JWT login, refresh tokens, Google OAuth |
| `UsersModule` | Profile management, password reset, avatar |
| `RegistrationModule` | Register users, agency owners, agents |
| `EmailVerificationModule` | Email verification tokens via Redis |
| `AgencyModule` | Full agency lifecycle management |
| `AgentModule` | Agent CRUD, roles, permissions |
| `AgencyRequestsModule` | Approve/reject agency membership requests |
| `ProductModule` | Property listing CRUD + advanced search |
| `ProductImageModule` | Cloudinary-backed image management |
| `ProductClicksModule` | MongoDB click-tracking analytics |
| `SavedProductModule` | Save/unsave product bookmarks |
| `AdvertiseProductModule` | Paid promotions with wallet deductions |
| `AdvertisementPricingModule` | Admin-managed pricing tiers |
| `WalletModule` | Balance, top-up (Paysera/Whop), history |
| `NotificationModule` | Real-time + persistent user notifications |
| `FiltersModule` | Redis-cached filter data for search UI |
| `ReviewModule` | Agency reviews with duplicate/ownership checks |
| `ContactModule` | Contact forms with email delivery |
| `DashboardModule` | Aggregate user stats |
| `CleanupModule` | Cron job: remove unverified accounts |

---

## 🏗 Architecture

### Request Lifecycle

```
HTTP Request
    │
    ▼
LanguageMiddleware       ← sets req.language from Accept-Language header
    │
    ▼
CustomThrottlerGuard     ← rate limit (by userId or IP)
    │
    ▼
JwtAuthGuard             ← verifies JWT, attaches user + agency/agent context
    │
    ▼
RolesGuard               ← checks @Roles() decorator
    │
    ▼
PermissionsGuard         ← checks @Permissions() for agents
    │
    ▼
Ownership Guards         ← ProductOwnership, AgentBelongsToAgency
    │
    ▼
Controller → Use Case → Repository → Prisma/MongoDB
    │
    ▼
AllExceptionsFilter      ← formats all errors uniformly with localized messages
```

### Clean Architecture Layers

```
Controller (HTTP)
    └── Use Case (business logic)
            └── Repository Interface (domain port)
                    └── Repository Implementation (Prisma/Mongo)
```

---

##  Authorization & Security

### Guards (applied globally in order)

| Guard | Purpose |
|---|---|
| `CustomThrottlerGuard` | Rate limiting — 100 req/min per user or IP |
| `JwtAuthGuard` | JWT verification, attaches full user/agency/agent context |
| `RolesGuard` | Role-based access via `@Roles('agency_owner')` |
| `PermissionsGuard` | Fine-grained agent permissions via `@Permissions('canEditOthersPost')` |
| `ProductOwnershipAndPermissionGuard` | Ensures only owner/authorized agent can modify a product |
| `AgentBelongsToAgencyGuard` | Ensures agency owners only manage their own agents |

### Decorators

```typescript
@Public()                        // Skip all auth checks
@Roles('agency_owner')          // Require specific role
@Permissions('canCreateProduct') // Require agent permission
@RequireAgencyContext()          // Require active agency context
```

### Soft Authentication

For public endpoints that optionally enrich responses for logged-in users:

```typescript
// Route is @Public() — no login required
// SoftAuthService.attachUserIfExists() runs:
// - Valid token → req.userId is set (for analytics, personalization)
// - No/invalid token → request continues as guest
// Never throws — guests always get full access to public content
```

### JWT Token Strategy

- **Access Token** — short-lived, stored in HTTP-only cookie
- **Refresh Token** — longer-lived, used to rotate access tokens
- Both secrets must be `≥ 32 characters` and must differ from each other
- Password reset tokens stored in Redis with TTL (not in the database)

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=8080
NODE_ENV=development

# Database (Prisma)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=real_estate

# MongoDB (product click tracking)
MONGO_URI=mongodb://localhost:27017/real_estate

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars_different

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# CORS
CORS_ORIGINS=http://localhost:3000
CLIENT_BASE_URL=http://localhost:3000

# Email (Brevo)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_brevo_login
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
BREVO_API_KEY=your_brevo_api_key

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRATION=10  # minutes

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paysera
PAYSERA_PROJECT_ID=your_project_id
PAYSERA_SIGN_PASSWORD=your_sign_password
PAYSERA_CALLBACK_URL=https://yourdomain.com/wallet/webhooks/paysera
PAYSERA_SUCCESS_URL=https://yourdomain.com/wallet?topup=success
PAYSERA_CANCEL_URL=https://yourdomain.com/wallet?topup=cancelled


```

> **Generate secure JWT secrets:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL (or MySQL)
- MongoDB
- Redis

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd real-estate-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Running the App

```bash
# Development (watch mode)
npm run start:dev

# Development (single run)
npm run start

# Production build
npm run build
npm run start:prod
```

The server starts on the configured `PORT` (default: `8080`).

---

##  API Documentation

Swagger UI is available at:

```
http://localhost:8080/api/docs
```

All endpoints are documented with request/response schemas, authentication requirements, and localized error responses.

---

##  Localization

The API supports three languages, selected via the `Accept-Language` HTTP header:

| Code | Language |
|---|---|
| `al` | Albanian (default) |
| `en` | English |
| `it` | Italian |

All validation errors, exception messages, and notification texts are automatically translated. The `LanguageMiddleware` reads the header on every request and stores the language in `AsyncLocalStorage` so it's available throughout the request lifecycle without manual passing.

---

## Queue System (BullMQ + Redis)

Asynchronous jobs are processed via BullMQ queues:

| Queue | Processor | Description |
|---|---|---|
| `email` | `EmailProcessor` | Sends transactional emails (welcome, verification, password reset, etc.) |
| `product-counts` | `ProductCountsProcessor` | Updates cached product counts per filter |
| `cleanup` | `CleanupProcessor` | Deletes unverified user accounts after TTL |

Email jobs are published via `EmailQueueService` and triggered by domain events using NestJS `EventEmitter`.

---

##  WebSocket & Notifications

Real-time notifications are delivered via Socket.IO and persisted to the database for retrieval later.

### Gateway features:
- JWT authentication on connection (`SocketAuthService`)
- Per-connection rate limiting (`SocketRateLimitService`)
- Connection tracking by userId (`SocketConnectionService`)
- Redis pub/sub for multi-instance delivery

### Notification triggers:
- Registration approved/rejected
- New agent added to agency
- Advertisement purchased
- Wallet top-up confirmed

---

##  Wallet & Payments

Each user has exactly one wallet:

```
Wallet
 └── balance: Decimal
 └── WalletTransaction[]
       ├── type: topup | withdraw | purchase
       ├── amount
       └── reference (e.g. advertisement id)
```

All balance changes use **Prisma transactions** to guarantee atomicity. Supported payment providers:

- **Paysera** — redirect-based payment with webhook callback
- **Whop** — hosted checkout with webhook verification

---

##  Advertisement System

Users can promote their property listings:

| Tier | Description |
|---|---|
| `cheap` | Basic promotion |
| `normal` | Standard promotion |
| `premium` | Premium placement |

**Workflow:**
1. User selects ad tier → price fetched from `AdvertisementPricing`
2. Balance deducted atomically from wallet
3. `ProductAdvertisement` record created
4. `WalletTransaction` linked
5. Cron job (`*/10 * * * *`) activates pending ads and expires ended ones

---

## 🗄 Caching (Redis)

Redis is used for:

| Purpose | Key Pattern | TTL |
|---|---|---|
| Filter data (categories, cities) | `filters:*` | Configurable |
| Password reset tokens | `password_reset:<token>` | `PASSWORD_RESET_TOKEN_EXPIRATION` minutes |
| Email verification tokens | `email_verify:<token>` | Configurable |
| User cache invalidation | Pub/Sub channel | On profile change |

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with watch
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

Tests are co-located with their modules under `_tests_/` directories. Guards, use cases, and services all have dedicated spec files.

---

## 📄 License

This project is proprietary. All rights reserved.
