import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import {
  ApiSuccessResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse as ApiUnauthorizedErrorResponse,
} from '../../../common/swagger/response.helper.ts';

export class EmailVerificationSwagger {
  // ---------------------------------
  // GET /auth/verify-email
  // ---------------------------------
  static VerifyEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Verify user email using verification token' }),

      ApiQuery({
        name: 'token',
        required: true,
        example: 'abc123def456',
        description: 'Email verification token sent to user email',
      }),

      ApiSuccessResponse('Email verified successfully'),

      ApiBadRequestResponse('Validation failed', {
        token: ['Verification token is required'],
      }),
    );
  }

  // ---------------------------------
  // POST /auth/resend-verification
  // ---------------------------------
  static ResendVerificationEmail() {
    return applyDecorators(
      ApiOperation({ summary: 'Resend verification email' }),

      ApiBody({
        schema: {
          example: {
            identifier: 'user@email.com',
          },
        },
      }),

      ApiSuccessResponse('Verification email resent successfully'),

      ApiBadRequestResponse('Validation failed', {
        identifier: ['Email is required'],
      }),

      ApiUnauthorizedErrorResponse(),
    );
  }
}