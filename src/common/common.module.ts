// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { ImageUtilsService } from './utils/image-utils.service';

@Module({
  providers: [ImageUtilsService],
  exports: [ImageUtilsService], 
})
export class CommonModule {}