import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CleanupProcessor } from './processors/cleanup.processor';
import { CleanupProducer } from './producers/cleanup.producer';
import { CleanupModule } from '../../modules/cleanup/cleanup.module';
import { QUEUES } from './constants/queue-names.constant';
import { getBullConfig } from './config/bull.config';
import { EmailModule } from '../email/email.module';
import { EmailQueueService } from './services/email-queue.service';
import { EmailProcessor } from './processors/email.processor';
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullConfig,
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {name: QUEUES.CLEANUP},
      {name:QUEUES.EMAIL},
    ),
    CleanupModule,
    EmailModule
  ],
  providers: [CleanupProcessor, CleanupProducer , EmailQueueService ,EmailProcessor ],
  exports: [CleanupProducer , EmailQueueService],
})
export class QueueModule {}