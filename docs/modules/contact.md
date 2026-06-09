### Cleanup Module

---

### Overview

The Cleanup module is an internal service module with no HTTP endpoints. It provides two scheduled maintenance operations called by cron jobs: deleting unverified users who have been pending too long, and expiring advertisements that have passed their end date. It orchestrates these operations by delegating to use cases from other modules.

---

### Architecture

```
cleanup/
├── application/
│   └── use-cases/
│       └── delete-unverified-user.use-case.ts
├── service/
│   └── clean-up.service.ts
└── cleanup.module.ts
```

---

### Use Case

---

### DeleteUserUseCase

Deletes a user and cascades cleanup based on their role.

**Dependencies:** `IUserDomainRepository`, `DeleteRegistrationRequestsByUserUseCase`, `DeleteAgencyByOwnerUseCase`

**Flow:**
1. Fetch user by ID — throws `NotFoundException` if missing
2. If `role === 'agency_owner'` → `deleteAgency.execute(userId)` (deletes the agency)
3. If `role === 'agent'` → `deleteRequests.execute(userId)` (deletes pending registration requests)
4. `usersRepo.deleteById(userId)` — hard delete

Used exclusively by `CleanupService` for automated cleanup of expired unverified accounts.

---

### CleanupService

The main orchestrator called by cron jobs.

**Dependencies:** `FindUnverifiedUsersUseCase`, `DeleteUserUseCase`, `ExpireProductAdsUseCase`

---

### `deleteInactiveUnverifiedUsersBefore(date: Date): Promise<number>`

Deletes all users who registered but never verified their email before the given `date`.

**Flow:**
1. `findUnverifiedUsers.execute(date)` — returns users with `emailVerified = false` and `createdAt < date`
2. `Promise.all(users.map(u => deleteUser.execute(u.id)))` — deletes each user (role-aware cascade)
3. Returns count of deleted users

**Called by cron:** `CleanupCronJob` (see `cron-jobs.md`) — typically daily, for users older than 24–48 hours.

---

### `expireExpiredAdvertisements(): Promise<number>`

Expires all ads whose `endDate < now`.

**Flow:**
1. Delegates entirely to `ExpireProductAdsUseCase.execute()`
2. That use case fetches expired ads, bulk-updates status to `expired`, and sends notifications

**Returns:** Number of ads expired.

**Called by cron:** `CleanupCronJob` — typically every hour or every 15 minutes.

---

### Module Configuration

**Imports:** `UsersModule`, `AgencyModule`, `RegistrationRequestModule`, `AdvertiseProductModule`

**Providers:** `DeleteUserUseCase`, `CleanupService`

**Exports:** `DeleteUserUseCase`, `CleanupService` — exported for use by the cron module

---

### Design Notes

- No HTTP controller — this module is only used internally
- All operations are designed to be idempotent (safe to re-run)
- Role-aware deletion prevents orphaned agency/request records
- Notification of advertisement expiry is handled inside `ExpireProductAdsUseCase`, not here