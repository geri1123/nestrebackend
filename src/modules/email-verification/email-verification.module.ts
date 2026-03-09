import { Module } from '@nestjs/common';
import { EmailVerificationController } from './controllers/email-verification.controller';

// Use Cases
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.use-case';

// Needed modules
import { UsersModule } from '../users/users.module';
import { AgencyModule } from '../agency/agency.module';
import { RegistrationRequestModule } from '../registration-request/registration-request.module';
import { NotificationModule } from '../notification/notification.module';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [
    UsersModule,
    AgencyModule,
    RegistrationRequestModule,
    NotificationModule,
    AppCacheModule,
    QueueModule,
  ],
  controllers: [EmailVerificationController],
  providers: [
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
  ],
  exports: [
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
  ],
})
export class EmailVerificationModule {}
