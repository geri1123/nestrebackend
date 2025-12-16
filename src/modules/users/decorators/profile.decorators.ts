// profile.decorators.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { 
  ApiSuccessResponse, 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse 
} from '../../../common/swagger/response.helper.ts';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UsernameDto } from '../dto/username.dto';
import { UserProfileResponse } from '../responses/user-profile.response';
import { NavbarProfileResponse } from '../responses/user-nav-response.response';

export const ApiGetUserProfile = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get user profile information' }),
    ApiOkResponse({ 
      type: UserProfileResponse,
      description: 'User profile retrieved successfully' 
    }),
    ApiUnauthorizedResponse()
  );

export const ApiGetNavbarProfile = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get navbar profile data' }),
    ApiOkResponse({ 
      type: NavbarProfileResponse,
      description: 'Navbar profile retrieved successfully' 
    }),
    ApiUnauthorizedResponse()
  );

export const ApiUpdateProfile = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Update user profile' }),
    ApiBody({ type: UpdateProfileDto }),
    ApiSuccessResponse('Profili u përditësua me sukses.'),
    ApiBadRequestResponse('Gabim validimi', {
      firstName: ['Emri duhet të jetë midis 1 dhe 50 karakteresh'],
      lastName: ['Mbiemri duhet të jetë midis 1 dhe 50 karakteresh'],
      aboutMe: ['Përshkrimi duhet të jetë deri në 500 karaktere'],
      phone: ['Numri i telefonit duhet të jetë midis 5 dhe 20 karaktere']
    }),
    ApiUnauthorizedResponse()
  );

export const ApiChangeUsername = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Change username' }),
    ApiBody({ type: UsernameDto }),
    ApiSuccessResponse('Emri i përdoruesit u ndryshua me sukses.'),
    ApiBadRequestResponse('Gabim validimi', {
      username: ['Emri i përdoruesit duhet të jetë midis 4 dhe 30 karakteresh']
    }),
    ApiUnauthorizedResponse()
  );