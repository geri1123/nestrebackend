import { Module } from '@nestjs/common';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';

// Repositories
import { UserRepository } from './infrastructure/persistence/user.repository';
import { UsernameHistoryRepository } from './infrastructure/persistence/usernamehistory.repository';

// Use Cases
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { GetNavbarUserUseCase } from './application/use-cases/get-navbar-user.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { ChangeUsernameUseCase } from './application/use-cases/change-username.use-case';
import { FindUnverifiedUsersUseCase } from './application/use-cases/find-unverified-users.use-case';
import { UpdateUserFieldsUseCase } from './application/use-cases/update-user-fields.use-case';
import { FindUserByIdentifierUseCase } from './application/use-cases/find-user-by-identifier.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UpdateLastLoginUseCase } from './application/use-cases/update-last-login.use-case';
import { RequestPasswordResetUseCase } from './application/use-cases/password/request-password-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/password/reset-password.use-case';
import { VerifyPasswordResetTokenUseCase } from './application/use-cases/password/verify-password-reset-token.use-case';
import { FindUserForVerificationUseCase } from './application/use-cases/find-user-for-verification.use-case';
import { VerifyUserEmailUseCase } from './application/use-cases/verify-user-email.use-case';
import { FindUserForAuthUseCase } from './application/use-cases/find-user-for-auth.use-case';
import { DeleteProfileImageUseCase } from './application/use-cases/delete-profile-image.use-case';
import { UploadProfileImageUseCase } from './application/use-cases/update-profile-image.use-case';
import { ChangePasswordUseCase } from './application/use-cases/password/change-password.use-case';

// Controllers
import { ProfileController } from './controllers/profile.controller';
import { PasswordController } from './controllers/password-recovery.controller';
import { ProfilePictureController } from './controllers/profile-picture.controller';

// Tokens & other
import { USER_REPO } from './domain/repositories/user.repository.interface';
import { USERNAME_REPO } from './domain/repositories/username-history.repository.interface';
import { CommonModule } from '../../common/common.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { UserCacheInvalidationListener } from './application/listeners/user-cache-invalidation.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';

// NOTE: AGENT_PROFILE_PORT and AGENCY_OWNER_PROFILE_PORT are provided by
// AgencyContextModule (@Global), so they are available without importing here.
// AgencyContextModule is imported by GuardsModule which is global.

@Module({
  imports: [AppCacheModule, CommonModule, CloudinaryModule],
  controllers: [ProfileController, PasswordController, ProfilePictureController],
  providers: [
    { provide: USER_REPO, useClass: UserRepository },
    { provide: USERNAME_REPO, useClass: UsernameHistoryRepository },
    EventEmitterModule,
    ChangePasswordUseCase,
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
    UserCacheInvalidationListener,
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