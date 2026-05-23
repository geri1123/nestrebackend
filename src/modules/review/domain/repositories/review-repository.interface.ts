import { ReviewEntity } from '../entities/review.entity';
import { AgencyReviewsVo } from '../value-objects/agency-values.vo';

export const REVIEW_REPO = Symbol('REVIEW_REPO');

export interface GetAgencyReviewsParams {
  agencyId: number;
  /** Sa reviews per faqe (default 20, max 50) */
  limit?: number;
  /** Kalo keto shume (offset pagination) */
  offset?: number;
}

export interface IReviewRepository {
  save(entity: ReviewEntity): Promise<ReviewEntity>;
  findById(id: number): Promise<ReviewEntity | null>;
  findByReviewerAndAgency(reviewerUserId: number, agencyId: number): Promise<ReviewEntity | null>;
  existsByReviewerAndAgency(reviewerUserId: number, agencyId: number): Promise<boolean>;
  update(entity: ReviewEntity): Promise<ReviewEntity>;

  /**
   * Merr reviews te paginated per nje agjensi, plus average rating dhe total count.
   * Nuk i ngarkon te gjitha 2000 reviews — vetem faqen e kerkuar.
   */
  findByAgency(params: GetAgencyReviewsParams): Promise<AgencyReviewsVo>;

  /**
   * Vetem average rating + count — query shume e shpejte (SQL AVG).
   * Perdor kete kur duhet vetem statistika, jo komentet.
   */
  getAverageRating(agencyId: number): Promise<{ averageRating: number | null; totalReviews: number }>;
}
