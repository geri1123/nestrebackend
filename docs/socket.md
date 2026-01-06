## SocketAuthService

Purpose:
- Extract and verify JWT tokens for WebSocket connections
- Provide authenticated user context (userId) for socket layer

Token extraction priority:
1. `cookie` header → `token` cookie
2. `Authorization` header → `Bearer <token>`
3. `handshake.auth.token`
4. `handshake.query.token` (least secure, last resort)

Behavior:
- Uses `JwtService` with `AppConfigService.jwtSecret`
- Returns `{ userId }` on success, `null` on failure
- Logs debug info for cookie-based tokens
- Logs warning when token verification fails

Why:
- Central place for socket auth logic
- Keeps token parsing & verification consistent with HTTP auth
- Avoids duplicating JWT logic inside gateways


## SocketConnectionService

Purpose:
- Track active WebSocket connections per user
- Provide helper methods to query online status and socket IDs

Data structure:
- `Map<number, string[]>`
  - key → `userId`
  - value → list of active `socketId`s for that user

Behavior:
- `addConnection(userId, socketId)`:
  - Adds socketId to user’s list if not already present
  - Logs connection + total connections for that user
- `removeConnection(userId, socketId)`:
  - Removes socketId from user’s list
  - Deletes user entry when no sockets remain
  - Logs disconnect/remaining connections
- `getUserConnectionCount(userId)`:
  - Returns number of active sockets for user
- `isUserOnline(userId)`:
  - Returns true if user has at least one active socket
- `getConnectedUserIds()`:
  - Returns list of all userIds with active connections
- `getSocketIdsForUser(userId)`:
  - Returns all socketIds for a given user
- `clearAll()`:
  - Clears all tracked connections (e.g. on shutdown)

Why:
- Allows multi-tab / multi-device WebSocket handling
- Enables features like online status, targeted broadcasts, etc.


## SocketRateLimitService

Purpose:
- Rate-limit incoming WebSocket connection attempts by IP
- Protect socket gateway from abuse or brute-force

Config:
- `windowMs`: 60000 (1 minute)
- `maxAttempts`: 10 attempts per IP per window

Behavior:
- Internal map: `Map<string, number[]>`
  - key → IP address
  - value → timestamps of connection attempts
- `checkRateLimit(ip)`:
  - Filters attempts within last `windowMs`
  - If count >= `maxAttempts` → logs warning and returns `false`
  - Otherwise records current attempt and returns `true`
  - Periodically triggers `cleanup()` when map grows large
- `cleanup()`:
  - Removes old timestamps outside window
  - Deletes entries with no recent attempts
- `clear()`:
  - Clears all rate limit state

Why:
- Prevents abuse / flooding of WebSocket gateway
- Simple in-memory protection layer per instance
- Central place to tweak rate limit behavior