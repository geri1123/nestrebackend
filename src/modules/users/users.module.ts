
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
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { FindUnverifiedUsersUseCase } from './application/use-cases/find-unverified-users.use-case';
// Controllers
import { ProfileController } from './controllers/profile.controller';
import { UpdateUserFieldsUseCase } from './application/use-cases/update-user-fields.use-case';
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
    FindUnverifiedUsersUseCase,
    UpdateUserFieldsUseCase,
    GetUserProfileUseCase,
    GetNavbarUserUseCase,
    UpdateUserProfileUseCase,
    ChangeUsernameUseCase,
    RegisterUserUseCase,
  ],
  exports: [
USERS_REPOSITORY_TOKENS.USER_REPOSITORY, 
    GetUserProfileUseCase,
    RegisterUserUseCase,
  UpdateUserFieldsUseCase,
  FindUnverifiedUsersUseCase,
  ],
})
export class UsersModule {}
