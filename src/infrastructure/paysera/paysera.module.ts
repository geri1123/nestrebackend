import { Global, Module } from '@nestjs/common';
import { PayseraService } from './paysera.service';
import { AppConfigModule } from '../config/config.module';
 
@Global()
@Module({
  imports: [AppConfigModule],
  providers: [PayseraService],
  exports: [PayseraService],
})
export class PayseraModule {}
 