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

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullConfig,
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUES.CLEANUP },
      { name: QUEUES.EMAIL },
      { name: QUEUES.PRODUCT_COUNTS },
    ),
    CleanupModule,
    EmailModule,
    // FiltersModule exports CATEGORY_REPO, LISTING_TYPE_REPO and PRODUCT_COUNTS_REPO,
    // which the processor needs for reconciliation and delta application.
    FiltersModule,
  ],
  providers: [
    CleanupProcessor,
    CleanupProducer,
    EmailQueueService,
    EmailProcessor,
    EmailEventsListener,
    ProductCountsProducer,
    ProductCountsProcessor,
  ],
  exports: [CleanupProducer, EmailQueueService, ProductCountsProducer],
})
export class QueueModule {}