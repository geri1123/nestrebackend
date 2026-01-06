## Agency Module (Domain Overview)

Purpose:
- Manage real estate agencies in the platform
- Link agencies to owner users and agents
- Expose public & private agency info
- Handle agency profile, logo and status

Main concepts:
- `Agency` (entity) → domain model for an agency with behavior:
  - updateFields()
  - updateLogo()
  - removeLogo()
  - hasCustomLogo()
  - activate() / suspend()
  - isActive() / isSuspended()
- `AgencyInfoVO` → detailed view model for a single agency (with owner info)
- `PaginatedAgenciesVO` → paginated list shape for public agency listings

Key relations:
- Each agency has:
  - `ownerUserId` → maps to a user with role `agency_owner`
  - status (active / suspended / inactive)
  - public code (used for public links)
  - optional logo, email, phone, website, address
- Agencies are used by:
  - agents (via agency-agent module)
  - products (agency listings)
  - authorization (agency-level permissions)

Use-cases (examples):
- **Registration & lifecycle**
  - `CreateAgencyUseCase` → creates an agency with validation and uniqueness checks
  - `RegisterAgencyFromUserUseCase` → creates agency and updates user role to `agency_owner` in one transaction
  - `ActivateAgencyByOwnerUseCase` → activates agency by owner user id
  - `DeleteAgencyByOwnerUseCase` → deletes agency tied to an owner

- **Validation / checks**
  - `ValidateAgencyBeforeRegisterUseCase` → pre-check name and license conflicts
  - `CheckAgencyNameExistsUseCase` → name uniqueness
  - `CheckLicenseExistsUseCase` → license uniqueness

- **Queries**
  - `GetAgencyByIdUseCase` → internal get by ID
  - `GetAgencyByOwnerUseCase` → used in auth/guards for context
  - `GetAgencyByPublicCodeUseCase` → public access via public code
  - `GetAgencyWithOwnerByIdUseCase` → agency + owner info
  - `GetAgencyInfoUseCase` → returns `AgencyInfoVO` with logic:
    - for public routes → hides non-active (throws NotFound)
    - for protected routes → can see non-active

- **Profile & logo**
  - `UpdateAgencyFieldsUseCase` → update name, email, phone, address, website
  - `UploadAgencyLogoUseCase` → validates image, uploads to Cloudinary, updates DB, deletes old logo, handles rollback on failure
  - `DeleteAgencyLogoUseCase` → removes logo and handles “no image to delete”

- **Listing**
  - `GetPaginatedAgenciesUseCase` → public list of agencies with paging

Controller:
- `AgencyController` (`/agencies`)
  - Public:
    - `GET /agencies` → paginated list (public)
    - `GET /agencies/:id/detail` → public agency detail (only active)
  - Private:
    - `GET /agencies/agencyinfo` → private agency info for authenticated owner/agent
    - `PATCH /agencies/update-fields` → agency profile edit (owner only)
    - `PATCH /agencies/upload-logo` → upload logo (owner only)
    - `DELETE /agencies/logo` → delete logo (owner only)
    - `POST /agencies/create-agency` → user → agency_owner + create agency

Guards & roles integration:
- Uses `@Roles('agency_owner', 'agent')` / `@Roles('user')`
- Relies on `RequestWithUser` context (agencyId, userId)
- Localized error messages via `t()` and `SupportedLang`

Why:
- Central place for **agency lifecycle & profile**
- Connects users → agencies → listings → permissions
- Keeps domain logic in use-cases, not controllers
- Ensures data consistency (role change + agency creation in transactions)

Module location:
- `src/modules/agency`