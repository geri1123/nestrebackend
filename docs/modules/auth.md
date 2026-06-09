## Auth Module (Login, Tokens, Cookies, Google OAuth)

Purpose:
- Handle **username/email + password login**
- Support **Google OAuth login**
- Issue **JWT access tokens** and **refresh tokens** (dual-cookie system)
- Manage **auth cookies** (access cookie + refresh cookie)
- Rate-limit sensitive endpoints via `@Throttle`
- Expose auth-related HTTP endpoints (all `@Public`)

Location:
- Module: `src/modules/auth/auth.module.ts`
- Controller: `src/modules/auth/auth.controller.ts`
- Use cases: `src/modules/auth/application/use-cases`
- Services: `src/modules/auth/infrastructure/services`

---

### Core Services

#### `AuthTokenService`
Wraps `JwtService` (configured in `SharedAuthModule`).

**Methods:**
- `generateAccessToken(user, rememberMe)` → short-lived access JWT. Payload: `{ userId, username, email, role }` (`CustomJwtPayload`). Expiry: 30 days if `rememberMe`, 1 day otherwise.
- `generateRefreshToken(userId)` → long-lived refresh JWT. Payload includes a `jti` (unique token ID) for invalidation support.
- `verifyRefreshToken(token)` → decodes and validates a refresh token; throws if expired or invalid.

#### `AuthCookieService`
Centralizes how both cookies are set and cleared.

**Methods:**
- `setAccessCookie(res, token, rememberMe)` — sets the `token` cookie (`httpOnly`, `secure` in production, `sameSite: none` prod / `lax` dev). `maxAge`: 30 days or 1 day.
- `setRefreshCookie(res, token)` — sets the `refreshToken` cookie with a longer TTL.
- `clearAllCookies(res)` — clears both `token` and `refreshToken` cookies on logout.

#### `GoogleAuthService`
Wraps Google OAuth client (`google-auth-library`).
- `verify(idToken)` → verifies Google ID token; returns `{ email, firstName, lastName }`; throws `UnauthorizedException` if invalid.

#### `AuthContextService`
- `invalidateContext(userId)` — invalidates the server-side auth context on logout, forcing re-authentication.

---

### Use Cases

#### `LoginUseCase`
Input: `LoginDto` (`identifier`, `password`, `rememberMe?`)

Flow:
1. Load auth user via `FindUserForAuthUseCase` (by username or email).
2. Check `status === 'active'`.
3. Compare passwords with `comparePassword`.
4. Load full user (`FindUserByIdUseCase`) and update `last_login` (`UpdateLastLoginUseCase`).
5. Generate **access token** (`AuthTokenService.generateAccessToken`) and **refresh token** (`generateRefreshToken`).

Output: `{ user, accessToken, refreshToken }`

The controller then:
- Calls `authCookieService.setAccessCookie(res, accessToken, rememberMe)`
- Calls `authCookieService.setRefreshCookie(res, refreshToken)`

#### `GoogleLoginUseCase`
Input: `idToken` (Google ID token string)

Flow:
1. Verify the Google token via `GoogleAuthService.verify`.
2. Look up user by email; if not found, auto-register with a generated username.
3. Generate access + refresh tokens and set both cookies.

#### `RefreshTokenUseCase`
Allows a client with an expired access token to obtain a new one using the `refreshToken` cookie.

Input: `refreshToken` (string from `req.cookies.refreshToken`), `lang`

Flow:
1. Call `authTokenService.verifyRefreshToken(refreshToken)` — throws `UnauthorizedException` if invalid or expired.
2. Fetch user by `decoded.userId`.
3. Generate new access token via `generateAccessToken(user, false)`.
4. Set new access cookie via `authCookieService.setAccessCookie`.

Output: `{ user, accessToken }`

---

### API Endpoints

All endpoints are decorated `@Public()`.

#### POST /auth/login
Rate limit: 5 requests / 240 seconds.

Request body: `{ identifier, password, rememberMe? }`

On success: sets `token` + `refreshToken` cookies; returns `{ success, message, user: { id, username, email, role } }`.

#### POST /auth/register/user
Rate limit: 3 requests / 600 seconds.

Registers a standard user account. Returns `{ success, message }`.

#### POST /auth/register/agency_owner
Rate limit: 3 requests / 600 seconds.

Registers an agency owner account. Delegates to `RegisterAgencyOwnerUseCase`.

#### POST /auth/register/agent
Rate limit: 3 requests / 600 seconds.

Registers an agent account. Delegates to `RegisterAgentUseCase`.

#### POST /auth/google
Rate limit: 3 requests / 600 seconds.

Body: `{ idToken: string }`

Verifies Google ID token and logs in (or auto-registers) the user. Sets both cookies.

#### POST /auth/refresh
Rate limit: 3 requests / 600 seconds.

Reads `refreshToken` from cookies. Returns a new access token in the `token` cookie.

Returns `{ success, user: { id, username, email, role } }`.

Throws `401 Unauthorized` if the cookie is missing or the token is invalid/expired.

#### POST /auth/logout
Calls `authContextService.invalidateContext(userId)` to invalidate the server-side session, then calls `authCookieService.clearAllCookies(res)`.

Returns `{ success: true }`.

---

### Token & Cookie Architecture

```
Login
  ├── generateAccessToken()  → short-lived  → cookie: "token"
  └── generateRefreshToken() → long-lived   → cookie: "refreshToken"

Access token expires
  └── POST /auth/refresh
        ├── reads: req.cookies.refreshToken
        ├── verifyRefreshToken()
        ├── generateAccessToken()
        └── sets new "token" cookie

Logout
  └── clearAllCookies() → clears "token" + "refreshToken"
```

---

### Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| POST /auth/login | 5 requests | 240 s |
| POST /auth/register/* | 3 requests | 600 s |
| POST /auth/google | 3 requests | 600 s |
| POST /auth/refresh | 3 requests | 600 s |
| POST /auth/logout | no limit | — |

Implemented via `@Throttle` decorator + `CustomThrottlerGuard`.

---

### Security Considerations

1. All cookies are `httpOnly` — not accessible by JavaScript
2. `secure: true` in production — HTTPS only
3. `sameSite: 'none'` in production (required for cross-origin cookie delivery)
4. Refresh token has a `jti` claim for future per-token revocation
5. Login is rate-limited to mitigate brute-force attacks
6. Logout invalidates the server-side auth context immediately