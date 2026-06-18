import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminUserModule } from './users/admin-user.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  
  imports: [
    QueueModule,
    AdminAuthModule,
    AdminUserModule,
    
  ],
  
})
export class AdminModule {}