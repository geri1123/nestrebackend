import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';

import { EmailModule } from '../email/email.module';
import { UserService } from './users.service';

@Module({
  imports: [EmailModule ],
  providers: [UserService, UserRepository],
  exports: [UserRepository , UserService],
})
export class UserModule {}