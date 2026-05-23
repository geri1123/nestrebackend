// application/use-cases/update-review.use-case.ts
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REVIEW_REPO, type IReviewRepository    } from '../../domain/repositories/review-repository.interface';
import { InvalidRatingError } from '../../domain/errors/invalid-rating.error';
import { NotReviewAuthorError } from '../../domain/errors/not-review-author.error';
import { ReviewEntity } from '../../domain/entities/review.entity';
import { SupportedLang, t } from '../../../../locales';

export interface UpdateReviewInput {
  reviewId: number;
  reviewerUserId: number;
  rating?: number;
  comment?: string | null;
  language: SupportedLang;
}

@Injectable()
export class UpdateReviewUseCase {
  constructor(
    @Inject(REVIEW_REPO)
    private readonly reviewRepo: IReviewRepository,
  ) {}

  async execute(input: UpdateReviewInput): Promise<ReviewEntity> {
    const { reviewId, reviewerUserId, rating, comment, language } = input;

    const review = await this.reviewRepo.findById(reviewId);
    if (!review) {
      throw new NotFoundException(t('reviewNotFound', language));
    }

    if (!review.isAuthoredBy(reviewerUserId)) {
      throw new ForbiddenException(t('notReviewAuthor', language));
    }

    try {
      review.updateContent({ rating, comment });
    } catch (err) {
      if (err instanceof InvalidRatingError) {
        throw new ForbiddenException(t('invalidRating', language));
      }
      throw err;
    }

    // 4. Persiste
    return this.reviewRepo.update(review);
  }
}