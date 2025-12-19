import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

// 401 Unauthorized
export const ApiUnauthorizedResponse = () =>
  applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized — missing or invalid token',
      schema: {
        example: {
          success: false,
          message: 'Asnjë token nuk u sigurua',
          errors: {
            token: ['Asnjë token nuk u sigurua'],
          },
        },
      },
    }),
  );

// 400 Bad Request
export const ApiBadRequestResponse = (exampleMessage: string, errorsExample?: object) =>
  applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Validation or business logic error',
      schema: {
        example: {
          success: false,
          message: exampleMessage,
          errors: errorsExample ?? {},
        },
      },
    }),
  );

export const ApiSuccessResponse = (exampleMessage: string, dataExample?: object) =>
  applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Successful operation',
      schema: {
        example: {
          success: true,
          message: exampleMessage,
          ...(dataExample ?? {}),  
        },
      },
    }),
  );