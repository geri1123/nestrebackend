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
import { ApiOkResponse } from '@nestjs/swagger';
import { NavbarProfileResponse } from '../responses/user-nav-response.response';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getNavbarUserUseCase: GetNavbarUserUseCase,
    private readonly updateProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUsernameUseCase: ChangeUsernameUseCase,
    private readonly getUserProfile:GetUserProfileUseCase,
  ) {}

  @ApiOkResponse({ type: UserProfileResponse })
  @Get('me')
  async getUserinfo(@Req() req: RequestWithUser){
    if (!req.userId){
       throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }
    const me= await this.getUserProfile.execute(req.userId , req.language);

    return  UserProfileResponse.fromDomain(me);  
}
    
  
 @ApiOkResponse({type:NavbarProfileResponse})
  @Get('navbar')
  async getProfile(@Req() req: RequestWithUser) {
    if (!req.userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    const profile = await this.getNavbarUserUseCase.execute(req.userId, req.language);

    return  NavbarProfileResponse.fromDomain(profile) ;
  }

  @Patch('update')
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

