### Notification Module

---

### Overview

The Notification module provides a full real-time notification system combining a REST API (for fetching and managing notifications) with a WebSocket gateway (for push delivery). Notifications are stored in the database with multi-language translation support, and delivered instantly to connected clients via Socket.IO. An internal `NotificationService` + template system allows any module to send notifications without knowing about transport details.

---

### Architecture

```
notification/
├── application/
│   └── use-cases/  (inline in NotificationService)
├── domain/
│   ├── interfaces/
│   │   └── notification-events.interface.ts
│   └── repositories/
│       └── notification.repository.interface.ts
├── dto/
│   ├── create-notification.dto.ts
│   └── notification-translation.dto.ts
├── gateway/
│   └── notification.gateway.ts
├── notification.controller.ts
├── notification.service.ts
├── notification-socket.service.ts
├── notifications-template.service.ts
└── notification.module.ts
```

---

### Core Services

---

### NotificationService

The primary interface for other modules to send notifications.

**Method:** `sendNotification(input)` where input contains:
- `userId`: recipient
- `type`: notification type string (e.g. `'user_send_request'`, `'advertisement_expire'`, `'agency_confirm_agent'`)
- `templateData?`: variables to interpolate into templates
- `metadata?`: arbitrary JSON stored with the notification
- `translations?`: override auto-generated translations

**Flow:**
1. If `translations` not provided, uses `NotificationTemplateService` to auto-generate them for all supported languages
2. Creates notification record in DB via `INotificationRepository.createNotification`
3. Emits the new notification to the user's WebSocket room via `NotificationSocketService.sendToUser`

---

### NotificationTemplateService

Generates localized notification messages from templates.

**Templates** are keyed by notification `type`. Each template defines message patterns per language (`al`, `en`, `it`) with `{variable}` placeholders that are replaced from `templateData`.

**Supported notification types:**
- `user_send_request` — user requested to join an agency
- `agency_confirm_agent` — agency approved an agent
- `agent_email_confirmed` — agent confirmed their email
- `advertisement_expire` — an advertisement has expired

---

### NotificationSocketService

Handles real-time delivery to WebSocket clients.

**Method:** `sendToUser(userId, notification)` — emits `notification` event to the room `user:{userId}`. If the user is not connected, the event is silently dropped (notification is still persisted in DB).

---

### INotificationRepository

- `createNotification(data)` → `Promise<any>`: Stores notification + translations
- `getNotifications(params)` → `Promise<any[]>`: Paginated fetch for a user with optional language + status filter
- `countUnread(userId)` → `Promise<number>`
- `countAll(userId)` → `Promise<number>`
- `changeNotificationStatus(notificationId, status)` → marks as read/unread
- `markAllAsReadForUser(userId)` → bulk mark all as read
- `countByStatus(userId, status)` → count by status
- `deleteNotification(notificationId)` → hard delete
- `getNotificationById(notificationId)` → fetch single

---

### WebSocket Gateway

### NotificationGateway

**Namespace:** `/notifications`

**CORS:** Configured from `CORS_ORIGINS` env var (comma-separated), credentials: true.

**Implements:** `OnGatewayInit`, `OnGatewayConnection`, `OnGatewayDisconnect`, `OnModuleDestroy`

**Connection Flow:**
1. `handleConnection(socket)` — authenticates via `SocketAuthService` (reads JWT from cookie or `auth.token`). On success, joins room `user:{userId}`. On failure, disconnects with error.
2. `handleDisconnect(socket)` — removes from `SocketConnectionService` registry

**Server → Client Events:**
- `connected`: `{ message, userId }` — sent on successful connection
- `notification`: `NotificationPayload` — new notification push
- `unread_count`: `{ count }` — updated unread count
- `pong`: `{ timestamp }` — response to client ping
- `error`: `{ message }` — authentication or other errors
- `heartbeat`: `{ timestamp }` — periodic keepalive

**Client → Server Events:**
- `ping` — client keepalive; server responds with `pong`
- `subscribe_notifications` — client re-subscribes (e.g. after reconnect)

**Heartbeat:** A periodic interval (started in `afterInit`) sends `heartbeat` events to all connected clients to keep connections alive through proxies/load balancers.

---

### NotificationPayload Interface

```typescript
interface NotificationPayload {
  id: number;
  userId: number;
  type: string;
  status: string;             // 'read' | 'unread'
  metadata: Record<string, string | number | boolean>;
  readAt: string | null;
  notificationTranslation: { languageCode: string; message: string }[];
  createdAt: Date;
}
```

---

### API Endpoints

---

### POST /notifications

Creates and sends a notification programmatically. Used for testing/admin.

**Authentication:** Required

**Request Body:** `CreateNotificationDto` (`userId`, `type`, `translations[]`)

**Response:** `{ success: true, message: "Notification sent successfully" }`

---

### GET /notifications/me

Returns paginated notifications for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `limit` (default: 10)
- `offset` (default: 0)

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "userId": 2,
      "type": "user_send_request",
      "status": "unread",
      "metadata": { "username": "andi_t" },
      "readAt": null,
      "createdAt": "2025-12-17T15:47:09.145Z",
      "notificationtranslation": [
        { "id": 1, "notificationId": 1, "languageCode": "al", "message": "andi_t kërkon të bashkohet me agjencinë tuaj." }
      ]
    }
  ],
  "unreadCount": 1,
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

### PATCH /notifications/:id/read

Marks a notification as read.

**Authentication:** Required

**Path Parameter:** `id` — Notification ID

**Response:** `{ success: true, message: "Notification marked as read" }`

---

### DELETE /notifications/:id

Deletes a notification.

**Authentication:** Required

**Path Parameter:** `id` — Notification ID

**Response:** `{ success: true, message: "Notification deleted successfully" }`

---

### Database Schema

**Notification table:** `id`, `userId` (FK), `type`, `status` (enum: `read | unread`), `metadata` (JSON), `readAt` (nullable timestamp), `createdAt`

**NotificationTranslation table:** `id`, `notificationId` (FK), `languageCode` (enum), `message`

---

### Module Exports

`NotificationService`, `NotificationTemplateService`, `NotificationSocketService` — exported for use by any module that needs to send notifications (e.g. `AgencyRequestsModule`, `AdvertiseProductModule`, `EmailVerificationModule`)

---

### Future Considerations

- Notification preferences per user (opt-out per type)
- Push notifications (Firebase FCM for mobile)
- Notification batching/digest emails
- Expiry/auto-deletion of old notifications
- Admin broadcast notifications