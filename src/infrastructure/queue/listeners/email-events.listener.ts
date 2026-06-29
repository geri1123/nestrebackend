import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailQueueService } from '../services/email-queue.service';
import {
  EMAIL_EVENTS,
  EmailAgencyMessageEvent,
  EmailAgentRejectedEvent,
  EmailAgentWelcomeEvent,
  EmailContactMessageEvent,
  EmailPasswordResetRequestedEvent,
  EmailPendingApprovalEvent,
  EmailStatusChangeEvent,
  EmailSupportMessageEvent,
  EmailUserMessageEvent,
  EmailVerificationRequestedEvent,
  EmailWelcomeEvent,
} from '../../events/email/email.events';

@Injectable()
export class EmailEventsListener {
  private readonly logger = new Logger(EmailEventsListener.name);

  constructor(private readonly emailQueue: EmailQueueService) {}

  @OnEvent(EMAIL_EVENTS.VERIFICATION_REQUESTED, { async: true })
  async onVerificationRequested(event: EmailVerificationRequestedEvent) {
    try {
      await this.emailQueue.sendVerificationEmail(
        event.email,
        event.name,
        event.token,
        event.lang,
      );
    } catch (err) {
      this.logger.error(
        `Failed to enqueue verification email for ${event.email}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.PASSWORD_RESET_REQUESTED, { async: true })
  async onPasswordResetRequested(event: EmailPasswordResetRequestedEvent) {
    try {
      await this.emailQueue.sendPasswordResetEmail(
        event.email,
        event.name,
        event.token,
        event.lang,
        event.expiresAt,
      );
    } catch (err) {
      this.logger.error(
        `Failed to enqueue password-reset email for ${event.email}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.WELCOME, { async: true })
  async onWelcome(event: EmailWelcomeEvent) {
    try {
      await this.emailQueue.sendWelcomeEmail(event.email, event.name);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue welcome email for ${event.email}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.PENDING_APPROVAL, { async: true })
  async onPendingApproval(event: EmailPendingApprovalEvent) {
    try {
      await this.emailQueue.sendPendingApprovalEmail(event.email, event.name);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue pending-approval email for ${event.email}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.AGENT_WELCOME, { async: true })
  async onAgentWelcome(event: EmailAgentWelcomeEvent) {
    try {
      await this.emailQueue.sendAgentWelcomeEmail(event.email, event.name);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue agent-welcome email for ${event.email}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.AGENT_REJECTED, { async: true })
  async onAgentRejected(event: EmailAgentRejectedEvent) {
    try {
      await this.emailQueue.sendAgentRejectedEmail(event.email, event.name);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue agent-rejected email for ${event.email}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.SUPPORT_MESSAGE, { async: true })
  async onSupportMessage(event: EmailSupportMessageEvent) {
    try {
      await this.emailQueue.sendSupportMessageEmail(event.payload);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue support email from ${event.payload.senderEmail}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.CONTACT_MESSAGE, { async: true })
  async onContactMessage(event: EmailContactMessageEvent) {
    try {
      await this.emailQueue.sendContactMessageEmail(event.payload);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue contact-message email to ${event.payload.recipientEmail}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.AGENCY_MESSAGE, { async: true })
  async onAgencyMessage(event: EmailAgencyMessageEvent) {
    try {
      await this.emailQueue.sendAgencyMessageEmail(event.payload);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue agency-message email to ${event.payload.recipientEmail}`,
        err as Error,
      );
    }
  }

  @OnEvent(EMAIL_EVENTS.USER_MESSAGE, { async: true })
  async onUserMessage(event: EmailUserMessageEvent) {
    try {
      await this.emailQueue.sendMessageToUserEmail(event.payload);
    } catch (err) {
      this.logger.error(
        `Failed to enqueue user-message email to ${event.payload.recipientEmail}`,
        err as Error,
      );
    }
  }
  @OnEvent(EMAIL_EVENTS.STATUS_USER_MESSAGE, {async:true})

  async onStatusChangeMessage(event:EmailStatusChangeEvent){
    try{
      await this.emailQueue.sendStatusChangeEmail(event.payload)
    }catch(err){
      this.logger.error(
        `Failed to enqueue user-message email to ${event.payload.email}`,
        err as Error,
      );
    }
  }
}