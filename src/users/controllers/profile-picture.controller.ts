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
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { SupportedLang, t } from '../../locales';

@Controller('profile-image')
export class ProfilePictureController {
  constructor(private readonly profilePictureService: ProfilePictureService) {}

  
  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithLang,
  ) {
    const userId = req['userId'];
    const language: SupportedLang = req.language || 'en';

    if (!file) {
      throw new BadRequestException({
        success: false,
        message: language === 'al' ? 'Asnjë skedar nuk është ngarkuar' : 'No file uploaded',
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
  async deleteProfilePicture(@Req() req: RequestWithLang) {
    const userId = req['userId'];
    const language: SupportedLang = req.language || 'en';

    await this.profilePictureService.deleteProfileImage(userId, language);

    return {
      success: true,
      message:t('imagesuccessfullydeleted', language),
    };
  }
}