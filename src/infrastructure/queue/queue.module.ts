import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CleanupProcessor } from './processors/cleanup.processor';
import { CleanupProducer } from './producers/cleanup.producer';
import { CleanupModule } from '../../modules/cleanup/cleanup.module';
import { QUEUES } from './constants/queue-names.constant';
import { getBullConfig } from './config/bull.config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullConfig,
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QUEUES.CLEANUP,
    }),
    CleanupModule,
  ],
  providers: [CleanupProcessor, CleanupProducer],
  exports: [CleanupProducer],
})
export class QueueModule {}