/**
 * Payload shapes for jobs enqueued on the email queue.
 *
 * These are the contracts shared between:
 *   - the domain events (`infrastructure/events/email/email.events.ts`),
 *   - the queue producer (`EmailQueueService`),
 *   - the queue consumer (`EmailProcessor`).
 *
 * Keep field names in sync across all three layers.
 */

export type ContactMessagePayload = {
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  message: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productListingType: string;
  productImage: string;
};

export type AgencyMessagePayload = {
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  message: string;
  agencyName: string;
};

export type UserMessagePayload = {
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  phone: string;
  message: string;
};

export type SupportMessagePayload = {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  message: string;
};