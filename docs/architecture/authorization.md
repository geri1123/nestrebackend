## Authorization & Security Layer

### 1. Public Routes (@Public)

### 2. Authentication Guard (JwtAuthGuard)

### 3. Role-Based Access (@Roles + RolesGuard)

### 4. Permission-Based Access (@Permissions + PermissionsGuard)

### 5. Ownership / Context Guards
- ProductOwnershipAndPermissionGuard
- AgentBelongsToAgencyGuard

### 6. User / Account Status Guard (UserStatusGuard)

### 7. Rate Limiting (CustomThrottlerGuard)

### 8. Optional Authentication — SoftAuthService
### 9. JWT Infrastructure — SharedAuthModule

## Authorization & Security Layer

Purpose:
- Provide authentication & fine-grained authorization for API routes
- Protect resources based on role, permissions, ownership and account status
- Support localized error messages

---

### 1. Public Routes — `@Public()`

Decorator:
- Marks a route as publicly accessible
- Skips JwtAuthGuard + PermissionsGuard checks

---

### 2. Authentication — `JwtAuthGuard`

Purpose:
- Verify JWT token (cookie or Authorization header)
- Load user profile & attach to request
- Load agency / agent context when applicable
- Update `last_active` timestamp

Rejects when:
- Missing / invalid / expired token
- User not found
- Agent not associated with an agency

Context added to request:
- user
- userId
- agencyId
- agencyAgentId
- agentPermissions
- agentStatus

---

### 3. Role-Based Access — `@Roles()` + `RolesGuard`

Purpose:
- Restrict routes to specific user roles

Example:
- @Roles('agency_owner')

Behavior:
- Allows access only if user's role is in list

---

### 4. Permission-Based Access — `@Permissions()` + `PermissionsGuard`

Purpose:
- Fine-grained authorization (mainly for agency agents)

Rules:
- agency_owner → full access
- agent → permissions checked from DB
- others → allowed by default

Example:
- @Permissions('canEditOthersPost')

---

### 5. Ownership Guards

#### ProductOwnershipAndPermissionGuard
Ensures a user can modify a product only if:

- owner of product OR
- agency_owner in same agency OR
- agent with permission & same agency

---

#### AgentBelongsToAgencyGuard
Ensures:
- agency owners can modify only agents in their agency

---

### 6. Account Status — `UserStatusGuard`

Denies access if:
- user suspended
- agent inactive
- agency suspended

---

### 7. Rate Limiting — `CustomThrottlerGuard`

Purpose:
- Prevent abuse
- Localized throttling messages

Tracker:
- user id if authenticated
- otherwise IP address

### 8. Optional Authentication — SoftAuthService

Example endpoint:
- `GET /products/public/:id`
- Decorated with `@Public()`

Flow:
1. Route is public (no login required)
2. `SoftAuthService.attachUserIfExists()` runs
3. If token exists and is valid → `req.userId` is set
4. If not → the request continues as guest
5. Product is returned normally
6. Click tracking uses:
   - logged-in user id OR
   - 'guest' fallback

Why this pattern exists:
- Same endpoint works for both guests & logged-in users
- Logged-in users get personalized behavior (e.g. analytics)
- Guests still have full access to public content
- No duplicate endpoints needed
- No auth errors for anonymous users

Important:
- Soft auth NEVER throws on invalid token
- It only enriches the request when possible

### 9. JWT Infrastructure — SharedAuthModule

Purpose:
- Provides a single shared JwtModule configuration for the whole application
- Ensures all authentication services and guards use the same JWT secret & expiry settings

Behavior:
- Loads secret from AppConfigService (`jwtSecret`)
- Token expiry: 1 day
- Exports:
  - JwtModule
  - AppConfigModule

Why:
- Centralized JWT config
- Prevents duplicated setup across modules
- Guarantees consistent token signing & verification
- Improves maintainability and testability

Used by:
- JwtAuthGuard
- SoftAuthService
- Auth token services
- Any feature needing JWT support