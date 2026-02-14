import {
  Controller,
  Patch,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException,
} from '@nestjs/common';


import { ChangeUsernameUseCase } from '../application/use-cases/change-username.use-case';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UsernameDto } from '../dto/username.dto';
import {  t } from '../../../locales';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../common/helpers/validation.helper';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { GetNavbarUserUseCase } from '../application/use-cases/get-navbar-user.use-case';
import { UpdateUserProfileUseCase } from '../application/use-cases/update-user-profile.use-case';
import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.use-case';
import { UserProfileResponse } from '../responses/user-profile.response';
import {  ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { NavbarProfileResponse } from '../responses/user-nav-response.response';
import { ApiBadRequestResponse, ApiSuccessResponse } from '../../../common/swagger/response.helper.ts';
import { ApiChangeUsername, ApiGetNavbarProfile, ApiGetUserProfile, ApiUpdateProfile } from '../decorators/profile.decorators';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getNavbarUserUseCase: GetNavbarUserUseCase,
    private readonly updateProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUsernameUseCase: ChangeUsernameUseCase,
    private readonly getUserProfile:GetUserProfileUseCase,
  ) {}


  @Get('me')
@ApiGetUserProfile()
async getUserInfo(@Req() req: RequestWithUser) {
  // Ensure user is authenticated
  if (!req.userId) {
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  // Fetch user profile
  const userProfile = await this.getUserProfile.execute(req.userId, req.language);

  // Transform domain to response DTO
  return UserProfileResponse.fromDomain(userProfile);
}
  
 @ApiGetNavbarProfile()
  // @Get('navbar')
  // async getProfile(@Req() req: RequestWithUser) {
  //   if (!req.userId) {
  //     throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  //   }

  //  const navbarUser=await this.getNavbarUserUseCase.execute(req.userId, req.language);

  //    return {
  //   username: navbarUser.username,
  //   email: navbarUser.email,
  //   profileImgUrl: navbarUser.profileImg,
  //   lastLogin: navbarUser.lastLogin ,
  //   createdAt:navbarUser.createdAt,
  //   role: navbarUser.role,
  // };
  // }
@Get('navbar')
async getNavbar(@Req() req: RequestWithUser) {
  if (!req.user) {
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  return {
    username: req.user.username,
    email: req.user.email,
    profileImgUrl: req.user.profileImgUrl,
    createdAt: req.user.createdAt,
    role: req.user.role,
  };
}
  @Patch('update')
  @ApiUpdateProfile()
  async updateProfile(@Req() req: RequestWithUser, @Body() data: Record<string, any>) {
    if (!req.userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    const dto = plainToInstance(UpdateProfileDto, data);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, req.language);

    return this.updateProfileUseCase.execute(
      req.userId,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        aboutMe: data.aboutMe,
        phone: data.phone,
      },
      req.language,
    );
  }

  @Patch('username')

 @ApiChangeUsername()
  @HttpCode(HttpStatus.OK)
  async changeUsername(@Req() req: RequestWithUser, @Body() body: Record<string, any>) {
    if (!req.userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    const dto = plainToInstance(UsernameDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, req.language);

    return this.changeUsernameUseCase.execute(req.userId, dto.username, req.language);
  }
}

