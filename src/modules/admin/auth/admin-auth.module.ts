import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../../../infrastructure/config/config.module';
import { AppConfigService } from '../../../infrastructure/config/config.service';
import { AdminTokenService } from './services/admin-auth-token.service';
import { AdminAuthCookieService } from './services/admin-cookie.service';
import { AdminAuthController } from './admin-auth.controller';
import { CreateAdminUseCase } from './application/create-admin.use-case';
import { LoginAdmin } from './application/login-admin.use-case';
import { AdminAuthContextService } from './services/admin-auth-context.service';
import { AdminJwtGuard } from './guard/admin-jwt.guard';
import { AdminCoreModule } from '../admin-core/admin-core.module';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.adminJwtSecret,
        signOptions: { expiresIn: '6h' },
      }),
      inject: [AppConfigService],
    }),
    AdminCoreModule,
  ],
  controllers: [AdminAuthController],
  providers: [
    CreateAdminUseCase,
    LoginAdmin,
    AdminAuthContextService,
    AdminJwtGuard,
    AdminTokenService,
    AdminAuthCookieService,
  ],
  exports: [AdminJwtGuard, AdminAuthContextService, AdminTokenService],
})
export class AdminAuthModule {}