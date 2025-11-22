import { Module } from '@nestjs/common';
import { UserRepository } from '../../repositories/user/user.repository';
import { EmailModule } from '../../infrastructure/email/email.module';
import { UserService } from './services/users.service';
import { RegistrationService } from './services/RegistrationService';
import { ProfileInfoService } from './services/profile-info.service';
import { UserController } from './controllers/user.controller';
import { UsernameService } from './services/username.service';
import { UsernameHistoryRepository } from '../../repositories/usernamehistory/usernamehistory.repository';
import { ProfilePictureService } from './services/profile-picture.service';
import { ProfilePictureController } from './controllers/profile-picture.controller';
import { ImageUtilsService } from '../../common/utils/image-utils.service';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
@Module({
  controllers:[UserController , ProfilePictureController],
  imports: [EmailModule ,AppCacheModule],
  providers: [ProfilePictureService,ImageUtilsService,UserService,UsernameService,UserRepository ,UsernameHistoryRepository, RegistrationService , ProfileInfoService],
  exports: [UserRepository , UserService, RegistrationService , RegistrationService],
})
export class UserModule {}