import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';


export const ApiProfilePictureUpload = () =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Profile picture file to upload',
          },
        },
        required: ['file'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Profile picture uploaded successfully',
      schema: {
        example: {
          success: true,
          message: 'Image uploaded successfully',
          imageUrl: 'https://storage.googleapis.com/bucket/12345_image.jpg',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request — file missing or validation failed',
      schema: {
        example: {
          success: false,
          message: 'No file uploaded',
          errors: {},
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized — invalid or missing token',
      schema: {
        example: {
          success: false,
          message: 'No token provided',
          errors: { token: ['No token provided'] },
        },
      },
    }),
  );

export const ApiProfilePictureDelete = () =>
  applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Profile picture deleted successfully',
      schema: {
        example: {
          success: true,
          message: 'Image successfully deleted',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized — invalid or missing token',
      schema: {
        example: {
          success: false,
          message: 'No token provided',
          errors: { token: ['No token provided'] },
        },
      },
    }),
  );
