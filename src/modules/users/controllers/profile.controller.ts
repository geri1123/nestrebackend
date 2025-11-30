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

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getNavbarUserUseCase: GetNavbarUserUseCase,
    private readonly updateProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUsernameUseCase: ChangeUsernameUseCase,
  ) {}

  @Get('navbar')
  async getProfile(@Req() req: RequestWithUser) {
    if (!req.userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    const profile = await this.getNavbarUserUseCase.execute(req.userId, req.language);

    return { success: true, profile };
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

// // src/users/profile.controller.ts
// import { Controller, Patch, Body, Req, UseGuards, HttpCode, HttpStatus, Get, UnauthorizedException } from '@nestjs/common';
// import { ProfileInfoService } from '../services/profile-info.service';
// import { UpdateProfileDto } from '../dto/update-profile.dto';

// import { UsernameService } from '../services/username.service';
// import { SupportedLang, t } from '../../../locales';

// import { UsernameDto } from '../dto/username.dto';
// import type { RequestWithLang } from '../../../middlewares/language.middleware';
// import { ProfileSwagger } from '../swager/profile.swagger';


// import { plainToInstance } from 'class-transformer';
// import { validate } from 'class-validator';
// import { throwValidationErrors } from '../../../common/helpers/validation.helper';
// import { UserService } from '../services/users.service';
// import type { RequestWithUser } from '../../../common/types/request-with-user.interface';

//  @ProfileSwagger.ApiTagsProfile()
// @Controller('profile')
// export class UserController{
//   constructor(
//     private readonly profileService: ProfileInfoService,
//      private readonly usernameservice:UsernameService,
//  private readonly Userservice: UserService
//   ) {}

//   @Get('navbar')
//   async getProfile(@Req() req: RequestWithUser) {
//       if (!req.userId) {
//     throw new UnauthorizedException(
//       t('userNotAuthenticated', req.language)
//     );
//   }
//     const userId = req.userId;
//     const language: SupportedLang = req.language || 'en';
//     const profile = await this.Userservice.getNavbarUser(userId , language);
//     return {
//       success: true,
//       profile,
//     };
//   }

//  @ProfileSwagger.ApiUpdateProfile()
//   @Patch('update')
  
//   async updateProfile(
//     @Req() req: RequestWithUser,
//     @Body() data: Record<string, any>,
//   ) {
//     if( !req.userId) {
//       throw new UnauthorizedException(
//         t('userNotAuthenticated', req.language)
//       );
//     }
//     const userId = req.userId;
//    const language = req.language;
//   const dto = plainToInstance(UpdateProfileDto, data);

//   const errors = await validate(dto);
//   if (errors.length > 0) throwValidationErrors(errors, language);
//     const messages: string[] = [];

//     if (data.firstName !== undefined) {
//       await this.profileService.updateFirstName(userId, data.firstName);
//       messages.push(t('firstNameUpdated', language));
//     }
//     if (data.lastName !== undefined) {
//       await this.profileService.updateLastName(userId, data.lastName);
//       messages.push(t('lastNameUpdated', language));
//     }
//     if (data.aboutMe !== undefined) {
//       await this.profileService.updateAboutMe(userId, data.aboutMe);
//       messages.push(t('aboutMeUpdated', language));
//     }
//     if (data.phone !== undefined) {
//       await this.profileService.updateUserPhone(userId, data.phone);
//       messages.push(t('phoneUpdated', language));
//     }

//     return { success: true, message: messages.join(', ') };
//   }
//    @ProfileSwagger.ApiChangeUsername()
//    @Patch('username')
//   @HttpCode(HttpStatus.OK)
 
//   async changeUsername(
//     @Req() req: RequestWithUser,
//     @Body() body: Record<string, any>,
//   ) {
//     if (!req.userId) {
//       throw new UnauthorizedException(
//         t('userNotAuthenticated', req.language)
//       );
//     }
//    const userId = req.userId;
//     const language = req.language || 'al';
    
//   const DtoClass = UsernameDto;
// const dto = plainToInstance(DtoClass, body);

// const errors = await validate(dto);
// if (errors.length > 0) throwValidationErrors(errors, language);
   
    
//     return this.usernameservice.changeUsername(userId, dto.username, language);
//   }

// }
