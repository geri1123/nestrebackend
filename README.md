NestJS Real Estate API

A scalable Real Estate Management API built with NestJS + TypeScript.
It provides a modular architecture for handling properties, agencies, agents, and permissions, with Redis caching and Prisma ORM for performance and reliability.

 Key Features
 User & Role Management

Users can register, browse, and filter properties.

Agency Owners can create and manage properties and agents.

Agents have controlled access to actions based on assigned roles and permissions.

Role-based permissions are cached in Redis for faster authorization checks.

 Agency Management

Create and manage agencies with activation and deactivation support.

Assign and manage agents under each agency.

Fetch paginated agency lists with logo URLs and localized details.

 Property Management

Create, update, and delete properties.

Attach multiple images to properties (Firebase storage integration).

Advanced search and filter functionality by category, subcategory, price, city, and more.



-- Permissions & Access Control

Fine-grained permission system powered by a custom PermissionsGuard.

Agency owners automatically bypass agent-level permission checks.

Agents are validated against their role-based permissions and current status.

=

-- Redis Caching

Property filters (categories, subcategories, cities, states).




Significantly reduces repeated database calls and improves response times.

-- Localization

Full multilingual support, default language: Albanian (al).

All responses and error messages are localized using the t('key', lang) helper.

--- Database & ORM

Prisma ORM with PostgreSQL/MySQL support (configurable).

Well-structured data models:

User

Agency

Agent

Property

Permission

RegistrationRequest

Includes migration-ready schema for fast setup and scaling.

-- Tech Stack
Layer	Technology
Framework	NestJS (TypeScript)
ORM	Prisma
Database	PostgreSQL / MySQL
Cache	Redis
File Storage	Firebase Storage
Validation	class-validator + custom pipes
Authentication	JWT + Guards
Localization	Custom t() translation helper
-- Project Highlights

Modular NestJS structure with clear separation of concerns.

Reusable guards for authentication, roles, and permissions.

Redis caching integrated for performance-critical endpoints.

Fully localized for multi-language real estate platforms.

Extensible design — easy to add more entities (e.g., reviews, favorites, etc.)
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
