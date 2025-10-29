// src/users/profile.controller.ts
import { Controller, Patch, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfileInfoService } from '../services/profile-info.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

import { UsernameService } from '../services/username.service';
import { SupportedLang, t } from '../../locales';

import { UsernameDto } from '../dto/username.dto';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { ProfileSwagger } from '../swager/profile.swagger';


import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../common/helpers/validation.helper';

 @ProfileSwagger.ApiTagsProfile()
@Controller('profile')
export class UserController{
  constructor(
    private readonly profileService: ProfileInfoService,
     private readonly usernameservice:UsernameService

  ) {}
 @ProfileSwagger.ApiUpdateProfile()
  @Patch('update')
  
  async updateProfile(
    @Req() req: RequestWithLang,
    @Body() data: Record<string, any>,
  ) {
    const userId = req["userId"];
   const language = req.language;
  const dto = plainToInstance(UpdateProfileDto, data);

  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);
    const messages: string[] = [];

    if (data.firstName !== undefined) {
      await this.profileService.updateFirstName(userId, data.firstName);
      messages.push(t('firstNameUpdated', language));
    }
    if (data.lastName !== undefined) {
      await this.profileService.updateLastName(userId, data.lastName);
      messages.push(t('lastNameUpdated', language));
    }
    if (data.aboutMe !== undefined) {
      await this.profileService.updateAboutMe(userId, data.aboutMe);
      messages.push(t('aboutMeUpdated', language));
    }
    if (data.phone !== undefined) {
      await this.profileService.updateUserPhone(userId, data.phone);
      messages.push(t('phoneUpdated', language));
    }

    return { success: true, message: messages.join(', ') };
  }
   @ProfileSwagger.ApiChangeUsername()
   @Patch('username')
  @HttpCode(HttpStatus.OK)
 
  async changeUsername(
    @Req() req: RequestWithLang,
    @Body() body: Record<string, any>,
  ) {
   const userId = req["userId"];
    const language = req.language || 'al';
    
  const DtoClass = UsernameDto;
const dto = plainToInstance(DtoClass, body);

const errors = await validate(dto);
if (errors.length > 0) throwValidationErrors(errors, language);
   
    
    return this.usernameservice.changeUsername(userId, dto.username, language);
  }

}
