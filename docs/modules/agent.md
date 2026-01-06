## Agent Module (Agency Members & Permissions)

Purpose:
- Manage **agents inside an agency**
- Control **agent roles, permissions, status and commission**
- Provide public and private agent listings
- Allow agents to see their own context (`/agents/me`)

Main concepts:

- `AgentEntity`
  - Represents the relation user ↔ agency (agencyagent)
  - Fields: `agencyId`, `agentUserId`, `roleInAgency`, `commissionRate`, `status`, `startDate`, `endDate`
  - Domain methods:
    - `canBeUpdated()`
    - `updateRole()`
    - `updateCommissionRate()`
    - `updateStatus()`
    - `updateEndDate()`

- `AgentPermissionEntity`
  - Represents fine-grained agent permissions:
    - `canEditOwnPost`
    - `canEditOthersPost`
    - `canApproveRequests`
    - `canViewAllPosts`
    - `canDeletePosts`
    - `canManageAgents`

- Agent view models / DTOs
  - `AgentMeResponse` → shape for `/agents/me` endpoint
  - `AgentPaginationResponseDto` / `AgentForFrontEndDto` → paginated list for frontend
  - `FilterAgentsDto` → search/sort/status filters for agent listing
  - `UpdateAgentsDto` → payload for updating role/status/commission/end date/permissions
  - `translateAgentChanges()` / `hasAgentChanges()` → helper to:
    - detect if there are real changes
    - generate **localized description** of changes for notifications

Repositories (domain interfaces):

- `IAgentDomainRepository`
  - `findById`, `findExistingAgent`, `findByAgencyAndAgent`
  - `findAgencyIdByAgent`
  - `getAgentAuthContext(userId)`
  - `createAgencyAgent(data, tx?)`
  - `getAgentsByAgency(...)` / `getAgentsCountByAgency(...)`
  - `updateAgencyAgent(...)`
  - `getAgentMe(userId)`
  - `getAgentByIdInAgency(agencyAgentId, agencyId)`
- `IAgentPermissionDomainRepository`
  - `getPermissionsByAgentId(...)`
  - `createPermissions(...)`
  - `updatePermissions(...)`

Mappers:

- `AgentMapper`
  - converts Prisma models (`agencyagent`, `agencyagent_permission`, `user`) → domain entities + view models
- `mapAgentToResponse()`
  - converts agent + user + agency + permissions → `AgentMeResponse`

Key use-cases:

- **Create / validate agents**
  - `CreateAgentUseCase` → creates agency agent records
  - `FindExistingAgentUseCase` → prevents duplicate agent records
  - `EnsureIdCardUniqueUseCase` → validates unique ID card numbers

- **Auth / context**
  - `GetAgentAuthContextUseCase`
    - used by auth layer to load:
      - `agencyId`
      - `agencyAgentId`
      - `roleInAgency`
      - `status`
      - `permissions`
    - data is attached to `RequestWithUser` and used by guards
  - `GetAgencyIdForAgentUseCase` → get agencyId by userId

- **Listing & queries**
  - `GetAgentsUseCase`
    - filters by agency, status, search term and sort
    - supports public (only `active`) and private (all statuses) views
    - returns `AgentPaginationResponseDto`
  - `GetAgentMeUseCase`
    - returns full agent context for the current user (`AgentMeResponse`)
  - `GetAgentByIdUseCase` / `GetAgentByIdInAgencyUseCase`
    - fetch single agent records, including agency scoping
  - `GetSingleAgentInAgencyUseCase`
    - ensure an agent belongs to specific agency (used by guards/flows)

- **Permissions**
  - `AddAgentPermissionsUseCase`
  - `GetAgentPermissionsUseCase`
  - `UpdateAgentPermissionsUseCase`
  - work on `agencyagent_permission` and are used when:
    - approving agent registration
    - editing agent permissions from dashboard

- **Updates & notifications**
  - `UpdateAgentUseCase`
    - validates `UpdateAgentsDto` (role, status, commission, end date, permissions)
    - checks if anything actually changed (`hasAgentChanges`)
    - updates agent record and permissions
    - builds localized change summary with `translateAgentChanges`
    - sends a **notification** (`agent_updated_by_agent`) to the affected agent

Controller:

- `AgentController` (`/agents`)
  - `GET /agents/public/:agencyId`
    - public listing of **active** agents for a given agency
    - supports filters + pagination
  - `GET /agents/dashboard`
    - private listing for agency owner / agent
    - guarded by:
      - `UserStatusGuard`
      - `@Roles('agency_owner', 'agent')`
    - uses `req.agencyId` from auth context
  - `PATCH /agents/update/:id`
    - requires `@Permissions('canManageAgents')`
    - guards:
      - `UserStatusGuard`
      - `AgentBelongsToAgencyGuard`
    - updates agent data + permissions, triggers notification
  - `GET /agents/me`
    - returns current user’s agent profile + agency + permissions
  - `GET /agents/:id`
    - returns agent info for a specific `agencyAgentId` inside the current agency

Integration with other modules:

- Uses:
  - `AgencyModule` (agency context / ownership)
  - `NotificationModule` (agent updated notifications)
  - Auth & guards:
    - `UserStatusGuard`
    - `Roles` decorator
    - `Permissions` decorator
    - `AgentBelongsToAgencyGuard`
- Works together with:
  - Agency Requests Module (approve agent → creates agent + permissions)
  - Authorization system (permissions + roles)

Why:
- Encapsulates all **“agent inside agency”** logic
- Provides a clean API for:
  - listing agents
  - updating roles / status / permissions
  - exposing “agent me” view
- Plays a key role in:
  - dashboard permissions
  - who can edit posts / approve requests / manage other agents

Module location:
- `src/modules/agent`
