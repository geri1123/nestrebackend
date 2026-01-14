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

// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// import { AuthController } from './auth.controller';


// import { EmailModule } from '../../infrastructure/email/email.module';


// import { RegistrationRequestModule } from '../registration-request/registration-request.module';



// import { NotificationModule } from '../notification/notification.module';
// import { AgencyModule } from '../agency/agency.module';

// import { AppConfigModule } from '../../infrastructure/config/config.module';
// import { AgentModule } from '../agent/agent.module';
// import { UsersModule } from '../users/users.module';
// import { AppConfigService } from '../../infrastructure/config/config.service';
// import { AppCacheModule } from '../../infrastructure/cache/cache.module';
// import { RegistrationModule } from '../registration/registration.module';
// import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
// import { LoginUseCase } from './application/use-cases/login.use-case';
// import { SoftAuthService } from '../../common/soft-auth/soft-auth.service';
// import { AuthTokenService } from './infrastructure/services/auth-token.service';
// import { AuthCookieService } from './infrastructure/services/auth-cookie.service';
// import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
// import { GoogleAuthService } from './infrastructure/services/google-auth.service';
// import { SharedAuthModule } from '../../infrastructure/auth/shared-auth.module';


// @Module({
//   imports: [
//     SharedAuthModule,
//     NotificationModule,
//     EmailModule,
//     UsersModule,
//     RegistrationModule,
//     // AppConfigModule,
//     AgencyModule,
//     AgentModule,
//     RegistrationRequestModule,
//     AppCacheModule,

//   ],
//   providers: [
//     GoogleAuthService,
//   GoogleLoginUseCase,
//   RefreshTokenUseCase,
//   LoginUseCase,
//   AuthTokenService,
//  AuthCookieService,
//   ],
//   controllers: [
//     AuthController,
  
   
//   ],
//   exports: [ RefreshTokenUseCase ], 
// })
// export class AuthModule {}
  
//    JwtModule.registerAsync({
//   imports: [AppConfigModule],
//   useFactory: async (configService: AppConfigService) => ({
//     secret: configService.jwtSecret, 
//     signOptions: { expiresIn: '1d' },
//   }),
//   inject: [AppConfigService],
// }),