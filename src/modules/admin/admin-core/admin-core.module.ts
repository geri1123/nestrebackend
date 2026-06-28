import { Module } from '@nestjs/common';
import { AdminRepository } from './infrastructure/persistence/admin.repository';
import { ADMIN_REPOSITORY_TOKENS } from './domain/repositories/admin.repository.tokens';
import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ADMIN_REPOSITORY_TOKENS.ADMIN_REPOSITORY,
      useClass: AdminRepository,
    },
  ],
  exports: [ADMIN_REPOSITORY_TOKENS.ADMIN_REPOSITORY], 
})
export class AdminCoreModule {}