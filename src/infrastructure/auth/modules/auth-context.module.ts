import { Module } from '@nestjs/common';
import { SharedAuthModule } from './shared-auth.module';
import { UsersModule } from '../../../modules/users/users.module';
import { AuthContextService } from '../services/auth-context.service';
import { AppCacheModule } from '../../cache/cache.module';

@Module({
  imports: [
    SharedAuthModule,
    UsersModule,
    AppCacheModule,
  ],
  providers: [AuthContextService],
  exports: [AuthContextService],
})
export class AuthContextModule {}