import {
  BadRequestException,
  Controller,
  Delete,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { SupportedLang, t } from '../../../locales';

import { ApiProfilePictureUpload, ApiProfilePictureDelete } from '../swager/upload-image.swager';
import { ProfileSwagger } from '../swager/profile.swagger';

import type { RequestWithUser } from '../../../common/types/request-with-user.interface';

// Use Cases
import { DeleteProfileImageUseCase } from '../application/use-cases/delete-profile-image.use-case';
import { UploadProfileImageUseCase } from '../application/use-cases/update-profile-image.use-case';
@Controller('profile-image')
@ProfileSwagger.ApiTagsProfile()
export class ProfilePictureController {
  constructor(
    private readonly uploadProfileUseCase: UploadProfileImageUseCase,
    private readonly deleteProfileUseCase: DeleteProfileImageUseCase,
  ) {}

  @Patch()
  @ApiProfilePictureUpload()
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.userId;
    const language: SupportedLang = req.language || 'al';

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }

    if (!file) {
      throw new BadRequestException({
        success: false,
        message: t('noImageUploaded', language),
      });
    }

    const imageUrl = await this.uploadProfileUseCase.execute(userId, file, language);

    return {
      success: true,
      message: t('imagesuccessfullyUploaded', language),
      imageUrl,
    };
  }

  @Delete()
  @ApiProfilePictureDelete()
  async deleteProfilePicture(@Req() req: RequestWithUser) {
    const userId = req.userId;
    const language: SupportedLang = req.language || 'al';

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }

    await this.deleteProfileUseCase.execute(userId, language);

    return {
      success: true,
      message: t('imagesuccessfullydeleted', language),
    };
  }
}