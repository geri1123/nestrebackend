import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminUserModule } from './users/admin-user.module';

@Module({
  imports: [
    AdminAuthModule,
    AdminUserModule,
  ],
})
export class AdminModule {}