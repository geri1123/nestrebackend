import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { AppConfigModule } from '../config/config.module';
import { EmailProvider } from './email.provider';
@Module({
  imports: [AppConfigModule],
  providers: [EmailService , EmailProvider],
  exports: [EmailService],
})
export class EmailModule {}