import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse , ApiBadRequestResponse } from '../../../common/swagger/response.helper.ts.js';
// import { ApiSuccessResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '../../responses.swagger';
import { RegisterAgentDto } from '../../registration/dto/register-agent.dto.js';
import { RegisterAgencyOwnerDto } from '../../registration/dto/register-agency-owner.dto.js';
import { BaseRegistrationDto } from '../../registration/dto/base-registration.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ResendVerificationEmailDto } from '../../email-verification/dto/resend-verification.dto.js';

import { ApiUnauthorizedResponse } from '../../../common/swagger/response.helper.ts.js';
import passport from 'passport';
@ApiTags('Auth')
export class AuthSwagger {
 
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
          username:['Username myst not be emtpy'] ,
          email: ['Email is already registered'],
          password: [
          "Password must not contain spaces.",
"Password must be at least 8 characters long."
        ],
        repeatPassword: [
            "Repeat password must not be empty."
        ],
        first_name: [
            "Name is required."
        ],
        last_name: [
            "Last Name is required"
        ]
        },
      }),
     
    );
  }

  
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
           username:['Username myst not be emtpy'] ,
          email: ['Email is already registered'],
          password: [
          "Password must not contain spaces.",
"Password must be at least 8 characters long."
        ],
        repeatPassword: [
            "Repeat password must not be empty."
        ],
        first_name: [
            "Name is required."
        ],
        last_name: [
            "Last Name is required"
        ],
          license_number: ['License number already exists'],
          address:['Address is required.']
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
             username:['Username myst not be emtpy'] ,
          email: ['Email is already registered'],
          password: [
          "Password must not contain spaces.",
"Password must be at least 8 characters long."
        ],
        repeatPassword: [
            "Repeat password must not be empty."
        ],
        first_name: [
            "Name is required."
        ],
        last_name: [
            "Last Name is required"
        ],
        requested_role:[
          "U must select role agent | senior_agent | team_lead"

        ],
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
          'Allows a user to log in using username/email and password.',
      }),
      ApiBody({ type: LoginDto }),

      ApiSuccessResponse('Login successful', {
        user: {
          id: 38,
          username: 'geri',
          email: 'geri@example.com',
          role: 'user',
        },
      }),
ApiUnauthorizedResponse(    ),


      ApiBadRequestResponse('Validation failed', {
        identifier: ['Email or username is required'],
        password: ['Password is required'],
      }),
    );
  }
 static GoogleLogin() {
  return applyDecorators(
    ApiOperation({
      summary: "Login with Google",
      description:
        "Logs in or registers a user using Google ID token. Sets httpOnly auth cookie.",
    }),

    ApiBody({
      schema: {
        type: "object",
        required: ["idToken"],
        properties: {
          idToken: {
            type: "string",
            example:
              "eyJhbGciOiJSUzI1NiIsImtpZCI6IiIsInR5cCI6IkpXVCJ9...",
            description: "Google ID token from Google Sign-In",
          },
        },
      },
    }),

    ApiSuccessResponse("Google login successful", {
      success: true,
      user: {
        id: 1,
        username: "john_doe",
        email: "john@gmail.com",
        role: "user",
      },
    }),

    

    ApiBadRequestResponse("Validation failed", {
      idToken: ["idToken is required"],
    }),
  );
}
  }

    



//   static VerifyEmail() {
//     return applyDecorators(
//         ApiTags('Auth'), 
//       ApiOperation({
//         summary: 'Verify user email',
//         description: 'Verifies a user email address using the token sent to their email.',
//       }),
//       ApiQuery({
//         name: 'token',
//         required: true,
//         description: 'Verification token sent to user email',
//         type: String,
//         example: 'abc123def456',
//       }),
//       ApiSuccessResponse('Email verified successfully', {
//         success: true,
//         message: 'Email u verifikua me sukses',
//       }),
//       ApiBadRequestResponse('Invalid or expired token', {
//         token: ['Tokeni është i pavlefshëm ose ka skaduar'],
//       }),
//     );
//   }

//   // --------------------------
//   // RESEND VERIFICATION EMAIL
//   // --------------------------
//   static ResendVerification() {
//     return applyDecorators(
//         ApiTags('Auth'), 
//       ApiOperation({
//         summary: 'Resend verification email',
//         description: 'Resends a verification email to a user who has not yet verified their account.',
//       }),
//       ApiBody({
//         type: ResendVerificationEmailDto,
//         description: 'Email or username used to resend verification email',
//       }),
//       ApiSuccessResponse('Verification email resent successfully', {
//         success: true,
//         message: 'Email-i i verifikimit u dërgua përsëri me sukses',
//       }),
//       ApiBadRequestResponse('Email not found or already verified', {
//         identifier: ['Ky email nuk ekziston ose tashmë është verifikuar'],
//       }),
//     );
//   }
// }
