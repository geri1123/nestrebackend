import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RegistrationRequestRepository } from './registration-request.repository';
@Module({
  imports: [PrismaModule],
  providers: [RegistrationRequestRepository],
  exports: [RegistrationRequestRepository],
})
export class RegistrationRequestRepositoryModule {}