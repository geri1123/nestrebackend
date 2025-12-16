

import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiConsumes, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { 
  ApiSuccessResponse, 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse,
   
} from '../../../common/swagger/response.helper.ts';

export const ApiProfilePictureUpload = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Upload profile picture' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Profile picture image file (JPG, PNG, WEBP)'
          }
        },
        required: ['file']
      }
    }),
    ApiOkResponse({
      description: 'Image uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Imazhi u ngarkua me sukses.' },
          imageUrl: { type: 'string', example: 'https://your-bucket.s3.amazonaws.com/profile-pictures/123.jpg' }
        }
      }
    }),
    ApiBadRequestResponse('Gabim validimi', {
      file: ['Asnjë imazh nuk u ngarkua', 'Formati i imazhit nuk është i vlefshëm']
    }),
    ApiUnauthorizedResponse(),
  );

export const ApiProfilePictureDelete = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Delete profile picture' }),
    ApiOkResponse({
      description: 'Image deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Imazhi u fshi me sukses.' }
        }
      }
    }),
    ApiBadRequestResponse('Gabim', {
      image: ['Nuk ka imazh për tu fshirë']
    }),
    ApiUnauthorizedResponse(),
  );