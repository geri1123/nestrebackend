import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_JOBS, QUEUES } from '../constants/queue-names.constant';
import { SupportedLang } from '../../../locales';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(QUEUES.EMAIL) private readonly emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(email: string, name: string) {
    return this.emailQueue.add(EMAIL_JOBS.SEND_EMAIL, { email, name, type: 'welcome' }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendPendingApprovalEmail(email: string, name: string) {
    return this.emailQueue.add(EMAIL_JOBS.SEND_EMAIL, { email, name, type: 'pending' }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string , lang:SupportedLang) {
    return this.emailQueue.add(EMAIL_JOBS.SEND_VERIFICATION, { email, name, token , lang}, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
  async sendPasswordResetEmail(email: string, name: string, token: string, lang: SupportedLang, expiresAt: Date) {
  return this.emailQueue.add(EMAIL_JOBS.SEND_PASSWORD_RESET, {
    email, name, token, lang, expiresAt
  });
}
async sendAgentWelcomeEmail(email: string, name: string) {
  return this.emailQueue.add(EMAIL_JOBS.SEND_EMAIL, { 
    email, name, type: 'agent_welcome' 
  });
}
async sendAgentRejectedEmail(email: string, name: string) {
  return this.emailQueue.add(EMAIL_JOBS.SEND_EMAIL, {
    email, name, type: 'agent_rejected'
  });
}
}