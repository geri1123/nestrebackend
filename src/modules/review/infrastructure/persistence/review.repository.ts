import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ReviewEntity } from '../../domain/entities/review.entity';
import { GetAgencyReviewsParams, IReviewRepository } from '../../domain/repositories/review-repository.interface';
import { ReviewMapper } from '../mappers/review.mapper';
import { ReviewAlreadyExistsError } from '../../domain/errors/review-already-exists.error';
import { AgencyReviewsVo } from '../../domain/value-objects/agency-values.vo';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: ReviewEntity): Promise<ReviewEntity> {
    try {
      const row = await this.prisma.review.create({
        data: {
          reviewerUserId: entity.reviewerUserId,
          agencyId: entity.agencyId,
          rating: entity.rating,
          comment: entity.comment,
        },
      });
      return ReviewMapper.toDomain(row);
    } catch (err) {
      // P2002 = unique constraint violation on (reviewer_user_id, agency_id)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ReviewAlreadyExistsError();
      }
      throw err;
    }
  }
async update(entity: ReviewEntity): Promise<ReviewEntity> {
  const row = await this.prisma.review.update({
    where: { id: entity.id },
    data: {
      rating: entity.rating,
      comment: entity.comment,
    },
  });
  return ReviewMapper.toDomain(row);
}
  async findById(id: number): Promise<ReviewEntity | null> {
    const row = await this.prisma.review.findUnique({ where: { id } });
    return row ? ReviewMapper.toDomain(row) : null;
  }

  async findByReviewerAndAgency(
    reviewerUserId: number,
    agencyId: number,
  ): Promise<ReviewEntity | null> {
    const row = await this.prisma.review.findUnique({
      where: {
        reviewerUserId_agencyId: { reviewerUserId, agencyId },
      },
    });
    return row ? ReviewMapper.toDomain(row) : null;
  }

  async existsByReviewerAndAgency(
    reviewerUserId: number,
    agencyId: number,
  ): Promise<boolean> {
    const count = await this.prisma.review.count({
      where: { reviewerUserId, agencyId },
    });
    return count > 0;
  }
async findByAgency(params: GetAgencyReviewsParams): Promise<AgencyReviewsVo> {
  const limit = params.limit ?? 10;
  const offset = params.offset ?? 0;

  const [rows, totalCount, aggregate] = await Promise.all([
    this.prisma.review.findMany({
      where: { agencyId: params.agencyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImgUrl: true,
          },
        },
      },
    }),
    this.prisma.review.count({ where: { agencyId: params.agencyId } }),
    this.prisma.review.aggregate({
      where: { agencyId: params.agencyId },
      _avg: { rating: true },
    }),
  ]);

  const avg = aggregate._avg.rating;

  return new AgencyReviewsVo(
    rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      reviewer: {
        id: r.reviewer.id,
        username: r.reviewer.username,
        firstName: r.reviewer.firstName,
        lastName: r.reviewer.lastName,
        profileImgUrl: r.reviewer.profileImgUrl,
      },
    })),
    totalCount,
  aggregate._avg.rating,
  limit,
  offset,
  );
}

async getAverageRating(agencyId: number) {
  const [agg, totalReviews] = await this.prisma.$transaction([
    this.prisma.review.aggregate({ where: { agencyId }, _avg: { rating: true } }),
    this.prisma.review.count({ where: { agencyId } }),
  ]);
  return {
     averageRating: agg._avg.rating, 
    totalReviews,
  };
}
}
