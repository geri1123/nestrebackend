### Email Verification Module

---

### Overview

The Email Verification module handles the complete email confirmation flow for newly registered users. It supports three user roles with different post-verification behaviors: standard users are activated immediately, agency owners have their agency activated, and agents are set to `pending` status awaiting agency approval. A resend endpoint allows users with expired or lost verification links to request a new one.

All endpoints are `@Public()`.

---

### Architecture

```
email-verification/
├── application/
│   └── use-cases/
│       ├── verify-email.use-case.ts
│       └── resend-verification-email.use-case.ts
├── controllers/
│   └── email-verification.controller.ts
├── dto/
│   ├── verify-email.dto.ts
│   └── resend-verification.dto.ts
├── responses/
│   └── email-verification.response.ts
└── email-verification.module.ts
```

---

### How Verification Tokens Work

1. On registration, `RegisterUserUseCase` generates a `generateToken()` (random hex string) and stores it in Redis under the key `email_verification:{token}` with a 30-minute TTL. The value is `{ userId, role }`.
2. The token is embedded in a verification link sent to the user's email via the `EmailQueueService`.
3. The user clicks the link → `GET /auth/verify-email?token=...`
4. The use case reads the token from Redis, processes role-specific logic, then deletes the active key and writes a `email_verification_used:{token}` key (24h TTL) to handle graceful double-click.

---

### Use Cases

---

### VerifyEmailUseCase

Processes a verification token and activates the user account.

**Dependencies:** `PrismaService`, `CacheService`, `FindUserByIdUseCase`, `FindRequestByUserIdUseCase`, `VerifyUserEmailUseCase`, `ActivateAgencyByOwnerUseCase`, `GetAgencyWithOwnerByIdUseCase`, `SetUnderReviewUseCase`, `NotificationService`, `EmailQueueService`

**Flow:**

1. Validate token presence
2. Read `email_verification:{token}` from Redis
3. **If key missing:** check `email_verification_used:{token}` — if found and user is already verified, return `{ alreadyVerified: true }`. Otherwise throw `400 BadRequestException` (expired/invalid token)
4. Fetch user — if already verified, clean up Redis keys and return `{ alreadyVerified: true }`
5. Run inside a **Prisma transaction:**
   - `agency_owner`: `activateAgencyByOwner.execute(userId, lang, tx)` — sets agency status to `active`
   - All roles: `verifyEmail.execute(userId, newStatus, tx)` where `newStatus` is `'active'` for users/owners and `'pending'` for agents
   - `agent`: `setUnderReview.execute(userId, lang, tx)` — marks registration request as `under_review`
6. Delete Redis active key, write used key (24h)
7. Send email via `EmailQueueService`:
   - `agent` → `sendPendingApprovalEmail` (notifies them they're under review)
   - others → `sendWelcomeEmail`
8. `agent` only (post-commit): notify agency owner via `NotificationService` with type `agent_email_confirmed`

**Returns:** `{ alreadyVerified: boolean }`

---

### Role-Specific Post-Verification Behavior

| Role | User Status | Agency | Registration Request | Email Sent |
|---|---|---|---|---|
| `user` | `active` | — | — | Welcome email |
| `agency_owner` | `active` | Activated (`active`) | — | Welcome email |
| `agent` | `pending` | — | Set to `under_review` | Pending approval email |

---

### ResendVerificationEmailUseCase

Generates a new verification token and re-sends the email.

**Dependencies:** `FindUserForVerificationUseCase`, `CacheService`, `EventEmitter2`

**Flow:**
1. Find user by `identifier` (username or email) via `FindUserForVerificationUseCase`
2. Throw `BadRequestException` if email is already verified
3. Throw `BadRequestException` if user status is not `pending` or `inactive` (only valid statuses for resend)
4. Generate new token, store in Redis with 30-minute TTL
5. Emit `EMAIL_EVENTS.VERIFICATION_REQUESTED` event with the new token

**Note:** Each resend generates a fresh token; old tokens become stale in Redis when they expire naturally.

---

### API Endpoints

---

### GET /auth/verify-email?token=...

Verifies the user's email address using the token from the verification email.

**Authentication:** Not required (`@Public()`)

**Query Parameters:**
- `token` (string, required): Verification token from email link

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "alreadyVerified": false
}
```

If the email was already verified:
```json
{
  "success": true,
  "message": "Email already verified",
  "alreadyVerified": true
}
```

**Errors:**
- `400 Bad Request`: Token missing, expired, or invalid

---

### POST /auth/resend-verification

Re-sends a verification email.

**Authentication:** Not required (`@Public()`)

**Request Body:**
```json
{ "identifier": "user@example.com" }
```

`identifier` can be username or email.

**Response:**
```json
{ "success": true, "message": "Verification email resent" }
```

**Errors:**
- `400 Bad Request`: Email already verified, or user status doesn't allow resend

---

### Module Configuration

**Imports:** `UsersModule`, `AgencyModule`, `RegistrationRequestModule`, `NotificationModule`

**Providers:** `VerifyEmailUseCase`, `ResendVerificationEmailUseCase`

**Controller:** `EmailVerificationController` (mounted at `/auth`)

---

### Security Considerations

1. Tokens are random and stored only in Redis (not in the database) — no enumeration risk
2. 30-minute TTL prevents stale link abuse
3. Used-token detection prevents double-activation bugs from users clicking the link twice
4. Only `pending`/`inactive` users can request a resend — prevents abuse for active accounts