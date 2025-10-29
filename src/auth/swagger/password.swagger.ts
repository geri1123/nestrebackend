// src/auth/swagger/password.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ApiSuccessResponse, ApiBadRequestResponse } from '../../common/swagger/response.helper.ts';

@ApiTags('Password')
export class PasswordSwagger {
  // --------------------------
  // RESET PASSWORD
  // --------------------------
  static ResetPassword() {
    return applyDecorators(
      ApiOperation({
        summary: 'Reset user password',
        description:
          'Allows a user to reset their password using a valid reset token sent via email.',
      }),
      ApiBody({
        type: ResetPasswordDto,
        description: 'Payload for resetting password',
      }),
      ApiSuccessResponse('Password reset successfully', {
        success: true,
        message: 'Fjalëkalimi u ndryshua me sukses',
      }),
      ApiBadRequestResponse('Invalid token or validation failed', {
       
          token: ['Tokeni është i pavlefshëm ose ka skaduar'],
          newPassword: ['Fjalëkalimi duhet të ketë së paku 8 karaktere'],
          repeatPassword: ['Fjalëkalimet nuk përputhen'],
        
      }),
    );
  }

  // --------------------------
  // FORGOT PASSWORD
  // --------------------------
  static ForgotPassword() {
    return applyDecorators(
      ApiOperation({
        summary: 'Request password reset',
        description:
          'Sends a password reset link/token to the user email to reset password.',
      }),
      ApiBody({
        description: 'User email for password reset',
        schema: {
          example: { email: 'user@example.com' },
        },
      }),
      ApiSuccessResponse('Password reset email sent', {
        success: true,
        message: 'Email-i për ndryshimin e fjalëkalimit u dërgua',
      }),
      ApiBadRequestResponse('Email not found', {
      
          email: ['Ky email nuk ekziston'],
     
      }),
    );
  }
}
