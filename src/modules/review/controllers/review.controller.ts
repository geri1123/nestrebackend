import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { CreateReviewUseCase } from '../application/use-cases/create-review.use-case';
import { CreateReviewDto } from '../dto/create-review.dto';
import { t } from '../../../locales';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { UpdateReviewUseCase } from '../application/use-cases/update-review.use-case';
import { GetAgencyReviewsUseCase } from '../application/use-cases/get-agency-reviews.use-case';
import { GetAgencyReviewsQueryDto } from '../dto/get-agency-reviews.dto';
import { ReviewSwagger } from '../responses/review.swagger.response';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly getAgencyReviewsUseCase: GetAgencyReviewsUseCase,
  ) {}

  // ─── POST /reviews ────────────────────────────────────────────────────────
  @ReviewSwagger.CreateReview()
  @Post()
  async createReview(@Body() dto: CreateReviewDto, @Req() req: RequestWithUser) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const review = await this.createReviewUseCase.execute({
      reviewerUserId: userId,
      agencyId: dto.agencyId,
      rating: dto.rating,
      comment: dto.comment,
      language,
    });

    return {
      success: true,
      message: t('reviewCreatedSuccessfully', language),
      data: {
        id: review.id,
        agencyId: review.agencyId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    };
  }

  // ─── PATCH /reviews/:id ──────────────────────────────────────────────────
  @ReviewSwagger.UpdateReview()
  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const updated = await this.updateReviewUseCase.execute({
      reviewId: Number(id),
      reviewerUserId: userId,
      rating: dto.rating,
      comment: dto.comment,
      language,
    });

    return {
      success: true,
      message: t('reviewUpdatedSuccessfully', language),
      data: {
        id: updated.id,
        rating: updated.rating,
        comment: updated.comment,
        updatedAt: updated.updatedAt,
      },
    };
  }

  // ─── GET /reviews/agency/:agencyId ────────────────────────────────────────
  @ReviewSwagger.GetAgencyReviews()
  @Public()
  @Get('agency/:agencyId')
  async getAgencyReviews(
    @Param('agencyId', ParseIntPipe) agencyId: number,
    @Query() query: GetAgencyReviewsQueryDto,
  ) {
    const result = await this.getAgencyReviewsUseCase.execute({
      agencyId,
      page: query.page,
    });

    return {
      success: true,
      data: {
        reviews: result.reviews,
        meta: {
          totalCount: result.totalCount,
          averageRating: result.averageRating,
          currentPage: Math.floor(result.offset / result.limit) + 1,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      },
    };
  }
}