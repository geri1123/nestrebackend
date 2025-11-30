
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { FirebaseModule } from '../../infrastructure/firebase/firebase.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';

// Repositories
import { UserRepository } from '../../repositories/user/user.repository';
import { UsernameHistoryRepository } from '../../repositories/usernamehistory/usernamehistory.repository';
import {type  IUserDomainRepository } from './domain/repositories/user.repository.interface';
import {type IUsernameHistoryDomainRepository } from './domain/repositories/username-history.repository.interface';
import { USERS_REPOSITORY_TOKENS } from './domain/repositories/user.repository.tokens';
// Use Cases
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { GetNavbarUserUseCase } from './application/use-cases/get-navbar-user.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { ChangeUsernameUseCase } from './application/use-cases/change-username.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';

// Controllers
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports: [PrismaModule, FirebaseModule, EmailModule, AppCacheModule],
  controllers: [ProfileController],
  providers: [
    // Repository providers
    {
      provide: USERS_REPOSITORY_TOKENS.USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USERS_REPOSITORY_TOKENS.USERNAME_HISTORY_REPOSITORY,
      useClass: UsernameHistoryRepository,
    },
    
    // Use Case providers
    GetUserProfileUseCase,
    GetNavbarUserUseCase,
    UpdateUserProfileUseCase,
    ChangeUsernameUseCase,
    RegisterUserUseCase,
  ],
  exports: [

    GetUserProfileUseCase,
    RegisterUserUseCase,
  
  ],
})
export class UsersModule {}
// import { Module } from '@nestjs/common';
// import { UserRepository } from '../../repositories/user/user.repository';
// import { EmailModule } from '../../infrastructure/email/email.module';
// import { UserService } from './services/users.service';
// import { RegistrationService } from './services/RegistrationService';
// import { ProfileInfoService } from './services/profile-info.service';
// import { UserController } from './controllers/profile.controller';
// import { UsernameService } from './services/username.service';
// import { UsernameHistoryRepository } from '../../repositories/usernamehistory/usernamehistory.repository';
// import { ProfilePictureService } from './services/profile-picture.service';
// import { ProfilePictureController } from './controllers/profile-picture.controller';
// import { ImageUtilsService } from '../../common/utils/image-utils.service';
// import { AppCacheModule } from '../../infrastructure/cache/cache.module';
// @Module({
//   controllers:[UserController , ProfilePictureController],
//   imports: [EmailModule ,AppCacheModule],
//   providers: [ProfilePictureService,ImageUtilsService,UserService,UsernameService,UserRepository ,UsernameHistoryRepository, RegistrationService , ProfileInfoService],
//   exports: [UserRepository , UserService, RegistrationService , RegistrationService],
// })
// export class UserModule {}