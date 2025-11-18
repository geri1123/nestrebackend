import { 
  BadRequestException, 
  Controller, 
  Delete, 
  Patch, 
  Req, 
  UploadedFile, 
  UseInterceptors 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilePictureService } from '../services/profile-picture.service';
import { SupportedLang, t } from '../../../locales';
import { ApiProfilePictureUpload ,ApiProfilePictureDelete} from '../swager/upload-image.swager';
import { ProfileSwagger } from '../swager/profile.swagger';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
@Controller('profile-image')
@ProfileSwagger.ApiTagsProfile()
export class ProfilePictureController {
  constructor(private readonly profilePictureService: ProfilePictureService) {}

  
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
      throw new BadRequestException(t('userNotAuthenticated', req.language));
    }
    if (!file) {
      throw new BadRequestException({
        success: false,
        message:t("noImageUploaded" , language),
      });
    }

    const uploadedUrl = await this.profilePictureService.updateProfileImage(
      userId,
      file,
      language,
    );

    return {
      success: true,
      message:t('imagesuccessfullyUploaded', language),
      imageUrl: uploadedUrl,
    };
  }

  @Delete()
  @ApiProfilePictureDelete()
  async deleteProfilePicture(@Req() req: RequestWithUser) {
    if (!req.userId) {
      throw new BadRequestException(t('userNotAuthenticated', req.language));
    }
    const userId = req.userId;
    const language: SupportedLang = req.language || 'al';

    await this.profilePictureService.deleteProfileImage(userId, language);

    return {
      success: true,
      message:t('imagesuccessfullydeleted', language),
    };
  }
}