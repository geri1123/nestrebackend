// src/users/profile.controller.ts
import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { ProfileInfoService } from './profile-info.service';
import { UpdateProfileDto } from './dto/update-profile.dto';


import { SupportedLang, t } from '../locales';

import type { RequestWithUserAndLang } from '../types/request-with-user';
import type { RequestWithLang } from '../middlewares/language.middleware';


@Controller('profile')
export class UserController{
  constructor(private readonly profileService: ProfileInfoService) {}

  @Patch('update')
  async updateProfile(
    @Req() req: RequestWithLang,
    @Body() data: UpdateProfileDto,
  ) {
    const userId = req["userId"];
   const language = req.language || 'al';

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
}
