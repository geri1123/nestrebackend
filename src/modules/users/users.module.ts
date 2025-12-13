
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { FirebaseModule } from '../../infrastructure/firebase/firebase.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';

// Repositories
import { UserRepository } from './infrastructure/persistence/user.repository';
import { UsernameHistoryRepository } from './infrastructure/persistence/usernamehistory.repository';
import { USERS_REPOSITORY_TOKENS } from './domain/repositories/user.repository.tokens';
// Use Cases
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { GetNavbarUserUseCase } from './application/use-cases/get-navbar-user.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { ChangeUsernameUseCase } from './application/use-cases/change-username.use-case';
import { FindUnverifiedUsersUseCase } from './application/use-cases/find-unverified-users.use-case';
// Controllers
import { ProfileController } from './controllers/profile.controller';
import { UpdateUserFieldsUseCase } from './application/use-cases/update-user-fields.use-case';
import { FindUserByIdentifierUseCase } from './application/use-cases/find-user-by-identifier.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UpdateLastLoginUseCase } from './application/use-cases/update-last-login.use-case';
import { RequestPasswordResetUseCase } from './application/use-cases/password/request-password-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/password/reset-password.use-case';
import { VerifyPasswordResetTokenUseCase } from './application/use-cases/password/verify-password-reset-token.use-case';
import { PasswordController } from './controllers/password-recovery.controller';
import { FindUserForVerificationUseCase } from './application/use-cases/find-user-for-verification.use-case';
import { VerifyUserEmailUseCase } from './application/use-cases/verify-user-email.use-case';
import { FindUserForAuthUseCase } from './application/use-cases/find-user-for-auth.use-case';
import { USER_REPO } from './domain/repositories/user.repository.interface';
import { USERNAME_REPO } from './domain/repositories/username-history.repository.interface';
import { ProfilePictureController } from './controllers/profile-picture.controller';
import { DeleteProfileImageUseCase } from './application/use-cases/delete-profile-image.use-case';
import { UploadProfileImageUseCase } from './application/use-cases/update-profile-image.use-case';
import { CommonModule } from '../../common/common.module';
@Module({
  imports: [ FirebaseModule, EmailModule, AppCacheModule , CommonModule],
  controllers: [ProfileController , PasswordController , ProfilePictureController],
  providers: [
    // Repository providers
    {
      provide: USER_REPO,
      useClass: UserRepository,
    },
    {
      provide:USERNAME_REPO,
      useClass: UsernameHistoryRepository,
    },
    
    // Use Case providers
    FindUnverifiedUsersUseCase,
    UpdateUserFieldsUseCase,
    GetUserProfileUseCase,
    GetNavbarUserUseCase,
    UpdateUserProfileUseCase,
    ChangeUsernameUseCase,
   UploadProfileImageUseCase,
      FindUserByIdentifierUseCase,
  FindUserByIdUseCase,
  UpdateLastLoginUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  VerifyPasswordResetTokenUseCase,
  FindUserForVerificationUseCase,
  VerifyUserEmailUseCase,
  UserRepository,
  FindUserForAuthUseCase,
  DeleteProfileImageUseCase,
  ],
  exports: [
USER_REPO, 
    GetUserProfileUseCase,

  UpdateUserFieldsUseCase,
  FindUnverifiedUsersUseCase,
    FindUserByIdentifierUseCase,
  FindUserByIdUseCase,
  UpdateLastLoginUseCase,
  FindUserForVerificationUseCase,
  VerifyUserEmailUseCase,
  UserRepository,
  FindUserForAuthUseCase, 
  ],
})
export class UsersModule {}
