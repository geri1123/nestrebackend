

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = {};
    let code: string | undefined = undefined; 

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        errors = responseObj.errors || {};
        code = responseObj.code; 
      } else {
        message = exceptionResponse as string;
      }
    }

    response.status(status).json({
      success: false,
      message,
      ...(Object.keys(errors).length > 0 && { errors }),
      ...(code && { code }), 
    });
  }
}