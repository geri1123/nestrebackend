// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { ImageUtilsService } from './utils/image-utils.service';
import { SoftAuthService } from './soft-auth/soft-auth.service';
import { SharedAuthModule } from '../infrastructure/auth/shared-auth.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
 
  providers: [ImageUtilsService  ],
  exports: [ImageUtilsService  ], 
})
export class CommonModule {}