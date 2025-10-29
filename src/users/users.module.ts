import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';

import { EmailModule } from '../email/email.module';
import { UserService } from './services/users.service';
import { RegistrationService } from './services/RegistrationService';
import { ProfileInfoService } from './services/profile-info.service';
import { UserController } from './controllers/user.controller';
import { UsernameService } from './services/username.service';
import { UsernameHistoryRepository } from '../repositories/usernamehistory/usernamehistory.repository';
import { ProfilePictureService } from './services/profile-picture.service';
import { ProfilePictureController } from './controllers/profile-picture.controller';
@Module({
  controllers:[UserController , ProfilePictureController],
  imports: [EmailModule ],
  providers: [ProfilePictureService,UserService,UsernameService,UserRepository ,UsernameHistoryRepository, RegistrationService , ProfileInfoService],
  exports: [UserRepository , UserService, RegistrationService , RegistrationService],
})
export class UserModule {}