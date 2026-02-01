import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EmailModule } from '../../infrastructure/email/email.module';
import { RegistrationRequestModule } from '../registration-request/registration-request.module';
import { NotificationModule } from '../notification/notification.module';
import { AgencyModule } from '../agency/agency.module';
import { AgentModule } from '../agent/agent.module';
import { UsersModule } from '../users/users.module';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
import { RegistrationModule } from '../registration/registration.module';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthCookieService } from './infrastructure/services/auth-cookie.service';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { GoogleAuthService } from './infrastructure/services/google-auth.service';
import { SharedAuthModule } from '../../infrastructure/auth/modules/shared-auth.module';
import { AuthContextModule } from '../../infrastructure/auth/modules/auth-context.module';

@Module({
  imports: [
    SharedAuthModule, 
    NotificationModule,
    EmailModule,
    UsersModule,
    RegistrationModule,
    AgencyModule,
    AgentModule,
    RegistrationRequestModule,
    AppCacheModule,
    AuthContextModule,
  ],
  providers: [
    GoogleAuthService,
    GoogleLoginUseCase,
    RefreshTokenUseCase,
    LoginUseCase,
    
    AuthCookieService,
  ],
  controllers: [AuthController],
  exports: [RefreshTokenUseCase],
})
export class AuthModule {}

