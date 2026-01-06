### Registration Request Module Documentation

---

### Overview

The Registration Request module manages the lifecycle of agent registration requests within the system. It handles the creation, review, approval/rejection, and tracking of requests from users who want to become agents affiliated with agencies.

---

### Architecture

This module follows Domain-Driven Design (DDD) principles with clear separation between domain logic, application use cases, and infrastructure:

```
registration-request/
├── application/
│   └── use-cases/          # Business use cases
├── domain/
│   ├── entities/           # Domain entities
│   ├── repositories/       # Repository interfaces
│   ├── types/              # Type definitions
│   └── value-objects/      # Value objects
├── infrastructure/
│   └── persistence/        # Data persistence layer
└── registration-request.controller.ts
```

---

### Domain Model

---

### Entities

---

### RegistrationRequestEntity

Represents a registration request from a user to become an agent.

**Properties:**
- `id`: Unique identifier (nullable for new entities)
- `userId`: ID of the requesting user
- `agencyId`: ID of the target agency (nullable)
- `requestType`: Type of request (e.g., "agent_license_verification")
- `status`: Current status of the request
- `requestedRole`: Role being requested (e.g., "agent")
- `createdAt`: Timestamp of creation
- `reviewedBy`: ID of the reviewing user (nullable)
- `reviewedNotes`: Review notes (nullable)
- `reviewedAt`: Timestamp of review (nullable)
- `user`: User information as RequestUserVO (nullable)

**Methods:**
- `setStatus(status)`: Updates the request status
- `isReviewable()`: Returns true if the request can be reviewed (not approved/rejected)
- `static createNew(data)`: Factory method to create a new registration request

---

### Value Objects

---

### RequestUserVO

Contains basic user information associated with a registration request.

**Properties:**
- `email`: User's email address
- `firstName`: User's first name (nullable)
- `lastName`: User's last name (nullable)
- `role`: User's current role
- `status`: User's account status

---

### Types

---

### Registration Request Status
- `pending`: Initial state, awaiting review
- `under_review`: Currently being reviewed
- `approved`: Request has been approved
- `rejected`: Request has been rejected

---

### Request Type
- `agent_license_verification`: Standard agent verification request

---

### Requested Role
- `agent`: User requesting agent role

---

### Repository Interface

---

### IRegistrationRequestRepository

Defines the contract for data persistence operations.

**Methods:**

- `create(request, tx?)`: Creates a new registration request
  - Parameters: `RegistrationRequestEntity`, optional transaction client
  - Returns: `Promise<number>` (ID of created request)

- `findByUserId(userId)`: Retrieves all requests for a specific user
  - Returns: `Promise<RegistrationRequestEntity[]>`

- `findById(id)`: Retrieves a single request by ID
  - Returns: `Promise<RegistrationRequestEntity | null>`

- `findByAgencyIdAndStatus(agencyId, status?, skip?, take?)`: Retrieves paginated requests for an agency
  - Parameters: agency ID, optional status filter, pagination params
  - Returns: `Promise<RegistrationRequestEntity[]>`

- `setLatestUnderReview(userId, tx?)`: Sets the latest request for a user to "under_review" status
  - Returns: `Promise<boolean>` (true if successful)

- `updateStatus(id, status, reviewedBy?, reviewNotes?, tx?)`: Updates the status of a request
  - Returns: `Promise<RegistrationRequestEntity>`

- `countRequests(agencyId, status?)`: Counts requests for an agency, optionally filtered by status
  - Returns: `Promise<number>`

- `deleteByUserId(userId)`: Deletes all requests for a user
  - Returns: `Promise<number>` (count of deleted records)

---

### Use Cases

---

### CheckAgentDataUseCase

Validates agent registration data before submission.

**Purpose:** Ensures the provided public code and ID card are valid and unique.

**Dependencies:**
- `IRegistrationRequestRepository`
- `GetAgencyByPublicCodeUseCase`
- `EnsureIdCardUniqueUseCase`

**Method:**
```typescript
execute(publicCode: string, idCard: string, lang: SupportedLang): Promise<Record<string, string[]>>
```

---

### CreateAgentRequestUseCase

Creates a new agent registration request.

**Purpose:** Instantiates and persists a new registration request entity.

**Dependencies:**
- `IRegistrationRequestRepository`

**Method:**
```typescript
execute(userId: number, dto: RegisterAgentDto, agency: { id: number; agencyName: string }, lang: SupportedLang, tx?: Prisma.TransactionClient): Promise<void>
```

---

### DeleteRegistrationRequestsByUserUseCase

Deletes all registration requests for a specific user.

**Purpose:** Clean up requests when a user account is deleted or needs reset.

**Method:**
```typescript
execute(userId: number): Promise<void>
```

---

### FindRequestByIdUseCase

Retrieves a single registration request by its ID.

**Purpose:** Get detailed information about a specific request.

**Method:**
```typescript
execute(id: number, lang: SupportedLang): Promise<RegistrationRequestEntity>
```

**Throws:** `NotFoundException` if request not found.

---

### FindRequestsByUserIdUseCase

Retrieves all registration requests for a specific user.

**Purpose:** Display a user's registration history.

**Method:**
```typescript
execute(userId: number, lang: SupportedLang): Promise<RegistrationRequestEntity[]>
```

**Throws:** `NotFoundException` if no requests found.

---

### GetRequestCountUseCase

Counts registration requests for an agency.

**Purpose:** Provide statistics and pagination support.

**Method:**
```typescript
execute(agencyId: number, status?: registrationrequest_status): Promise<number>
```

---

### GetRequestsUseCase

Retrieves paginated registration requests for an agency.

**Purpose:** List and manage requests in agency dashboard.

**Method:**
```typescript
execute(agencyId: number, page: number, take: number, status?: registrationrequest_status): Promise<RegistrationRequestEntity[]>
```

---

### SendQuickRequestUseCase

Sends a quick registration request and notifies the agency owner.

**Purpose:** Allow users to quickly request agent status without full form submission.

**Dependencies:**
- `IRegistrationRequestRepository`
- `GetAgencyWithOwnerByIdUseCase`
- `NotificationService`
- `NotificationTemplateService`

**Method:**
```typescript
execute(userId: number, agencyId: number, username: string, lang: SupportedLang): Promise<void>
```

**Behavior:**
- Creates request with "under_review" status
- Sends notification to agency owner
- Throws `BadRequestException` if agency not found

---

### SetUnderReviewUseCase

Sets the latest request for a user to "under_review" status.

**Purpose:** Move pending request to review stage.

**Method:**
```typescript
execute(userId: number, lang: SupportedLang, tx?: Prisma.TransactionClient): Promise<void>
```

**Throws:** `BadRequestException` if update fails.

---

### UpdateRequestStatusUseCase

Updates the status of a registration request with review information.

**Purpose:** Handle approval/rejection of requests.

**Input:**
```typescript
interface UpdateRequestStatusInput {
  requestId: number;
  status: registrationrequest_status;
  reviewedBy?: number;
  reviewNotes?: string;
}
```

**Method:**
```typescript
execute(input: UpdateRequestStatusInput): Promise<RegistrationRequestEntity>
```

---

### Infrastructure

---

### RegistrationRequestRepository

Implements `IRegistrationRequestRepository` using Prisma ORM.

**Key Features:**
- Transaction support via optional `tx` parameter
- Automatic entity mapping from database records
- Includes user data via join when retrieving by ID
- Pagination support for agency requests
- Optimized queries with proper indexing

**Data Mapping:**
The `mapToEntity` method transforms Prisma query results into domain entities, including nested user data.

---

### API Endpoints

---

### POST /registration-request/quick-request/:agencyId

Sends a quick registration request to an agency.

**Authentication:** Required (user role)

**Parameters:**
- `agencyId` (path): ID of the target agency

**Response:**
```json
{
  "success": true,
  "message": "Request sent successfully"
}
```

**Errors:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid agency ID

---

### Module Configuration

---

### Dependencies
- `NotificationModule`: For sending notifications
- `AgencyModule`: For agency-related operations
- `AgentModule`: For agent-related operations
- `PrismaModule`: For database access

---

### Exports
All use cases and the repository token are exported for use in other modules.

---

### Database Schema Considerations

The module expects a `registrationrequest` table with the following key fields:
- `id` (primary key)
- `user_id` (foreign key)
- `agency_id` (foreign key)
- `request_type`
- `status`
- `requested_role`
- `created_at`
- `reviewed_by`
- `review_notes`
- `reviewed_at`

**Relationships:**
- Many-to-one with `user` table
- Many-to-one with `agency` table

---

### Usage Examples

---

### Creating a New Request
```typescript
const entity = RegistrationRequestEntity.createNew({
  userId: 123,
  agencyId: 456,
  requestType: "agent_license_verification",
  requestedRole: "agent"
});

const requestId = await registrationRequestRepo.create(entity);
```

---

### Reviewing a Request
```typescript
await updateRequestStatusUseCase.execute({
  requestId: 789,
  status: "approved",
  reviewedBy: 100,
  reviewNotes: "Application looks good"
});
```

---

### Getting Agency Requests
```typescript
const requests = await getRequestsUseCase.execute(
  agencyId: 456,
  page: 1,
  take: 10,
  status: "pending"
);
```

---

### Best Practices

1. **Transaction Support**: Use the optional `tx` parameter when operations need to be atomic
2. **Error Handling**: All use cases throw appropriate HTTP exceptions with localized messages
3. **Status Management**: Always use the entity's `setStatus` method or `updateStatus` repository method
4. **Pagination**: Use `GetRequestsUseCase` with proper page/take parameters for large datasets
5. **Notifications**: Quick requests automatically notify agency owners

---

### Future Considerations

- Add bulk approval/rejection capabilities
- Implement request expiration mechanism
- Add audit logging for status changes
- Support for request amendments
- Enhanced filtering and search capabilities