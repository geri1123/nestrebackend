import { Prisma } from '@prisma/client';
import { ReviewEntity } from '../entities/review.entity';
import { AgencyReviewsVo } from '../value-objects/agency-values.vo';

export const REVIEW_REPO = Symbol('REVIEW_REPO');

export interface GetAgencyReviewsParams {
  agencyId: number;
  limit?: number;
  offset?: number;
}

export interface IReviewRepository {
  save(entity: ReviewEntity): Promise<ReviewEntity>;
  findById(id: number): Promise<ReviewEntity | null>;
  findByReviewerAndAgency(reviewerUserId: number, agencyId: number): Promise<ReviewEntity | null>;
  existsByReviewerAndAgency(reviewerUserId: number, agencyId: number): Promise<boolean>;
  update(entity: ReviewEntity): Promise<ReviewEntity>;

 
  findByAgency(params: GetAgencyReviewsParams): Promise<AgencyReviewsVo>;


  getAverageRating(agencyId: number): Promise<{ averageRating: number | null; totalReviews: number }>;
  deleteByUserId(userId: number , tx?:Prisma.TransactionClient): Promise<void>
}
