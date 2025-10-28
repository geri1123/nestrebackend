import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';

import { EmailModule } from '../email/email.module';
import { UserService } from './users.service';
import { RegistrationService } from './RegistrationService';
import { ProfileInfoService } from './profile-info.service';
import { UserController } from './user.controller';
import { UsernameService } from './username.service';
import { UsernameHistoryRepository } from '../repositories/usernamehistory/usernamehistory.repository';
@Module({
  controllers:[UserController],
  imports: [EmailModule ],
  providers: [UserService,UsernameService,UserRepository ,UsernameHistoryRepository, RegistrationService , ProfileInfoService],
  exports: [UserRepository , UserService, RegistrationService , RegistrationService],
})
export class UserModule {}