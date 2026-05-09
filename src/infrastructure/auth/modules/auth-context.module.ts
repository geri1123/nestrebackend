import { Module } from '@nestjs/common';
import { SharedAuthModule } from './shared-auth.module';
import { UsersModule } from '../../../modules/users/users.module';
import { AuthContextService } from '../services/auth-context.service';


@Module({
  imports: [
    SharedAuthModule,
    UsersModule,
    
  ],
  providers: [AuthContextService],
  exports: [AuthContextService],
})
export class AuthContextModule {}