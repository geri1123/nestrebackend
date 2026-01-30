## Cleanup Module (User & Data Cleanup)

Purpose:
- Automatically remove **old unverified accounts** and their related data.
- Prevent database bloat and keep the platform clean.
- Safely cascade-delete dependent records.

Location:
- Module: `src/modules/cleanup/cleanup.module.ts`
- Services: `src/modules/cleanup/service`
- Use cases: `src/modules/cleanup/application/use-cases`

---

### `DeleteUserUseCase`

Responsible for **safely deleting a user and related domain records**.

Flow:
1. Validate that the user exists.
2. Delete all **registration requests** created by that user.
3. If the user owns an agency → delete the agency.
4. Delete the user record.

This ensures **no orphaned data** remains.

Depends on:
- `UsersModule`
- `AgencyModule`
- `RegistrationRequestModule`

Throws:
- `NotFoundException` if the user does not exist.

---

### `UserCleanupService`

Service used for **automated cleanup jobs**  
(e.g., cron, scheduler, background worker).

Method:
deleteInactiveUnverifiedUsersBefore(date: Date): Promise<number>


Behavior:
- Fetch users who:
  - have **not verified email**
  - and were created **before the given date**
- Deletes them using `DeleteUserUseCase`
- Returns number of deleted users

Use case:
- remove stale sign-ups
- reduce storage & GDPR exposure

---

### `CleanupModule`

Imports:
- `UsersModule`
- `AgencyModule`
- `RegistrationRequestModule`

Exports:
- `DeleteUserUseCase`
- `UserCleanupService`

So other modules / schedulers can trigger cleanup.

---

### Why This Exists

- Prevent unused accounts from piling up
- Keep database relations consistent
- Support privacy & data lifecycle rules
- Centralize delete logic in one place

This module **does NOT handle normal user deletion UI flows** —  
it is focused on **system-level cleanup**.