import { Module } from '@nestjs/common';
import { OutreachController } from './outreach.controller';
import { SendAgencyOutreachUseCase } from './send-agency-outreach.use-case';
import { EmailModule } from '../../../infrastructure/email/email.module';
import { AdminAuthModule } from '../auth/admin-auth.module';

@Module({
  imports: [EmailModule , AdminAuthModule],
  controllers: [OutreachController],
  providers: [SendAgencyOutreachUseCase],
})
export class OutreachModule {}