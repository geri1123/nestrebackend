# Cache Layer

## Purpose

The cache layer provides a Redis-backed application cache used to:

- Improve performance
- Reduce database load
- Store temporary lookup data
- Share cached data between server instances

## Technologies

- Redis
- Keyv
- keyv-redis adapter
- NestJS Dependency Injection

## Location

infrastructure/cache/cache.module.ts
infrastructure/cache/cache.service.ts
infrastructure/cache/cache.constants.ts