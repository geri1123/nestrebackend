

import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { 
  ApiSuccessResponse, 
  ApiBadRequestResponse 
} from '../../../common/swagger/response.helper.ts';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { RecoverPasswordDto } from '../dto/recover-password.dto';

export const ApiResetPassword = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Reset password using token' }),
    ApiBody({ type: ResetPasswordDto }),
    ApiSuccessResponse('Fjalëkalimi u rivendos me sukses.'),
    ApiBadRequestResponse('Gabim validimi', {
      token: ['Token i pavlefshëm ose i skaduar'],
      newPassword: ['Fjalëkalimi duhet të jetë të paktën 8 karaktere'],
      repeatPassword: ['Fjalëkalimet nuk përputhen']
    })
  );

export const ApiForgotPassword = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Request password reset link' }),
    ApiBody({ type: RecoverPasswordDto }),
    ApiSuccessResponse('Linku për rivendosjen e fjalëkalimit u dërgua me email.'),
    ApiBadRequestResponse('Përdoruesi nuk u gjet.', {
      email: ['Email i pavlefshëm']
    })
  );