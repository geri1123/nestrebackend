# Email Verification Module

## Purpose

This module manages **email verification and verification token workflows** for all user roles.

It ensures:

- newly-registered users verify their email address
- verification tokens are secure and time-limited
- verified users receive the correct account status
- related business logic runs safely inside a DB transaction

The module supports:

- verifying an email via `token`
- resending a verification email
- agent-specific onboarding workflows

---

## Endpoints

### `GET /auth/verify-email?token=...`

Verifies a user email using a verification token.

Flow:
1. Validate token input
2. Look up the token in cache
3. Load user & run workflow inside a DB transaction
4. Update user email verification status
5. Apply role-specific logic
6. Delete the token
7. Send confirmation email

Responses:
- `200 OK — Email verified successfully`
- `400 Bad Request — token invalid/expired`
- `400 Bad Request — user or role invalid`

---

### `POST /auth/resend-verification`

Resends a verification email to an unverified account.

Input:
{ "identifier": "email OR username" }

Rules:
- User must exist
- User must NOT already be verified
- Status must be `pending` or `inactive`

A new token is issued and stored in cache for **30 minutes**.

---

## Verification Token Handling

Tokens are stored in cache under:
email_verification:<token>

Stored data includes:

- userId
- user role

TTL: **30 minutes**

Tokens are deleted after use.

---

## Role-Specific Behavior

### Normal users
Status after verification:

active

They immediately gain access.

### Agents
Status after verification:
pending


Automated actions:
- agent registration request is moved **Under Review**
- agency owner receives a notification
- user receives **pending approval email**

### Agency Owners
Upon verifying email:

- their agency is automatically activated

Status becomes:
active



## Internal Use Cases

| Use Case | Responsibility |
|---------|----------------|
| `VerifyEmailUseCase` | Full email verification workflow |
| `ResendVerificationEmailUseCase` | Issues new verification token + sends email |

---

## Side Effects (Important)

This module may:

✔ change user status  
✔ activate agencies  
✔ trigger notifications  
✔ send email  
✔ create audit-style messaging for owners  

All DB changes run inside a **Prisma transaction**, so failures roll back safely.

---

## Security Considerations

- Tokens are random + short-lived
- Tokens are verified server-side
- Verified users cannot request new verification tokens
- Only allowed statuses may request resend
- Token reuse is blocked

---

## Module Location

src/modules/email-verification


Exports for reuse:
- `VerifyEmailUseCase`
- `ResendVerificationEmailUseCase`

---

## Why This Exists

This solves:

- account fraud prevention
- onboarding gating by role
- smooth UX for resending verification emails
- transactional safety for multi-step onboarding flows
- centralizing all email verification logic