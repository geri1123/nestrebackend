### Registration Module

---

### Overview

The Registration module handles all user account creation flows: standard users, agency owners, and agents. Each flow is a multi-step transactional process that creates the user record, performs role-specific setup (agency creation, registration request), and sends a verification email. Email sending is deliberately deferred until after the database transaction commits to avoid sending emails for rolled-back registrations.

Registration endpoints are exposed through `AuthController` under `/auth/register/*`.

---

### Architecture

```
registration/
├── application/
│   └── use-cases/
│       ├── register-user.use-case.ts
│       ├── register-agency-owner.use-case.ts
│       ├── register-agent.use-case.ts
│       └── validate-agent-registration-data.use-case.ts
├── dto/
│   ├── base-registration.dto.ts
│   ├── register-agency-owner.dto.ts
│   └── register-agent.dto.ts
└── registration.module.ts
```

---

### Use Cases

---

### RegisterUserUseCase

Core user creation logic. Used by all three registration flows (user, agency owner, agent) as a shared building block.

**Input:** `RegisterUserData` (`username`, `email`, `password`, `firstName`, `lastName`), `lang`, `role`, `tx?`, `skipEmailSending`

**Flow:**
1. Normalize username (lowercase, strip whitespace)
2. Check username uniqueness — adds to errors if taken
3. Check email uniqueness — adds to errors if taken
4. Throw `BadRequestException` with field-level errors if any
5. Hash password with `hashPassword()`
6. `userRepo.create(...)` with `status: 'pending'`
7. Generate verification token
8. If `skipEmailSending = false` → immediately calls `sendVerificationEmail`
9. Returns `{ userId, token, email, firstName, role }`

**`sendVerificationEmail(userId, token, email, firstName, role, lang)`:**
- Stores `{ userId, role }` in Redis under `email_verification:{token}` with 30-minute TTL
- Sends via `EmailQueueService.sendVerificationEmail(email, firstName, token, lang)`

**Note:** The `skipEmailSending` flag exists so the wrapping use cases can defer email until after their Prisma transaction commits — preventing verification emails from going out for failed registrations.

---

### RegisterAgencyOwnerUseCase

Registers a new agency owner: user + agency in one atomic transaction.

**Flow:**
1. `validateAgencyUseCase.execute(...)` — pre-validates agency name and license uniqueness (outside transaction to get fast feedback)
2. Prisma `$transaction`:
   - `registerUser.execute(..., 'agency_owner', tx, skipEmailSending: true)` → gets `{ userId, token, ... }`
   - `createAgencyUseCase.execute(..., ownerUserId, AgencyStatus.inactive, lang, tx)` → agency created with `inactive` status (activated after email verification)
3. After transaction commits: `registerUser.sendVerificationEmail(...)` — safe to send now

**Returns:** `{ userId, agencyId, message }`

---

### RegisterAgentUseCase

Registers a new agent: user + registration request in one atomic transaction.

**Flow:**
1. `validateAgentData.execute(dto)` — validates public code + ID card uniqueness (outside transaction)
2. Prisma `$transaction`:
   - `registerUserUseCase.execute(..., 'agent', tx, skipEmailSending: true)`
   - `createRequestUseCase.execute(userId, dto, agency, lang, tx)` — creates `RegistrationRequest` with `status: 'pending'`
3. After transaction commits: `registerUserUseCase.sendVerificationEmail(...)`

**Returns:** `{ userId, message }`

---

### ValidateAgentRegistrationDataUseCase

Pre-flight validation for agent registration.

**Checks:**
1. `getAgencyByPublicCode.execute(publicCode)` — verifies the agency exists and returns it
2. (Previously also `ensureIdCardUnique` — currently commented out; ID card logic may be pending)

**Returns:** The resolved `Agency` object for use in subsequent steps.

---

### DTOs

### BaseRegistrationDto

Common fields for all registration types:
- `username` (string, required)
- `email` (email string, required)
- `password` (string, required — min length, complexity enforced by class-validator)
- `firstName` (string, optional)
- `lastName` (string, optional)

### RegisterAgencyOwnerDto (extends BaseRegistrationDto)

Additional fields:
- `agencyName` (string, required)
- `licenseNumber` (string, required)
- `address` (string, required)

### RegisterAgentDto (extends BaseRegistrationDto)

Additional fields:
- `publicCode` (string, required — agency's public join code)
- `requestedRole` (`AgencyAgentRoleInAgency` enum, required)

---

### Registration Flows Summary

```
POST /auth/register/user
  └── RegisterUserUseCase (role: 'user')
       └── User created (pending) → Verification email sent

POST /auth/register/agency_owner
  └── RegisterAgencyOwnerUseCase
       ├── Validate agency name + license (pre-tx)
       ├── [Transaction]
       │   ├── RegisterUserUseCase (role: 'agency_owner', skipEmail)
       │   └── CreateAgencyUseCase (status: inactive)
       └── sendVerificationEmail (post-tx)

POST /auth/register/agent
  └── RegisterAgentUseCase
       ├── ValidateAgentRegistrationDataUseCase (pre-tx)
       ├── [Transaction]
       │   ├── RegisterUserUseCase (role: 'agent', skipEmail)
       │   └── CreateAgentRequestUseCase
       └── sendVerificationEmail (post-tx)
```

---

### Post-Registration States

| Role | User Status | Agency Status | Next Step |
|---|---|---|---|
| `user` | `pending` | — | Click verification link → `active` |
| `agency_owner` | `pending` | `inactive` | Click verification link → agency `active`, user `active` |
| `agent` | `pending` | — | Click link → `pending`, await agency approval |

---

### Module Configuration

**Exports:** `RegisterUserUseCase`, `RegisterAgencyOwnerUseCase`, `RegisterAgentUseCase` — all consumed by `AuthController` via `AuthModule`

**Imports:** `UsersModule`, `AgencyModule`, `AgentModule`, `RegistrationRequestModule`