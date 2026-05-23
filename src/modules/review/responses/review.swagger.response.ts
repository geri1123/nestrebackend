import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiSuccessResponse,
  ApiUnauthorizedResponse as ApiUnauthorizedErrorResponse,
} from '../../../common/swagger/response.helper.ts';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

// 403 Forbidden — nuk e kemi te response.helper, e definojmë lokal
const ApiForbiddenResponse = (exampleMessage: string) =>
  applyDecorators(
    ApiResponse({
      status: 403,
      description: 'Forbidden — business rule violated',
      schema: {
        example: {
          success: false,
          message: exampleMessage,
          errors: {},
        },
      },
    }),
  );

// 404 Not Found
const ApiNotFoundResponse = (exampleMessage: string) =>
  applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Resource not found',
      schema: {
        example: {
          success: false,
          message: exampleMessage,
          errors: {},
        },
      },
    }),
  );

// 409 Conflict
const ApiConflictResponse = (exampleMessage: string) =>
  applyDecorators(
    ApiResponse({
      status: 409,
      description: 'Conflict — resource already exists',
      schema: {
        example: {
          success: false,
          message: exampleMessage,
          errors: {},
        },
      },
    }),
  );

export class ReviewSwagger {
  // ─── POST /reviews ─────────────────────────────────────────────────────────
  static CreateReview() {
    return applyDecorators(
      ApiTags('Reviews'),
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Krijo një review për një agjenci',
        description:
          'User-i autentikuar krijon një review me rating 1-5 dhe një comment opsional. ' +
          'Nuk lejohet të review-osh agjencinë tënde (pronar ose agent).',
      }),
      ApiBody({ type: CreateReviewDto }),
      ApiSuccessResponse('Review created successfully', {
        data: {
          id: 1,
          agencyId: 42,
          rating: 5,
          comment: 'Great service!',
          createdAt: '2026-05-23T10:30:00.000Z',
        },
      }),
      ApiBadRequestResponse('Rating must be an integer between 1 and 5'),
      ApiUnauthorizedErrorResponse(),
      ApiForbiddenResponse('You cannot review an agency you belong to'),
      ApiNotFoundResponse('Agency not found'),
      ApiConflictResponse('You have already reviewed this agency'),
    );
  }

  // ─── PATCH /reviews/:id ────────────────────────────────────────────────────
  static UpdateReview() {
    return applyDecorators(
      ApiTags('Reviews'),
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Përditëso review-in tënd',
        description:
          'Vetëm autori i review-it mund ta editojë. Mund të dërgosh vetëm rating, ' +
          'vetëm comment, ose të dyja. Dërgo `comment: null` për ta fshirë.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Review ID',
        example: 7,
      }),
      ApiBody({ type: UpdateReviewDto }),
      ApiSuccessResponse('Review updated successfully', {
        data: {
          id: 7,
          rating: 4,
          comment: 'Updated my opinion after second visit.',
          updatedAt: '2026-05-23T11:00:00.000Z',
        },
      }),
      ApiBadRequestResponse('Rating must be an integer between 1 and 5'),
      ApiUnauthorizedErrorResponse(),
      ApiForbiddenResponse('You can only edit your own reviews'),
      ApiNotFoundResponse('Review not found'),
    );
  }

  // ─── GET /reviews/agency/:agencyId ─────────────────────────────────────────
  static GetAgencyReviews() {
    return applyDecorators(
      ApiTags('Reviews'),
      ApiOperation({
        summary: 'Merr review-të e një agjencie të paginuara',
        description:
          'Endpoint publik. Kthen 10 review për faqe (madhësia është fikse), ' +
          'plus totalCount, averageRating dhe metadata e paginimit.',
      }),
      ApiParam({
        name: 'agencyId',
        type: Number,
        description: 'Agency ID',
        example: 42,
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Numri i faqes (default 1)',
        example: 1,
      }),
      ApiSuccessResponse('Reviews fetched successfully', {
        data: {
          reviews: [
            {
              id: 1024,
              rating: 5,
              comment: 'Great service!',
              createdAt: '2026-05-20T10:30:00.000Z',
              updatedAt: '2026-05-20T10:30:00.000Z',
              reviewer: {
                id: 88,
                username: 'andi_t',
                firstName: 'Andi',
                lastName: 'Tafa',
                profileImgUrl: 'https://cdn.example.com/u/88.jpg',
              },
            },
          ],
          meta: {
            totalCount: 127,
            averageRating: 4.3,
            currentPage: 1,
            totalPages: 13,
            hasMore: true,
          },
        },
      }),
      ApiNotFoundResponse('Agency not found'),
    );
  }
}