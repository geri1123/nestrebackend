## Agency Requests Module (Agent Registration Approvals)

Purpose:
- Handle approval / rejection of agency-related registration requests
- Allow agency owners / authorized agents to review and manage join requests
- Coordinate role changes, agent creation, permissions, emails and notifications

Main concepts:
- `RegistrationRequestEntity` → represents a user’s request to join an agency (or similar)
- Agency-level permissions (`canApproveRequests`) control who can approve/reject
- Requests are always tied to a specific `agencyId` and `userId`

Key use cases:

- `GetAgencyRequestsUseCase`
  - Returns paginated registration requests for a given agency
  - Supports filtering by status (`pending`, `approved`, `rejected`, etc.)
  - Output includes: page, limit, total, totalPages, requests[]

- `ApproveAgencyRequestUseCase`
  - Validates that:
    - user exists and email is verified
    - user is not already an active/inactive agent (handled by `findExistingAgent` — throws if active, returns terminated agent or null)
  - Inside a DB transaction:
    - **Re-joining (terminated agent):** updates existing `AgencyAgent` record (role, commission, status → active, endDate → null). Updates existing permissions or creates new ones.
    - **New agent:** creates new `AgencyAgent` record + permissions via `createAgent` + `addPermissions`
    - Updates user role → `agent`, status → `active` (if changed)
  - After transaction:
    - Emits `EMAIL_EVENTS.AGENT_WELCOME` event (welcome email via EventEmitter2)
    - Sends `agency_confirm_agent` notification to agent

- `RejectAgencyRequestUseCase`
  - Resets user role → `user`, status → `active` via `UpdateUserFieldsUseCase`
  - Emits `EMAIL_EVENTS.AGENT_REJECTED` event (rejection email via EventEmitter2)

- `UpdateAgencyRequestStatusUseCase`
  - Orchestrates the workflow:
    - loads request by id
    - ensures the request belongs to the current agency
    - if `action === "approved"` → delegates to ApproveAgencyRequestUseCase
    - if `action === "rejected"` → delegates to RejectAgencyRequestUseCase
    - updates request status (approved / rejected), reviewer and review notes
  - Returns a localized success message

Controller:

- `AgencyRequestsController` (`/agencies`)
  - `GET /agencies/registration-requests`
    - Guards:
      - `UserStatusGuard`
      - `PermissionsGuard`
      - `@Roles('agent', 'agency_owner')`
      - `@Permissions('canApproveRequests')`
    - Requires `req.agencyId`
    - Returns paginated requests for the current agency
  - `PATCH /agencies/registration-requests/:id/status`
    - Same guards as above
    - Validates `UpdateRequestStatusDto`
    - Only allows:
      - `action: "approved" | "rejected"`
      - when `approved` → requires `roleInAgency`, optional `commissionRate` and `permissions`
    - Calls `UpdateAgencyRequestStatusUseCase`

DTO:

- `UpdateRequestStatusDto`
  - `action` → `approved` or `rejected`
  - `roleInAgency` → required when approving (enum `agencyagent_role_in_agency`)
  - `commissionRate` → optional, numeric, >= 0 when approving
  - `reviewNotes` → optional string
  - `permissions` → optional flags for agent permissions

Authorization & guards:
- Only users with:
  - role: `agent` or `agency_owner`
  - permission: `canApproveRequests`
  - valid agency context (`req.agencyId`)
- User / agency status is validated via `UserStatusGuard`
- Localized error and success messages via `t()` and `SupportedLang`

Why:
- Centralizes agent approval / rejection flow
- Ensures consistent role and status updates across users and agents
- Ties together:
  - agency context
  - permissions
  - notifications
  - email
  - audit info (reviewer & notes)
- Prevents agencies from approving requests belonging to other agencies

Module location:
- `src/modules/agency-requests`