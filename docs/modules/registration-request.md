### Registration Request Module

---

### Overview

The Registration Request module manages the lifecycle of agent join requests to agencies. When an agent registers, a request is created and put `under_review`. Agency owners see the request, approve or reject it, and the system handles role changes, notifications, and welcome emails accordingly. The module also handles "quick requests" — a shortcut flow where an already-registered user applies to join an agency using only the agency's public code.

---

### Architecture

```
registration-request/
├── application/
│   └── use-cases/
│       ├── check-agent-data.use-case.ts
│       ├── create-agent-request.use-case.ts
│       ├── delete-requests-by-user.use-case.ts
│       ├── find-request-by-id.use-case.ts
│       ├── find-requests-by-user-id.use-case.ts
│       ├── get-request-count.use-case.ts
│       ├── get-request.use-case.ts
│       ├── send-quick-request.use-case.ts
│       ├── set-under-review.use-case.ts
│       └── update-request-status.use-case.ts
├── domain/
│   ├── entities/
│   │   └── registration-request.entity.ts
│   └── repositories/
│       └── registration-request.repository.interface.ts
├── dto/
│   ├── registration-request-response.dto.ts
│   ├── active-request-response.dto.ts
│   └── paginated-registration-request-response.dto.ts
└── registration-request.module.ts
```

---

### Domain Entity

### RegistrationRequestEntity

Represents an agent's request to join an agency.

**Properties:** `id`, `userId`, `agencyId`, `requestedRole`, `requestType`, `status` (enum: `pending | under_review | approved | rejected`), `reviewedBy`, `reviewNotes`, `createdAt`, `updatedAt`

**Factory:** `RegistrationRequestEntity.createNew(data)` — creates a new request with `status: 'pending'` by default (or supplied status for quick requests).

---

### Repository Interface

### IRegistrationRequestRepository

- `create(entity, tx?)` → creates a new request
- `findById(id)` → single request
- `findByUserId(userId)` → all requests for a user
- `findActiveRequestByUserId(userId)` → the most recent non-rejected request for a user
- `findPendingRequestByUserId(userId)` → pending-only check (for duplicate prevention)
- `findByAgencyIdAndStatus(agencyId, status?, skip, take, search?)` → paginated list for agency dashboard
- `countRequests(agencyId, status?, search?)` → count for pagination
- `updateStatus(requestId, status, reviewedBy?, reviewNotes?)` → update status
- `setLatestUnderReview(userId, tx?)` → sets the most recent request to `under_review`
- `deleteByUserId(userId)` → cleanup on user deletion

---

### Use Cases

---

### CreateAgentRequestUseCase

Creates an agent registration request as part of the agent registration transaction.

**Input:** `userId`, `dto: RegisterAgentDto`, `agency: { id, agencyName }`, `lang`, `tx?`

Creates a `RegistrationRequestEntity` with `requestType: 'agent_license_verification'` and persists it inside the caller's transaction.

---

### SendQuickRequestUseCase

Allows a registered user (not yet an agent) to request to join an agency using only the agency's `publicCode`. No license verification needed — simpler fast-track flow.

**Flow:**
1. Check for existing pending request — throws `BadRequestException` if one exists
2. Fetch agency by public code — throws if not found
3. Create request entity with `status: 'under_review'` (skips the `pending` phase)
4. Persist request
5. Notify agency owner: `user_send_request` notification with `{ username }` in metadata

---

### CheckAgentDataUseCase

Pre-validation for agent registration — checks public code validity and ID card uniqueness before committing anything.

**Flow:**
1. `getAgencyByPublicCode.execute(publicCode)` — adds to errors if invalid
2. `ensureIdCardUnique.execute(idCard)` — throws if duplicate

---

### GetAgencyRequestsUseCase

Returns paginated registration requests for an agency.

**Input:** `agencyId`, `page`, `status?`, `search?`

**Page size:** 6 per page. Runs `getRequestCount` and `getRequests` in parallel. Returns `PaginatedRegistrationRequestResponseDto`.

---

### UpdateRequestStatusUseCase

Updates a request's status (approve/reject/reset). Delegates directly to `repo.updateStatus`.

---

### SetUnderReviewUseCase

Sets the most recent request for a user to `under_review`. Called after email verification for agents. Throws if no request found.

---

### DeleteRegistrationRequestsByUserUseCase

Deletes all requests for a user. Called during user cleanup.

---

### FindRequestByUserIdUseCase

Returns the active (non-rejected) request for a user. Returns `null` if none found (no throw — callers handle `null`).

---

### FindRequestByIdUseCase

Returns a single request by ID. Throws `NotFoundException` if not found.

---

### DTOs

**RegistrationRequestResponseDto:** Full request data formatted for the agency dashboard view (includes user info — name, email, profile image, id card number)

**ActiveRequestResponseDto:** Lightweight DTO returned to the agent showing their current request status

**PaginatedRegistrationRequestResponseDto:** `{ page, limit, total, totalPages, requests[] }`

---

### Module Configuration

**Imports:** Exported from `RegistrationRequestModule`; consumed by `AgencyRequestsModule`, `AuthModule`, `EmailVerificationModule`, `RegistrationModule`, `CleanupModule`

**Providers:** All use cases + `RegistrationRequestRepository` (token: `REG_REQ_TOKEN.REG_REQ_REPOSITORY`)

**Exports:** All use cases + repository token

---

### Request Lifecycle

```
Agent registers
  └── CreateAgentRequestUseCase → status: 'pending'
        ↓
Email verified (VerifyEmailUseCase)
  └── SetUnderReviewUseCase → status: 'under_review'
  └── Notify agency owner: agent_email_confirmed
        ↓
Agency owner reviews (AgencyRequestsController)
  ├── Approve → ApproveAgencyRequestUseCase
  │     ├── Create/update AgencyAgent record
  │     ├── Update user role → 'agent', status → 'active'
  │     ├── Set permissions
  │     └── Send welcome email + agency_confirm_agent notification
  └── Reject → RejectAgencyRequestUseCase
        └── Update status → 'rejected'

Quick Request (existing user)
  └── SendQuickRequestUseCase → status: 'under_review' (directly)
  └── Notify agency owner: user_send_request
```