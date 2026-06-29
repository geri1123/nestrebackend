import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { EMAIL_JOBS, QUEUES } from '../constants/queue-names.constant';
import { SupportedLang } from '../../../locales';
import { AgencyMessagePayload, ContactMessagePayload, StatusChangePayload, SupportMessagePayload, UserMessagePayload } from '../payloads/email-payloads.type';


/** Shared retry options for transactional emails. */
const RETRY_OPTS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
};

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(QUEUES.EMAIL) private readonly emailQueue: Queue,
  ) {}

  sendVerificationEmail(
    email: string,
    name: string,
    token: string,
    lang: SupportedLang,
  ) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_VERIFICATION,
      { email, name, token, lang },
      RETRY_OPTS,
    );
  }

  sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
    lang: SupportedLang,
    expiresAt: Date,
  ) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_PASSWORD_RESET,
      { email, name, token, lang, expiresAt },
      RETRY_OPTS,
    );
  }

  sendWelcomeEmail(email: string, name: string) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_WELCOME,
      { email, name },
      RETRY_OPTS,
    );
  }

  sendPendingApprovalEmail(email: string, name: string) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_PENDING_APPROVAL,
      { email, name },
      RETRY_OPTS,
    );
  }

  sendAgentWelcomeEmail(email: string, name: string) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_AGENT_WELCOME,
      { email, name },
      RETRY_OPTS,
    );
  }

  sendAgentRejectedEmail(email: string, name: string) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_AGENT_REJECTED,
      { email, name },
      RETRY_OPTS,
    );
  }

  sendSupportMessageEmail(payload: SupportMessagePayload) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_SUPPORT_EMAIL,
      payload,
      RETRY_OPTS,
    );
  }

  sendContactMessageEmail(payload: ContactMessagePayload) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_CONTACT_MESSAGE,
      payload,
      RETRY_OPTS,
    );
  }

  sendAgencyMessageEmail(payload: AgencyMessagePayload) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_AGENCY_MESSAGE,
      payload,
      RETRY_OPTS,
    );
  }

  sendMessageToUserEmail(payload: UserMessagePayload) {
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_MESSAGE_TO_USER,
      payload,
      RETRY_OPTS,
    );
  }

  sendStatusChangeEmail(payload:StatusChangePayload){
    return this.emailQueue.add(
      EMAIL_JOBS.SEND_USER_STATUS_CHANGED,
      payload,
      RETRY_OPTS
    )
  }
}