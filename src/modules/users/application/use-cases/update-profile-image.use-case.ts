import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UploadProfileImageUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly firebase: FirebaseService,
    private readonly imageUtils: ImageUtilsService,
  ) {}

  async execute(
    userId: number,
    file: Express.Multer.File,
    lang: SupportedLang,
  ): Promise<string> {
    try {
      console.log('🔵 Starting image upload for user:', userId);
      
      // Validate file
      this.imageUtils.validateFile(file, lang);
      console.log('✅ File validated');

      // Fetch user directly from repository
      const user = await this.userRepo.findById(userId);
      console.log('✅ User found:', !!user);
      
      if (!user) {
        throw new NotFoundException({
          success: false,
          message: t('userNotFound', lang)
        });
      }

      const oldPath = user.profileImg;
      console.log('📷 Old image path:', oldPath);

      // Delete old image if it exists and is not a default image
      if (oldPath && !this.imageUtils.isDefaultImage(oldPath)) {
        try {
          await this.firebase.deleteFile(oldPath);
          console.log('🗑️ Old image deleted');
        } catch (err) {
          console.warn(`⚠️ Failed to delete old image:`, err);
        }
      }

      // Upload new image
      const dest = `profile-images/${userId}`;
      console.log('📤 Uploading to:', dest);
      
      const uploadedPath = await this.firebase.uploadFile(file, dest);
      console.log('✅ New image uploaded:', uploadedPath);

      if (!uploadedPath) {
        throw new BadRequestException({
          success: false,
          message: t('imageUploadFailed', lang)
        });
      }

      // Update database
      console.log('💾 Updating database...');
      await this.userRepo.updateProfileImage(userId, uploadedPath);
      console.log('✅ Database updated');

      // Return public URL
      const publicUrl = this.firebase.getPublicUrl(uploadedPath);
      console.log('✅ Public URL generated:', publicUrl);
      
      if (!publicUrl) {
        throw new BadRequestException({
          success: false,
          message: t('imageUploadFailed', lang)
        });
      }

      console.log('🎉 Image upload completed successfully');
      return publicUrl;

    } catch (error) {
      console.error('❌ Upload profile image error:', error);
      
      // Re-throw known exceptions
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // For unknown errors, throw a generic one
      throw new BadRequestException({
        success: false,
        message: t('imageUploadFailed', lang)
      });
    }
  }
}

// import { Inject, Injectable, BadRequestException } from '@nestjs/common';
// import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
// import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
// import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
// import { SupportedLang, t } from '../../../../locales';
// import { GetUserProfileUseCase } from './get-user-profile.use-case';

// @Injectable()
// export class UploadProfileImageUseCase {
//   constructor(
//     @Inject(USER_REPO)

//     private readonly userRepo: IUserDomainRepository,

//     private readonly firebase: FirebaseService,
//     private readonly imageUtils: ImageUtilsService,
//     private readonly getUserProfile: GetUserProfileUseCase,
//   ) {}

//   async execute(
//     userId: number,
//     file: Express.Multer.File,
//     lang: SupportedLang,
//   ): Promise<string> {

//     this.imageUtils.validateFile(file, lang);

//     const user = await this.getUserProfile.execute(userId, lang);

//     const oldPath = user.profileImg;

//     if (oldPath && !this.imageUtils.isDefaultImage(oldPath)) {
//       try {
//         await this.firebase.deleteFile(oldPath);
//       } catch (err) {
//         console.warn(`Failed to delete old image`, err);
//       }
//     }

//     const dest = `profile-images/${userId}`;
//     const uploadedPath = await this.firebase.uploadFile(file, dest);

//     if (!uploadedPath) {
//       throw new BadRequestException(t('imageUploadFailed', lang));
//     }

//     user.updateProfileImage(uploadedPath);
//     await this.userRepo.updateProfileImage(user.id, uploadedPath);

//     return this.firebase.getPublicUrl(uploadedPath)!;
//   }
// }