import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

import { AppConfigModule } from '../config/config.module';

@Global() 
@Module({
  imports:[AppConfigModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}