# NestJS Real Estate API

A starter project using [NestJS](https://nestjs.com/) with TypeScript for managing real estate properties, agencies, and user permissions. Features Redis caching for optimized performance on filtering, registration, and permission checks.

---

## Features

- **User Management**
  - Normal users can register and view properties.
  - Agency owners can manage properties and agents.
  - Agent permissions are controlled via roles and cached in Redis.

- **Property Management**
  - Create, update, and publish properties.
  - Filter and search properties with caching for faster queries.

- **Agency Management**
  - Register agencies and activate/deactivate them.
  - Fetch paginated agency lists with logo URLs.

- **Permissions**
  - Fine-grained access control with `PermissionsGuard`.
  - Agency owners bypass agent permission checks.
  - Agents have status-based permission checks.
  - Redis caching for permissions to reduce database load.

- **Redis Caching**
  - Property filtering results
  - Temporary registration tokens/OTP
  - Cached permissions for users/agents

- **Localization**
  - Supports multiple languages (default: Albanian)
  - Messages localized via `t('messageKey', lang)`

- **Database**
  - Uses Prisma ORM
  - PostgreSQL/MySQL support (configurable)
  - Data models: `User`, `Agency`, `Property`, `Agent`, `Permissions`
## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
