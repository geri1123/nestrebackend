import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewEntity } from '../../domain/entities/review.entity';
import {
  REVIEW_REPO,
  type IReviewRepository,
} from '../../domain/repositories/review-repository.interface';
import {
  AGENCY_REPO,
  type IAgencyDomainRepository,
} from '../../../agency/domain/repositories/agency.repository.interface';
import { AGENT_REPOSITORY_TOKENS } from '../../../agent/domain/repositories/agent.repository.tokens';
import type { IAgentDomainRepository } from '../../../agent/domain/repositories/agents.repository.interface';
import { CannotReviewOwnAgencyError } from '../../domain/errors/cannon-review-own-agency.error';
import { InvalidRatingError } from '../../domain/errors/invalid-rating.error';
import { ReviewAlreadyExistsError } from '../../domain/errors/review-already-exists.error';
import { SupportedLang, t } from '../../../../locales';

export interface CreateReviewInput {
  reviewerUserId: number;
  agencyId: number;
  rating: number;
  comment?: string | null;
  language: SupportedLang;
}

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(REVIEW_REPO)
    private readonly reviewRepo: IReviewRepository,
    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(input: CreateReviewInput): Promise<ReviewEntity> {
    const { reviewerUserId, agencyId, rating, comment, language } = input;

    const agency = await this.agencyRepo.findById(agencyId);
    if (!agency) {
      throw new NotFoundException(t('agencyNotFound', language));
    }

   
    const membership = await this.agentRepo.findByAgencyAndAgent(
      agencyId,
      reviewerUserId,
    );
    const reviewerIsAgentOfAgency = membership !== null;

    const alreadyReviewed = await this.reviewRepo.existsByReviewerAndAgency(
      reviewerUserId,
      agencyId,
    );
    if (alreadyReviewed) {
      throw new ConflictException(t('reviewAlreadyExists', language));
    }

    let entity: ReviewEntity;
    try {
      entity = ReviewEntity.create({
        reviewerUserId,
        agencyId,
        rating,
        comment: comment ?? null,
        agencyOwnerUserId: agency.ownerUserId,
        reviewerIsAgentOfAgency,
      });
    } catch (err) {
      if (err instanceof CannotReviewOwnAgencyError) {
        throw new ForbiddenException(t('cannotReviewOwnAgency', language));
      }
      if (err instanceof InvalidRatingError) {
        throw new ForbiddenException(t('invalidRating', language));
      }
      throw err;
    }

    try {
      return await this.reviewRepo.save(entity);
    } catch (err) {
      if (err instanceof ReviewAlreadyExistsError) {
        throw new ConflictException(t('reviewAlreadyExists', language));
      }
      throw err;
    }
  }
}
