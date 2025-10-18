import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';

import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule , UserRepository],
  providers: [ UserRepository],
  exports: [],
})
export class UserModule {}