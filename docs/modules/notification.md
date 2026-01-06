# Notifications Module — Documentation

Version: 1.0  
Date: 2026-01-06

## Overview

The Notifications Module provides both REST APIs and a WebSocket gateway to:

- Create and persist notifications
- Read a user's notifications (paginated)
- Count unread notifications
- Mark notifications read (single and bulk)
- Delete notifications
- Deliver real-time notifications and unread counts via WebSocket

Key characteristics:
- Uses Prisma for DB access (repository pattern)
- WebSocket namespace: `/notifications`
- Authenticated REST endpoints (except creation which may be internal)
- WebSocket connections are authenticated via token
- Translations supported for messages (language-aware)
- Notification templates centralized in `NotificationTemplateService`
- Socket connection & rate-limit services protect and manage connections
- DTOs and Swagger decorators provide API documentation

Module location (example):
- `src/modules/notification/`  
Exports:
- `NotificationService`, `NotificationTemplateService`

---

## Endpoint Summary (REST)

All REST endpoints are under `/notifications`. Most endpoints require authentication (bearer token) for the user.

- POST /notifications
  - Create and store a notification (body: CreateNotificationDto)
  - Returns created notification (HTTP 201)
  - Decorators: `CreateNotification` Swagger helper (summary + success/unauthorized responses)

- GET /notifications
  - Get authenticated user's notifications (paginated)
  - Query params: `limit` (optional, default 10), `offset` (optional, default 0)
  - Response includes `notifications`, `unreadCount`, `total`, `limit`, `offset`
  - Decorators: `GetMyNotifications` Swagger helper

- GET /notifications/unread-count
  - Returns unread notification count for authenticated user

- GET /notifications/online-status
  - Returns whether the current user is connected to WebSocket (for debugging/UX)

- PATCH /notifications/:id/read
  - Mark a single notification as read
  - Path param: `id` (notification id)
  - Returns success + localized message

- PATCH /notifications/mark-all-read
  - Mark all unread notifications for the authenticated user as read (bulk)
  - Uses repository bulk update for performance

- DELETE /notifications/:id
  - Delete a notification by id
  - Returns success + localized message

---

## DTOs & Interfaces

- CreateNotificationDto
  - userId: number
  - type: string (e.g., `agent_pending`, `user_send_request`)
  - translations: NotificationTranslationDto[] (must include languageCode + message)

- NotificationTranslationDto
  - languageCode: Supported language (enum: `en`, `al`, `it` in current code)
  - message: string

- NotificationPayload (socket payload)
  - id: number
  - type: string
  - status: string
  - translations: any[] (localized messages)
  - createdAt: Date

- ServerToClientEvents (Socket events sent by server)
  - connected: { message: string; userId: number }
  - notification: NotificationPayload
  - unread_count: { count: number }
  - pong, error, heartbeat

- ClientToServerEvents (Socket events sent by client)
  - ping
  - subscribe_notifications

- AuthenticatedSocket extends Socket with optional userId property

- Repository interface (INotificationRepository)
  - createNotification(data: NotificationData): Promise<any>
  - getNotifications(params: GetNotificationsParams): Promise<any[]>
  - countUnread(userId: number): Promise<number>
  - changeNotificationStatus(notificationId: number, status: NotificationStatus): Promise<any>
  - markAllAsReadForUser(userId: number): Promise<{ count: number }>
  - deleteNotification(notificationId: number): Promise<any>
  - getNotificationById(notificationId: number): Promise<any>

---

## Database Interaction (Repository)

All DB operations go through `NotificationRepository` which uses Prisma service:

- createNotification
  - Creates `notification` and nested `notificationtranslation` rows
  - Sets status to `unread` by default

- getNotifications
  - Supports `languageCode` filter to return translations only for that language (if provided)
  - Orders by `createdAt desc`
  - Pagination via `take` (limit) and `skip` (offset)

- countUnread
  - Counts notifications where `status === unread`

- changeNotificationStatus
  - Updates status and sets `readAt` when marking as read

- markAllAsReadForUser
  - Uses `updateMany` to bulk change unread notifications -> read and set `readAt` timestamp
  - Returns { count } of updated rows

- deleteNotification
  - Soft/hard delete depending on Prisma schema (current code uses delete)

- getNotificationById
  - Returns notification with translations

Notes:
- Repository methods are typed using Prisma enums (LanguageCode, NotificationStatus).
- Only active/unread semantics expected; adjust queries to your schema and soft-delete policy.

---

## WebSocket Gateway & Socket Flow

Gateway:
- Namespace: `/notifications`
- CORS origin is configured from env `FRONTEND_URL` or fallback `http://localhost:3000`
- Implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
- Injected services:
  - SocketAuthService: token extraction & verification
  - SocketConnectionService: track connections per user
  - SocketRateLimitService: limit abuse based on IP / attempts
  - NotificationSocketService: emits events when server wants to notify clients

Connection flow:
1. Client connects to `ws://<host>/notifications` with token (e.g., in `Authorization` cookie/header/handshake)
2. `handleConnection`:
   - Rate-limit check by IP (disconnect on breach)
   - Extract token and verify; if invalid, emit `error` and disconnect
   - After verification: attach `userId` to socket and register connection via `connectionService`
   - Socket joins room `user:<userId>` so target emits can use `.to('user:<id>')`
   - Emit `connected` event to client

3. Client may call `subscribe_notifications` to re-join user room (safe no-op if already joined)

4. Gateway provides `ping` event (responds with `pong`) and heartbeat done by `NotificationSocketService`

Disconnection:
- Removes connection from `SocketConnectionService` for cleanup

Security:
- Authentication enforced on connect
- Rate limiter guards against connection spam
- All messages sent to `user:<id>` rooms — avoids broadcasting sensitive info to wrong users

---

## Notification Socket Service

Responsibilities:
- Holds server instance `Server<ClientToServerEvents, ServerToClientEvents>`
- sendNotificationToUser(userId, notification)
  - Emits `notification` to `user:<userId>`
  - Logs sends
- sendUnreadCountUpdate(userId, count)
  - Emits `unread_count` to `user:<userId>`
- sendHeartbeat()
  - Emits `heartbeat` to all connected sockets
- broadcastToAll(event, data)
  - Utility to broadcast any event if needed

Important: `setServer(server)` must be called (done in Gateway.afterInit). Service methods check server presence and log errors if not initialized.

---

## Notification Service (Application Logic)

Key behaviors:
- sendNotification(data)
  - Persists notification with translations
  - If user is online (gateway checks connection service), sends:
    - `notification` via WebSocket
    - Updates unread count and sends `unread_count`
  - Errors while sending real-time messages are logged; DB storage is authoritative

- getUserNotifications(userId, language, limit, offset)
  - Delegates to repository with provided language filter

- countUnreadNotifications(userId)
  - Delegates to repository

- markNotificationAsRead(notificationId)
  - Updates single notification status
  - If user online, triggers unread count update

- markAllAsRead(userId)
  - Uses repository bulk update (efficient)
  - Sends unread count = 0 if user online

- deleteNotification(notificationId)
  - Deletes and, if deleted notification was unread, updates unread count for user

- getOnlineUsers / isUserOnline
  - Exposes gateway connection data to other modules (e.g., admin dashboard)

---

## Notification Templates

`NotificationTemplateService` stores message templates organized by `type` and `LanguageCode`.

API:
- getAllTranslations(type, user) -> returns translations array for all languages available for `type`
- getTemplate(type, user, language) -> returns message string for a single language

Templates are functions that accept a `user` or `data` object, allowing computed messages like:
- `${data.username} wants to join your agency.`

Templates should be kept up-to-date for all supported languages. Fallbacks: use `LanguageCode.en` or return empty string.

---

## Swagger / API Documentation

- `ApiNotificationDecorators` collects Swagger decorators for endpoints:
  - CreateNotification: POST response 201 + operation summary
  - GetMyNotifications: Requires bearer auth, Query params `limit`, `offset`; example success response with `notifications` and `unreadCount`
  - MarkNotificationAsRead: Param `id`, HTTP 200
  - DeleteNotification: Param `id`, HTTP 200
- Use these decorators on controller methods for consistent docs and examples.

---

## Example Request/Response Shapes

Create notification (request body):
```json
{
  "userId": 123,
  "type": "user_send_request",
  "translations": [
    { "languageCode": "en", "message": "john wants to join your agency." },
    { "languageCode": "al", "message": "john dëshiron të bashkohet me agjencinë tuaj." }
  ],
  "metadata": {
    "username": "john"
  }
}
```

Get notifications (response):
```json
{
  "notifications": [
    {
      "id": 1,
      "userId": 123,
      "type": "user_send_request",
      "status": "unread",
      "translations": [
        { "id": 10, "languageCode": "en", "message": "john wants..." }
      ],
      "createdAt": "2025-12-17T15:47:09.145Z"
    }
  ],
  "unreadCount": 3,
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

Socket notification payload:
```json
{
  "id": 1,
  "type": "user_send_request",
  "status": "unread",
  "translations": [{ "languageCode": "en", "message": "john wants..." }],
  "createdAt": "2025-12-17T15:47:09.145Z"
}
```

---

## Usage Examples

REST (curl):
- Create notification:
  curl -X POST "https://api.example.com/notifications" -H "Content-Type: application/json" -d '{...}'

- Get my notifications:
  curl -X GET "https://api.example.com/notifications?limit=10&offset=0" -H "Authorization: Bearer <token>"

WebSocket (client pseudo):
```js
const socket = io('https://api.example.com/notifications', {
  auth: { token: 'Bearer <jwt>' }, // or send token in headers/handshake
});

socket.on('connect', () => console.log('connected'));
socket.on('connected', data => console.log('server connected', data));
socket.on('notification', data => showNotification(data));
socket.on('unread_count', data => updateUnreadCount(data.count));

socket.emit('subscribe_notifications'); // optional safe re-subscribe
```

---

## Operational Concerns & Best Practices

- Authentication: verify token on connect. Reject unauthorized sockets.
- Rate limiting: apply per-IP or per-account limits to prevent abuse.
- Heartbeat: the gateway/service emits periodic heartbeat events so clients know the connection is alive.
- Room naming: `user:<userId>` rooms are used to target messages per user.
- Offline delivery: always persist notification in DB; if user offline, they receive on next fetch or next connection (no automatic replay currently).
- Bulk updates: use `updateMany` for `markAllAsRead` to avoid N DB calls.
- Unread counters: recompute via repository count and broadcast to socket when relevant events occur (creation, mark-as-read, delete).
- Logging: log errors for DB, socket sends, and auth failures (avoid leaking sensitive info).
- Tests: unit test Service/Repository, integration test DB interactions, and socket connection flows with auth & rate-limiting.
- Internationalization: templates + translation rows for messages. Return localized message strings for client UI.

---

## Module File Structure (example)

```
src/modules/notification/
├─ controllers/
│  ├─ notification.controller.ts
├─ services/
│  ├─ notification.service.ts
│  ├─ notifications-template.service.ts
├─ infrastructure/
│  ├─ gateway/
│  │  └─ notification.gateway.ts
│  ├─ persistence/
│  │  └─ notification.repository.ts
│  ├─ notification-socket.service.ts
│  ├─ websocket/
│  │  ├─ socket-auth.service.ts
│  │  ├─ socket-connection.service.ts
│  │  └─ socket-rate-limit.service.ts
├─ dto/
│  ├─ create-notification.dto.ts
│  ├─ notification-translation.dto.ts
├─ domain/
│  ├─ interfaces/
│  │  └─ notification-events.interface.ts
│  ├─ repository/
│  │  └─ notification.repository.interface.ts
├─ decorators/
│  └─ notification.swagger.decorator.ts
├─ notification.module.ts
```

---

## Error Handling & Observability

- REST errors: return appropriate HTTP status codes + message (controller/service should catch and map to responses).
- Socket errors: emit `error` event to client and disconnect as needed.
- Metrics: record:
  - Notification created (rate)
  - WebSocket connections / disconnections
  - Cache or DB error rates
  - Unread count updates
- Logging: include context (userId, notificationId, type) and stack traces for internal logs.

---

## Recommended Improvements / To-dos

- Add replay mechanism for missed notifications on new connection (e.g., push recent unread items on connect).
- Add pagination metadata (total count) returned by repository to better support client paging.
- Add soft-delete flag in DB and adapt delete endpoint accordingly.
- Add integration tests for socket flows (auth + subscription + emit).
- Add opt-out settings for certain notification types per user.
- Add rate-limits per userId in addition to IP for multi-device abuse protection.


