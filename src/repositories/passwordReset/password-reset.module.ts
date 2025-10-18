

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PasswordResetTokenRepository } from './password-reset.repository';

@Module({
  imports: [PrismaModule],
  providers: [PasswordResetTokenRepository],
  exports: [PasswordResetTokenRepository],
})
export class PasswordResetTokenRepositoryModule {}