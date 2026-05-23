import { Review } from '@prisma/client';
import { ReviewEntity } from '../../domain/entities/review.entity';

export class ReviewMapper {
  static toDomain(row: Review): ReviewEntity {
    return ReviewEntity.fromPersistence({
      id: row.id,
      reviewerUserId: row.reviewerUserId,
      agencyId: row.agencyId,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
