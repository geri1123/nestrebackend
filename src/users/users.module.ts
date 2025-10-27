import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';

import { EmailModule } from '../email/email.module';
import { UserService } from './users.service';
import { RegistrationService } from './RegistrationService';
import { ProfileInfoService } from './profile-info.service';
@Module({
  imports: [EmailModule ],
  providers: [UserService, UserRepository , RegistrationService , ProfileInfoService],
  exports: [UserRepository , UserService, RegistrationService],
})
export class UserModule {}