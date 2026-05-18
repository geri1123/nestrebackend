import { Global, Module } from '@nestjs/common';
import { WhopService } from './whop.service';
import { AppConfigModule } from '../config/config.module';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [WhopService],
  exports: [WhopService],
})
export class WhopModule {}