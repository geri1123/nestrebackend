import { Module } from '@nestjs/common';
import { OutreachController } from './outreach.controller';
import { SendAgencyOutreachUseCase } from './use-cases/send-agency-outreach.use-case';
import { EmailModule } from '../../infrastructure/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [OutreachController],
  providers: [SendAgencyOutreachUseCase],
})
export class OutreachModule {}