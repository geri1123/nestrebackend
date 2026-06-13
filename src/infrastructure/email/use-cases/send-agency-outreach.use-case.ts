import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { OutreachAgencyDto } from '../dto/outreach.dto';

export interface OutreachResult {
  email: string;
  agencyName: string;
  success: boolean;
  error?: string;
}

export interface OutreachSummary {
  total: number;
  sent: number;
  failed: number;
  results: OutreachResult[];
}

@Injectable()
export class SendAgencyOutreachUseCase {
  private readonly logger = new Logger(SendAgencyOutreachUseCase.name);

  constructor(private readonly emailService: EmailService) {}

  async execute(agencies: OutreachAgencyDto[]): Promise<OutreachSummary> {
    const results: OutreachResult[] = [];

    for (const agency of agencies) {
      try {
        const success = await this.emailService.sendAgencyOutreachEmail(
          agency.email,
          agency.agencyName,
        );

        results.push({ email: agency.email, agencyName: agency.agencyName, success });

        if (!success) {
          this.logger.warn(`Outreach failed (no error thrown) for ${agency.email}`);
        }
      } catch (error) {
       const errorMessage = error instanceof Error ? error.message : String(error);
  this.logger.error(`Outreach error for ${agency.email}: ${errorMessage}`);
  results.push({
    email: agency.email,
    agencyName: agency.agencyName,
    success: false,
    error: errorMessage,
  });
      }

      // Vonesë e vogël mes emaileve për të shmangur rate limiting
      await this.delay(300);
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.length - sent;

    this.logger.log(`Outreach complete: ${sent}/${results.length} sent successfully`);

    return {
      total: results.length,
      sent,
      failed,
      results,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}