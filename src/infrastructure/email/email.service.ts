import { Injectable, Logger, Inject } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import { AppConfigService } from '../config/config.service';
import { EMAIL_TRANSPORTER } from './email.provider';
import {
  verificationEmailTemplate,
  welcomeEmailTemplate,
  pendingApprovalEmailTemplate,
  changePasswordTemplate,
  AgentWellcomeEmailTemplate,
  AgentRejectedEmailTemplate,
  passwordRecoveryTemplate,
} from './tamplates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_TRANSPORTER) private readonly transporter: Transporter,
    private readonly configService: AppConfigService,
  ) {}

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const mailOptions = {
      from: `Real Estate Platform <${this.configService.emailUser}>`,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(` Email "${subject}" sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending "${subject}" email to ${to}:`, error);
      return false;
    }
  }

  // EMAIL FUNCTIONS

  async sendVerificationEmail(to: string, name: string, token: string, language = 'al') {
    if (!token?.trim()) throw new Error('Verification token cannot be empty');
    const langSegment = language === 'al' ? '' : `/${language}`;
    // const link = `${this.configService.port}${langSegment}/verify-email?token=${token}`;
    const link = `${this.configService.port}${langSegment}/verify-email?token=${token}`;
    return this.sendEmail(to, 'Verify Your Account', verificationEmailTemplate(name, link));
  }
  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail(to, 'Welcome to Real Estate Platform', welcomeEmailTemplate(name));
  }

  async sendPendingApprovalEmail(to: string, name: string) {
    return this.sendEmail(to, 'Registration Pending Approval', pendingApprovalEmailTemplate(name));
  }

  async sendChangePasswordEmail(to: string, name: string) {
    return this.sendEmail(to, 'Password Change Notification', changePasswordTemplate(name));
  }

  async sendAgentWelcomeEmail(to: string, name: string) {
    return this.sendEmail(to, 'Request Approved', AgentWellcomeEmailTemplate(name));
  }

  async sendRejectionEmail(to: string, name: string) {
    return this.sendEmail(to, 'Request Rejected', AgentRejectedEmailTemplate(name));
  }
async sendAgentRejectedEmail(to: string, name: string) {
  const subject = 'Agent Request Rejected';
  const html = AgentRejectedEmailTemplate(name); 
  return this.sendEmail(to, subject, html);
}
  async sendPasswordRecoveryEmail(
    to: string,
    name: string,
    token: string,
    lang = 'al',
    expiresAt?: Date,
  ) {
    const expiration = expiresAt ?? new Date(Date.now() + 15 * 60 * 1000);
    const resetLink = `${this.configService.clientBaseUrl}${
      lang !== 'al' ? `/${lang}` : ''
    }/recover-password?token=${token}&exp=${expiration.getTime()}`;
    return this.sendEmail(to, 'Password Recovery', passwordRecoveryTemplate(name, resetLink));
  }
}
