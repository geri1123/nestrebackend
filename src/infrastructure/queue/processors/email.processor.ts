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

  async process(job: Job): Promise<any> {
      this.logger.log(`Processing email job: ${job.name} (ID: ${job.id})`);
    switch (job.name) {
      case EMAIL_JOBS.SEND_VERIFICATION:
        return await this.sendVerification(job);
       case EMAIL_JOBS.SEND_PASSWORD_RESET:       
        return await this.sendPasswordReset(job);
      case EMAIL_JOBS.SEND_EMAIL:
        return await this.sendGenericEmail(job);
      default:
        this.logger.warn(`Unknown email job: ${job.name}`);
        return { success: false };
    }
  }

 private async sendVerification(job: Job) {
  const { email, name, token, lang } = job.data;
  this.logger.log(`Sending verification email to ${email}`); 
  try {
    await this.emailService.sendVerificationEmail(email, name, token, lang);
    this.logger.log(`✓ Verification email sent to ${email}`); 
    return { success: true, email };
 } catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  this.logger.error(`✗ Failed to send verification email to ${email}:`, message);
  throw error;
}
}
  private async sendPasswordReset(job: Job) {      
    const { email, name, token, lang, expiresAt } = job.data;
    await this.emailService.sendPasswordRecoveryEmail(
      email,
      name,
      token,
      lang,
      new Date(expiresAt), 
    );
    return { success: true, email };
  }
  
  private async sendGenericEmail(job: Job) {
    const { email, name, type } = job.data;
    if (type === 'welcome') await this.emailService.sendWelcomeEmail(email, name);
    if (type === 'pending') await this.emailService.sendPendingApprovalEmail(email, name);
    if (type==='agent_welcome') await  this.emailService.sendAgentWelcomeEmail(email, name);
     if (type === 'agent_rejected') await this.emailService.sendAgentRejectedEmail(email, name); 
    return { success: true };
  }
@OnWorkerEvent('failed')
onFailed(job: Job, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  this.logger.error(`Email job ${job.id} failed: ${message}`);
}
}