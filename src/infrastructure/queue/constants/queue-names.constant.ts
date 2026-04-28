export const QUEUES = {
  CLEANUP: 'system.cleanup',
  EMAIL: 'system.email',
} as const;

export const CLEANUP_JOBS = {
  DELETE_INACTIVE_USERS: 'delete-inactive-users',
  EXPIRE_ADS: 'expire-expired-ads',
} as const;

export const EMAIL_JOBS = {
  SEND_EMAIL: 'send-email',
  SEND_VERIFICATION: 'send-verification',
  SEND_PASSWORD_RESET: 'send-password-reset',
  SEND_CONTACT_MESSAGE: 'send-contact-message',
  SEND_AGENCY_MESSAGE: 'send-agency-message',
  SEND_MESSAGE_TO_USER: 'send-message-to-user',
} as const;