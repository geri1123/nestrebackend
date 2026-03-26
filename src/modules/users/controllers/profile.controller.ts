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
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { GetNavbarUserUseCase } from '../application/use-cases/get-navbar-user.use-case';
import { UpdateUserProfileUseCase } from '../application/use-cases/update-user-profile.use-case';
import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.use-case';
import { UserProfileResponse } from '../responses/user-profile.response';
import { ApiChangeUsername, ApiGetNavbarProfile, ApiGetUserProfile, ApiUpdateProfile } from '../decorators/profile.decorators';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ChangePasswordUseCase } from '../application/use-cases/password/change-password.use-case';
import { ApiChangePassword } from '../decorators/password.decoretors';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getNavbarUserUseCase: GetNavbarUserUseCase,
    private readonly updateProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUsernameUseCase: ChangeUsernameUseCase,
    private readonly getUserProfile:GetUserProfileUseCase,
    private readonly  changePasswordUseCase:ChangePasswordUseCase,
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
    id:req.user.id,
    username: req.user.username,
    email: req.user.email,
    profileImgUrl: req.user.profileImgUrl,
    createdAt: req.user.createdAt,
    role: req.user.role,
  };
}
 @Patch('update')
@ApiUpdateProfile()
async updateProfile(
  @Req() req: RequestWithUser,
  @Body() dto: UpdateProfileDto,
) {
  if (!req.userId) {
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  return this.updateProfileUseCase.execute(
    req.userId,
    {
      firstName: dto.firstName,
      lastName: dto.lastName,
      aboutMe: dto.aboutMe,
      phone: dto.phone,
    },
    req.language,
  );
}

  @Patch('username')

 @ApiChangeUsername()
  @HttpCode(HttpStatus.OK)
 async changeUsername(
  @Req() req: RequestWithUser,
  @Body() dto: UsernameDto,
) {
  if (!req.userId) {
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  return this.changeUsernameUseCase.execute(
    req.userId,
    dto.username,
    req.language,
  );
}
 @Patch('change-password')
 @ApiChangePassword() 
async changePassword(
  @Req() req: RequestWithUser,
  @Body() dto: ChangePasswordDto,
) {
  console.log('=== CHANGE PASSWORD ===');
  console.log('body:', JSON.stringify(dto));
  console.log('userId:', req.userId);
  if (!req.userId) {
    throw new UnauthorizedException(
      t('userNotAuthenticated', req.language),
    );
  }

  return this.changePasswordUseCase.execute(
    req.userId,
    dto,
    req.language,
  );
}
}

