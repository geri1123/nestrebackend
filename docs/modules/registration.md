# Registration Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Registration Module centralizes user and agency registration flows used by the platform:

- Register standard users
- Register agency owners (user + agency created in a single transaction)
- Register agents (user + registration request)
- Validate incoming registration payloads (agent/agency-specific checks)
- Send verification emails and temporarily store verification tokens in cache

Key characteristics:
- Uses Prisma for transactional DB operations
- Uses centralized use-cases for business logic (RegisterUserUseCase, RegisterAgentUseCase, RegisterAgencyOwnerUseCase)
- Localized messages via `t()` and `SupportedLang`
- Email verification token stored in cache (via `CacheService`)
- Clear validation and error mapping in use-cases (BadRequestException for validation failures)
- Module wiring exposes registration use-cases for other modules

Module location example:
- `src/modules/registration/`

Exports:
- RegisterUserUseCase
- RegisterAgencyOwnerUseCase
- RegisterAgentUseCase

---

## Primary Responsibilities & Flows

1. Register standard user (RegisterUserUseCase)
   - Validates uniqueness of username and email via `IUserDomainRepository`.
   - Creates user with default `status: 'inactive'` and assigned `role`.
   - Generates a verification token, stores it in cache (key: `email_verification:<token>`) with TTL (30 minutes).
   - Sends verification email using `EmailService.sendVerificationEmail(email, name, token, lang)`.
   - Returns `{ userId, token }` (token useful for testing or immediate flows).

2. Register agency owner (RegisterAgencyOwnerUseCase)
   - Validates agency data with `ValidateAgencyBeforeRegisterUseCase` (e.g., uniqueness of name/license/address).
   - Runs a Prisma transaction that:
     - Creates the user via `RegisterUserUseCase.execute(..., role='agency_owner', tx)`.
     - Creates the agency via `CreateAgencyUseCase.execute(..., userId, agency_status.inactive, lang, tx)`.
   - Returns `{ userId, agencyId, message }` on success (localized).

3. Register agent (RegisterAgentUseCase)
   - Validates agent registration data (e.g., resolves agency by public code) via `ValidateAgentRegistrationDataUseCase`.
   - Runs a Prisma transaction that:
     - Creates the user via `RegisterUserUseCase.execute(..., role='agent', tx)`.
     - Creates a registration request via `CreateAgentRequestUseCase.execute(userId, dto, agency, lang, tx)`.
   - Returns `{ userId, message }`.

4. Validation (ValidateAgentRegistrationDataUseCase / ValidateAgencyBeforeRegisterUseCase)
   - Resolve agency by public code or verify agency-specific constraints.
   - Ensure agent/agency registration meets business rules before persistence.

---

## DTOs / Contracts

- BaseRegistrationDto
  - username (min 4 chars, no spaces)
  - email (validated)
  - password (min 8 chars, no spaces) + repeatPassword (match)
  - first_name, last_name (trimmed)
  - terms_accepted (must equal true)

- RegisterAgencyOwnerDto (extends BaseRegistrationDto)
  - agency_name
  - license_number
  - address

- RegisterAgentDto (extends BaseRegistrationDto)
  - public_code (agency public code)
  - requested_role (enum: 'agent' | 'senior_agent' | 'team_lead')

- RegisterFailedResponseDto
  - success: boolean
  - message: string
  - errors?: Record<string, string[]>

Notes:
- DTOs include class-validator decorators and Swagger ApiProperty for documentation.
- All validation messages are keys that map to localized strings via `t()`.

---

## Use-case Details & Important Implementation Notes

RegisterUserUseCase
- Dependencies: IUserDomainRepository, EmailService, CacheService
- Steps:
  1. Check username and email existence via `userRepo.usernameExists` and `userRepo.emailExists`.
  2. Collect errors and throw `BadRequestException({ success:false, errors })` if any.
  3. Create user using `userRepo.create({ ...data, role, status: 'inactive' }, tx?)` — supports optional transaction client.
  4. Generate token (via `generateToken()`).
  5. Cache token: `cacheService.set('email_verification:${token}', { userId, role }, TTL)`.
  6. Send verification email via `emailService.sendVerificationEmail(...)`.
  7. Return `{ userId, token }`.

- Important: `userRepo.create` should handle hashing the password and any pre-persistence transformations.

RegisterAgencyOwnerUseCase
- Dependencies: RegisterUserUseCase, CreateAgencyUseCase, ValidateAgencyBeforeRegisterUseCase, PrismaService
- Key points:
  - Runs `validateAgencyUseCase.execute(dto, lang)` before DB actions.
  - Executes a Prisma transaction: creates user first, then agency.
  - Passes Prisma transaction client (`tx`) into `registerUser.execute` and `createAgencyUseCase.execute` so both operations are in the same transaction.
  - Returns localized message upon success.

RegisterAgentUseCase
- Dependencies: PrismaService, ValidateAgentRegistrationDataUseCase, RegisterUserUseCase, CreateAgentRequestUseCase
- Key points:
  - Resolves agency by public code (via validateAgentData).
  - Creates user and registration request in a single transaction.
  - Returns localized success message.

Transaction behaviour
- Transactions use `prisma.$transaction(async (tx) => { ... })` and pass `tx` into repository/use-case methods that accept a transaction client.
- This ensures atomicity: either both user and agency are created or the whole operation rolls back.

Error handling
- Use-cases throw `BadRequestException` for validation errors and `BadRequestException` or other Nest exceptions for operational errors.
- Localized error messages returned to clients via keys mapped by `t()` at the controller layer.

---

## Module Wiring

RegistrationModule (providers & imports):
- Imports:
  - UsersModule (user repository & domain logic)
  - AgencyModule (create agency + validation)
  - RegistrationRequestModule (agent registration requests)
  - EmailModule (EmailService)
  - AppCacheModule (CacheService)
  - AgentModule (agent domain helpers)
- Providers:
  - RegisterUserUseCase
  - RegisterAgencyOwnerUseCase
  - RegisterAgentUseCase
  - ValidateAgentRegistrationDataUseCase
- Exports:
  - RegisterUserUseCase
  - RegisterAgencyOwnerUseCase
  - RegisterAgentUseCase

Notes:
- `RegisterUserUseCase` is reused by higher-level flows (agent/agency owner registration) and accepts an optional Prisma transaction client for atomic multi-step operations.
- Keep `CreateAgencyUseCase` and `CreateAgentRequestUseCase` transaction-aware as they are invoked inside transactions.

---

## Controller Expectations

Typical controller responsibilities (not included here but expected when wiring endpoints):
- Accept DTOs from request body.
- Call appropriate use-case with `req.language` and other contextual data.
- Map exceptions to appropriate HTTP responses (Nest does this automatically for thrown HttpExceptions).
- Return localized success messages and created resource IDs.

Example success response for agency owner registration:
```json
{
  "userId": 42,
  "agencyId": 7,
  "message": "Registration successful" // localized via t('registrationSuccess', lang)
}
```

Example validation error:
```json
{
  "success": false,
  "errors": {
    "username": ["usernameExists"],
    "email": ["emailExists"]
  }
}
```

---

## Security & Privacy Considerations

- Passwords:
  - Responsibility of user repository to hash passwords before persistence (do not hash in controller/use-case).
- Email verification tokens:
  - Stored in cache with TTL (30 minutes). Consider persisting for audit or supporting resend with a new token.
- PII:
  - First/last names, emails, addresses are PII — ensure secure storage and access controls.
- Rate limiting:
  - Apply rate limits to registration endpoints to prevent abuse (bots, mass registrations).

---

## Observability & Metrics

Track:
- Registration attempts / success / failure rates
- Verification email send rates & failures
- Cache set operations for tokens
- Transaction rollbacks (counts & reasons)
- Latency of `userRepo.create` and `createAgencyUseCase`

Logging:
- Log validation warnings and reasons (avoid logging raw passwords)
- Use structured logging (correlationId) for cross-service tracing

---

## Tests

Unit tests:
- RegisterUserUseCase
  - Username exists -> throws BadRequestException with proper errors
  - Email exists -> throws BadRequestException
  - Successful create -> calls userRepo.create, cacheService.set, emailService.sendVerificationEmail
- RegisterAgencyOwnerUseCase
  - Validation fails (validateAgencyUseCase throws) -> bubble up
  - Successful flow -> transaction invoked and both user & agency created
- RegisterAgentUseCase
  - Invalid public_code -> validateAgentRegistrationDataUseCase throws
  - Successful -> registration request created

Integration tests:
- Transaction rollback behaviour: simulate DB failure in createAgencyUseCase to ensure user creation is rolled back
- Email delivery failure handling (mock EmailService to fail & assert appropriate exception handling or retry logic)

---

