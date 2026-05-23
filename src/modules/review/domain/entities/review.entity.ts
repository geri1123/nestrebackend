import {CannotReviewOwnAgencyError} from '../errors/cannon-review-own-agency.error';
import { InvalidRatingError } from '../errors/invalid-rating.error';

export class ReviewEntity {
  static readonly MIN_RATING = 1;
  static readonly MAX_RATING = 5;
  static readonly MAX_COMMENT_LENGTH = 1000;

  private constructor(
    public readonly id: number,
    public readonly reviewerUserId: number,
    public readonly agencyId: number,
    public rating: number,
    public comment: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  
  static create(params: {
    reviewerUserId: number;
    agencyId: number;
    rating: number;
    comment?: string | null;
    agencyOwnerUserId: number;
    reviewerIsAgentOfAgency: boolean;
  }): ReviewEntity {
    if (params.reviewerUserId === params.agencyOwnerUserId) {
      throw new CannotReviewOwnAgencyError();
    }
    if (params.reviewerIsAgentOfAgency) {
      throw new CannotReviewOwnAgencyError();
    }
    ReviewEntity.assertValidRating(params.rating);

    const now = new Date();
    return new ReviewEntity(
      0,
      params.reviewerUserId,
      params.agencyId,
      params.rating,
      ReviewEntity.normalizeComment(params.comment),
      now,
      now,
    );
  }

  static fromPersistence(props: {
    id: number;
    reviewerUserId: number;
    agencyId: number;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ReviewEntity {
    return new ReviewEntity(
      props.id,
      props.reviewerUserId,
      props.agencyId,
      props.rating,
      props.comment,
      props.createdAt,
      props.updatedAt,
    );
  }

  isAuthoredBy(userId: number): boolean {
    return this.reviewerUserId === userId;
  }

updateContent(params: {
  rating?: number;
  comment?: string | null;
}): void {
  if (params.rating !== undefined) {
    ReviewEntity.assertValidRating(params.rating);
    this.rating = params.rating;
  }
  if (params.comment !== undefined) {
    this.comment = ReviewEntity.normalizeComment(params.comment);
  }
  this.updatedAt = new Date();
}
  private static assertValidRating(rating: number): void {
    if (
      !Number.isInteger(rating) ||
      rating < ReviewEntity.MIN_RATING ||
      rating > ReviewEntity.MAX_RATING
    ) {
      throw new InvalidRatingError(
        ReviewEntity.MIN_RATING,
        ReviewEntity.MAX_RATING,
      );
    }
  }

  private static normalizeComment(comment: string | null | undefined): string | null {
    if (comment === undefined || comment === null) return null;
    const trimmed = comment.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > ReviewEntity.MAX_COMMENT_LENGTH) {
      return trimmed.slice(0, ReviewEntity.MAX_COMMENT_LENGTH);
    }
    return trimmed;
  }
}
