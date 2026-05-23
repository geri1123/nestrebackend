import { Inject, Injectable } from '@nestjs/common';
import {
  REVIEW_REPO,
  IReviewRepository,
} from '../../domain/repositories/review-repository.interface';
import { AgencyReviewsVo } from '../../domain/value-objects/agency-values.vo';

interface GetAgencyReviewsInput {
  agencyId: number;
  page?: number;
}

@Injectable()
export class GetAgencyReviewsUseCase {
  private static readonly PAGE_SIZE = 10;

  constructor(
    @Inject(REVIEW_REPO)
    private readonly reviewRepo: IReviewRepository,
  ) {}

  async execute(input: GetAgencyReviewsInput): Promise<AgencyReviewsVo> {
    const page = Math.max(1, input.page ?? 1);
    const limit = GetAgencyReviewsUseCase.PAGE_SIZE;
    const offset = (page - 1) * limit;

    return this.reviewRepo.findByAgency({
      agencyId: input.agencyId,
      limit,
      offset,
    });
  }
}