export const QUEUES = {
  CLEANUP: 'system.cleanup',
  EMAIL: 'system.email',
   PRODUCT_COUNTS: 'product.counts',
} as const;

export const CLEANUP_JOBS = {
  DELETE_INACTIVE_USERS: 'delete-inactive-users',
  EXPIRE_ADS: 'expire-expired-ads',
} as const;


export const EMAIL_JOBS = {
  SEND_VERIFICATION:      'send-verification',
  SEND_PASSWORD_RESET:    'send-password-reset',
  SEND_WELCOME:           'send-welcome',
  SEND_PENDING_APPROVAL:  'send-pending-approval',
  SEND_AGENT_WELCOME:     'send-agent-welcome',
  SEND_AGENT_REJECTED:    'send-agent-rejected',
  SEND_SUPPORT_EMAIL:     'send-support-email',
  SEND_CONTACT_MESSAGE:   'send-contact-message',
  SEND_AGENCY_MESSAGE:    'send-agency-message',
  SEND_MESSAGE_TO_USER:   'send-message-to-user',
   SEND_USER_STATUS_CHANGED: 'send-user-status-changed',
} as const;

export const PRODUCT_COUNTS_JOBS = {
  CREATED: 'product-created',
  STATUS_CHANGED: 'product-status-changed',
  DELETED: 'product-deleted',
  RECONCILE: 'reconcile-counts',
} as const;
 