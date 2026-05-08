import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../../../infrastructure/email/email.service';
import { EMAIL_JOBS, QUEUES } from '../constants/queue-names.constant';

@Processor(QUEUES.EMAIL, { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<{ success: boolean; email?: string }> {
    this.logger.log(`Processing email job: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case EMAIL_JOBS.SEND_VERIFICATION:
        return this.sendVerification(job);
      case EMAIL_JOBS.SEND_PASSWORD_RESET:
        return this.sendPasswordReset(job);
      case EMAIL_JOBS.SEND_WELCOME:
        return this.sendWelcome(job);
      case EMAIL_JOBS.SEND_PENDING_APPROVAL:
        return this.sendPendingApproval(job);
      case EMAIL_JOBS.SEND_AGENT_WELCOME:
        return this.sendAgentWelcome(job);
      case EMAIL_JOBS.SEND_AGENT_REJECTED:
        return this.sendAgentRejected(job);
      case EMAIL_JOBS.SEND_CONTACT_MESSAGE:
        return this.sendContactMessage(job);
      case EMAIL_JOBS.SEND_AGENCY_MESSAGE:
        return this.sendAgencyMessage(job);
      case EMAIL_JOBS.SEND_MESSAGE_TO_USER:
        return this.sendMessageToUser(job);
      default:
        this.logger.warn(`Unknown email job: ${job.name}`);
        return { success: false };
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  private async sendVerification(job: Job) {
    const { email, name, token, lang } = job.data;
    await this.emailService.sendVerificationEmail(email, name, token, lang);
    return { success: true, email };
  }

  private async sendPasswordReset(job: Job) {
    const { email, name, token, lang, expiresAt } = job.data;
    await this.emailService.sendPasswordRecoveryEmail(
      email, name, token, lang, new Date(expiresAt),
    );
    return { success: true, email };
  }

  private async sendWelcome(job: Job) {
    const { email, name } = job.data;
    await this.emailService.sendWelcomeEmail(email, name);
    return { success: true, email };
  }

  private async sendPendingApproval(job: Job) {
    const { email, name } = job.data;
    await this.emailService.sendPendingApprovalEmail(email, name);
    return { success: true, email };
  }

  private async sendAgentWelcome(job: Job) {
    const { email, name } = job.data;
    await this.emailService.sendAgentWelcomeEmail(email, name);
    return { success: true, email };
  }

  private async sendAgentRejected(job: Job) {
    const { email, name } = job.data;
    await this.emailService.sendAgentRejectedEmail(email, name);
    return { success: true, email };
  }

  private async sendContactMessage(job: Job) {
    await this.emailService.sendContactMessageEmail(job.data);
    return { success: true };
  }

  private async sendAgencyMessage(job: Job) {
    await this.emailService.sendAgencyMessageEmail(job.data);
    return { success: true };
  }

  private async sendMessageToUser(job: Job) {
    await this.emailService.sendMessageToUserEmail(job.data);
    return { success: true };
  }

  // ── Worker events ────────────────────────────────────────────────────────────

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`✓ Job ${job.id} (${job.name}) completed`, result);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `✗ Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}