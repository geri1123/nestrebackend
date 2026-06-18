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
import { EmailEventsListener } from './listeners/email-events.listener';
import { ProductCountsProducer } from './producers/product-counts.producer';
import { ProductCountsProcessor } from './processors/product-counts.processor';
import { FiltersModule } from '../../modules/filters/filters.module';
// import { QueueAdminController } from './queue-admin.controller';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullConfig,
      inject: [ConfigService],
    }),
    // BullModule.registerQueue(
    //   { name: QUEUES.CLEANUP },
    //   { name: QUEUES.EMAIL },
    //   { name: QUEUES.PRODUCT_COUNTS },
    // ),
 BullModule.registerQueue(
  { 
    name: QUEUES.CLEANUP,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 20,
      attempts: 1,        
      backoff: { type: 'exponential', delay: 5000 }
    }
  },
  { 
    name: QUEUES.EMAIL,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 10, 
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
  },
  { 
    name: QUEUES.PRODUCT_COUNTS,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 20,
      attempts: 3,       
      backoff: { type: 'exponential', delay: 3000 }
    }
  },
),
    CleanupModule,
    EmailModule,
    // FiltersModule exports CATEGORY_REPO, LISTING_TYPE_REPO and PRODUCT_COUNTS_REPO,
    // which the processor needs for reconciliation and delta application.
    FiltersModule,
  ],
  // controllers:[QueueAdminController],
  providers: [
    CleanupProcessor,
    CleanupProducer,
    EmailQueueService,
    EmailProcessor,
    EmailEventsListener,
    ProductCountsProducer,
    ProductCountsProcessor,
  ],
  exports: [CleanupProducer, EmailQueueService, ProductCountsProducer ],
})
export class QueueModule {}