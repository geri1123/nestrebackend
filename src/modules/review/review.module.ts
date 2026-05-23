import { Module } from '@nestjs/common';
import { ReviewController } from './controllers/review.controller';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';
import { ReviewRepository } from './infrastructure/persistence/review.repository';
import { REVIEW_REPO } from './domain/repositories/review-repository.interface';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AgencyModule } from '../agency/agency.module';
import { AgentModule } from '../agent/agent.module';
import { UpdateReviewUseCase } from './application/use-cases/update-review.use-case';
import { GetAgencyReviewsUseCase } from './application/use-cases/get-agency-reviews.use-case';

@Module({
  imports: [
    PrismaModule,
    AgencyModule, 
    AgentModule,  
  ],
  controllers: [ReviewController],
  providers: [
    CreateReviewUseCase,
    UpdateReviewUseCase,
    GetAgencyReviewsUseCase,
    {
      provide: REVIEW_REPO,
      useClass: ReviewRepository,
    },
  ],
  exports: [REVIEW_REPO],
})
export class ReviewModule {}
