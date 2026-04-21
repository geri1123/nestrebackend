// import { Socket } from "socket.io";

// export interface NotificationPayload {
//   id: number;
//   type: string;
//   status: string;
//   notificationTranslation: { languageCode: string; message: string }[]; 
//     createdAt: Date;
// }

// export interface ServerToClientEvents {
//   connected: (data: { message: string; userId: number }) => void;
//   notification: (data: NotificationPayload) => void;
//   unread_count: (data: { count: number }) => void;
//   pong: (data: { timestamp: number }) => void;
//   error: (data: { message: string }) => void;
//   heartbeat: (data: { timestamp: number }) => void;
// }

// export interface ClientToServerEvents {
//   ping: () => void;
//   subscribe_notifications: () => void;
// }

// export interface AuthenticatedSocket extends Socket {
//   userId?: number;
// }

import { Socket } from "socket.io";

export interface NotificationPayload {
  id: number;
  userId: number;
  type: string;
  status: string;
  metadata: Record<string, string | number | boolean>;
  readAt: string | null;
  notificationTranslation: { languageCode: string; message: string }[];
  createdAt: Date;
}

export interface ServerToClientEvents {
  connected: (data: { message: string; userId: number }) => void;
  notification: (data: NotificationPayload) => void;
  unread_count: (data: { count: number }) => void;
  pong: (data: { timestamp: number }) => void;
  error: (data: { message: string }) => void;
  heartbeat: (data: { timestamp: number }) => void;
}

export interface ClientToServerEvents {
  ping: () => void;
  subscribe_notifications: () => void;
}

export interface AuthenticatedSocket extends Socket {
  userId?: number;
}