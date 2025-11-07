import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse , ApiBadRequestResponse } from '../../../common/swagger/response.helper.ts.js';
// import { ApiSuccessResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '../../responses.swagger';
import { RegisterAgentDto } from '../dto/register-agent.dto.js';
import { RegisterAgencyOwnerDto } from '../dto/register-agency-owner.dto.js';
import { BaseRegistrationDto } from '../dto/base-registration.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ResendVerificationEmailDto } from '../dto/resend-verification.dto.js';
@ApiTags('Auth')
export class AuthSwagger {
  // 🧩 User Registration
  static RegisterUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Register a new user account' }),
      ApiBody({ type: BaseRegistrationDto }),
      ApiSuccessResponse('User registered successfully', {
        data: {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com',
        },
      }),
      ApiBadRequestResponse('Registration failed due to invalid input', {
        errors: {
          email: ['Email is already registered'],
        },
      }),
     
    );
  }

  // 🏢 Agency Owner Registration
  static RegisterAgencyOwner() {
    return applyDecorators(
      ApiOperation({ summary: 'Register a new agency owner account' }),
      ApiBody({ type: RegisterAgencyOwnerDto }),
      ApiSuccessResponse('Agency owner registered successfully', {
        data: {
          id: 5,
          username: 'owner123',
          agency_name: 'DreamHomes Agency',
        },
      }),
      ApiBadRequestResponse('Invalid registration data', {
        errors: {
          license_number: ['License number already exists'],
        },
      }),
      
    );
  }


  static RegisterAgent() {
    return applyDecorators(
      ApiOperation({ summary: 'Register a new agent account' }),
      ApiBody({ type: RegisterAgentDto }),
      ApiSuccessResponse('Agent registered successfully', {
        data: {
          id: 12,
          username: 'agent007',
          requested_role: 'agent',
        },
      }),
      ApiBadRequestResponse('Invalid agent registration data', {
        errors: {
          public_code: ['Invalid or expired public code'],
        },
      }),
    
    );
  }
    static Login() {
    return applyDecorators(
      ApiOperation({
        summary: 'Login user',
        description:
          'Allows a user (normal, agent, or agency owner) to log in using username/email and password.',
      }),
      ApiBody({
        type: LoginDto,
        description: 'Login credentials with optional rememberMe flag',
      }),
       ApiSuccessResponse('Login successful', {
      success: true,
      message: 'Hyrja ishte e suksesshme',
      user: {
        id: 38,
        username: 'geri',
        email: 'Anabiya.Waldron@HorizonsPost.com',
        role: 'user',
      },
    }),
      ApiBadRequestResponse('Invalid credentials', {
        errors: {
          identifier: ['Invalid username or email'],
          password: ['Incorrect password'],
        },
      }),

    );
  }


  static VerifyEmail() {
    return applyDecorators(
        ApiTags('Auth'), 
      ApiOperation({
        summary: 'Verify user email',
        description: 'Verifies a user email address using the token sent to their email.',
      }),
      ApiQuery({
        name: 'token',
        required: true,
        description: 'Verification token sent to user email',
        type: String,
        example: 'abc123def456',
      }),
      ApiSuccessResponse('Email verified successfully', {
        success: true,
        message: 'Email u verifikua me sukses',
      }),
      ApiBadRequestResponse('Invalid or expired token', {
        token: ['Tokeni është i pavlefshëm ose ka skaduar'],
      }),
    );
  }

  // --------------------------
  // RESEND VERIFICATION EMAIL
  // --------------------------
  static ResendVerification() {
    return applyDecorators(
        ApiTags('Auth'), 
      ApiOperation({
        summary: 'Resend verification email',
        description: 'Resends a verification email to a user who has not yet verified their account.',
      }),
      ApiBody({
        type: ResendVerificationEmailDto,
        description: 'Email or username used to resend verification email',
      }),
      ApiSuccessResponse('Verification email resent successfully', {
        success: true,
        message: 'Email-i i verifikimit u dërgua përsëri me sukses',
      }),
      ApiBadRequestResponse('Email not found or already verified', {
        identifier: ['Ky email nuk ekziston ose tashmë është verifikuar'],
      }),
    );
  }
}
