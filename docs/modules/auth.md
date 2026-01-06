## Auth Module (Login, Tokens, Cookies, Google OAuth)

Purpose:
- Handle **username/email + password login**
- Support **Google OAuth login**
- Issue **JWT access tokens**
- Manage **auth cookies** (remember-me vs normal session)
- Expose auth-related HTTP endpoints

Location:
- Module: `src/modules/auth/auth.module.ts`
- Controller: `src/modules/auth/auth.controller.ts`
- Use cases: `src/modules/auth/application/use-cases`
- Services: `src/modules/auth/infrastructure/services`

### Core Services

#### `AuthTokenService`
- Wraps `JwtService` (configured in `SharedAuthModule`).
- Method: `generate(user, expiresInDays = 1): string`
  - Payload: `{ userId, username, email, role }` (`CustomJwtPayload`)
  - Expiration: `expiresInDays * 24 * 60 * 60` seconds
- Used by login & Google login to issue JWTs.

#### `AuthCookieService`
- Method: `setAuthCookie(res, token, rememberMe)`
  - Cookie name: `token`
  - `httpOnly: true`
  - `secure: NODE_ENV === 'production'`
  - `sameSite: 'none'` in production, `'lax'` otherwise
  - `maxAge`:
    - 30 days if `rememberMe = true`
    - 1 day otherwise
- Centralizes how auth cookies are set for the client.

#### `GoogleAuthService`
- Wraps Google OAuth client (`google-auth-library`).
- Uses config from `AppConfigService` (`googleClientId`, `googleClientSecret`).
- Method: `verify(idToken)`
  - Verifies Google ID token.
  - Returns `{ email, firstName, lastName }`.
  - Throws `UnauthorizedException` if token is invalid.

### Use Cases

#### `LoginUseCase`
- Input: `LoginDto`:
  - `identifier` (username or email)
  - `password`
  - `rememberMe?` (boolean)
- Flow:
  1. Load auth user via `FindUserForAuthUseCase` (by username/email).
  2. Check `status === 'active'`.
  3. Compare passwords with `comparePassword`.
  4. Load full user (`FindUserByIdUseCase`) and update `last_login` (`UpdateLastLoginUseCase`).
  5. Generate JWT with `AuthTokenService.generate(user, rememberMe ? 30 : 1)`.
- Output: `{ user, token }`
- Controller then sets auth cookie using `AuthCookieService`.

#### `GoogleLoginUseCase`
- Input: `{ idToken }` from frontend, plus `Response`.
- Flow:
  1. Verify Google token via `GoogleAuthService.verify`.
  2. Check if a user with `googleUser.email` exists:
     - If yes → reuse that user.
     - If no → create new user:
       - Username from email prefix; if taken, use `generateUsername`.
       - Empty password (`''`), role: `user`, status: `active`.
  3. Generate JWT for 30 days (`generate(user, 30)`).
  4. Set auth cookie with `AuthCookieService.setAuthCookie(res, token, true)`.
- Output: `{ success: true, user }`.

### Controller: `AuthController` (`/auth`)

Public controller (decorated with `@Public()` on the class):

- `POST /auth/login`
  - DTO: `LoginDto`
  - Throttled: `limit: 5`, `ttl: 240000`
  - Uses `LoginUseCase`.
  - Sets `token` cookie via `AuthCookieService`.
  - Response:
    ```json
    {
      "success": true,
      "message": "loginSuccess",
      "user": { "id", "username", "email", "role" }
    }
    ```

- `POST /auth/register/user`
  - DTO: `BaseRegistrationDto`
  - Uses `RegisterUserUseCase`.
  - Registers a normal user.

- `POST /auth/register/agency_owner`
  - DTO: `RegisterAgencyOwnerDto`
  - Uses `RegisterAgencyOwnerUseCase`.

- `POST /auth/register/agent`
  - DTO: `RegisterAgentDto`
  - Uses `RegisterAgentUseCase`.

- `POST /auth/google`
  - Body: `{ idToken: string }`
  - Uses `GoogleLoginUseCase`.
  - Sets auth cookie (30 days) and returns `{ success, user }`.

### Module: `AuthModule`

Imports:
- `SharedAuthModule` (provides configured `JwtModule` + `AppConfigModule`)
- `NotificationModule`
- `EmailModule`
- `UsersModule`
- `RegistrationModule`
- `AgencyModule`
- `AgentModule`
- `RegistrationRequestModule`
- `AppCacheModule`

Providers:
- `LoginUseCase`
- `RefreshTokenUseCase`
- `GoogleLoginUseCase`
- `GoogleAuthService`
- `AuthTokenService`
- `AuthCookieService`

Exports:
- `RefreshTokenUseCase` (so other modules can refresh tokens if needed)

Why:
- Centralizes all **authentication flows**:
  - classic login
  - Google OAuth login
  - token issuing
  - cookie management
- Keeps auth separate from business logic (agencies, agents, products).