import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UsernameDto } from '../dto/username.dto';
import { ApiUnauthorizedResponse,ApiBadRequestResponse ,ApiSuccessResponse} from '../../common/swagger/response.helper.ts';
export class ProfileSwagger {
  static ApiTagsProfile() {
    return applyDecorators(ApiTags('user'));
  }

  static ApiUpdateProfile() {
    return applyDecorators(
      ApiOperation({
        summary: 'Update user profile',
        description:
          'Allows the authenticated user to update profile fields like first name, last name, about me, and phone number.',
      }),
      ApiBody({
        type: UpdateProfileDto,
        description: 'Fields to update in user profile',
        schema: {
          example: {
            firstName: 'John',
            lastName: 'Doe',
            aboutMe: 'Software engineer and NestJS enthusiast.',
            phone: '+355691234567',
          },
        },
      }),
      ApiSuccessResponse(
        'Profile updated successfully',
        { firstName: 'John', lastName: 'Doe', aboutMe: 'Software engineer', phone: '+355691234567' }
      ),
      ApiBadRequestResponse(
        'Validation failed',
        {
          firstName: ['first name is required'],
          lastName: ['last name is required'],
          phone: ['phone length must be between 5 and 20 characters'],
          aboutMe: ['about me length must not exceed 500 characters'],
        }
      ),
      ApiUnauthorizedResponse(),
    );
  }

  static ApiChangeUsername() {
    return applyDecorators(
      ApiOperation({
        summary: 'Change username',
        description:
          'Allows the authenticated user to change their username. The new username must be unique and follow platform rules.',
      }),
      ApiBody({
        type: UsernameDto,
        description: 'New username payload',
        schema: {
          example: {
            username: 'new_usernameexample',
          },
        },
      }),
      ApiSuccessResponse('Username updated successfully', { nextChangeAllowed: '2025-11-07T12:34:56.789Z' }),
      ApiBadRequestResponse('Validation failed', { username: ['TooManyUsernameRequestsError'] }),
      ApiUnauthorizedResponse(),
    );
  }
}
