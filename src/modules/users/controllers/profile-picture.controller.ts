import {
  BadRequestException,
  Controller,
  Delete,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
  InternalServerErrorException,
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
    try {
      console.log('🎯 Controller: uploadProfilePicture called');
      console.log('📋 Request userId:', req.userId);
      console.log('📋 Request language:', req.language);
      console.log('📋 File received:', !!file);
      
      const userId = req.userId;
      const language: SupportedLang = req.language || 'al';

      if (!userId) {
        console.log('❌ No userId found');
        throw new UnauthorizedException(t('userNotAuthenticated', language));
      }

      if (!file) {
        console.log('❌ No file uploaded');
        throw new BadRequestException({
          success: false,
          message: t('noImageUploaded', language),
        });
      }

      console.log('🚀 Calling uploadProfileUseCase.execute...');
      const imageUrl = await this.uploadProfileUseCase.execute(userId, file, language);
      console.log('✅ Use case completed, imageUrl:', imageUrl);

      const response = {
        success: true,
        message: t('imagesuccessfullyUploaded', language),
        imageUrl,
      };
      
      console.log('📤 Sending response:', response);
      return response;

    } catch (error) {
      console.error('❌❌❌ CONTROLLER ERROR:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Re-throw known HTTP exceptions
      if (error instanceof BadRequestException || 
          error instanceof UnauthorizedException) {
        throw error;
      }
      
      // For any other error, throw Internal Server Error with details
      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error',
        error: error?.message || 'Unknown error',
      });
    }
  }

  @Delete()
  @ApiProfilePictureDelete()
  async deleteProfilePicture(@Req() req: RequestWithUser) {
    try {
      console.log('🎯 Controller: deleteProfilePicture called');
      
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
      
    } catch (error) {
      console.error('❌❌❌ DELETE CONTROLLER ERROR:', error);
      
      if (error instanceof BadRequestException || 
          error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error',
        error: error?.message || 'Unknown error',
      });
    }
  }
}