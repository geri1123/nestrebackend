import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  USER_REPO,
  type IUserDomainRepository,
} from '../../domain/repositories/user.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
import { SupportedLang, t } from '../../../../locales';
import { CloudinaryUploadResult } from '../../../../infrastructure/cloudinary/types/cloudinary-upload.result';

@Injectable()
export class UploadProfileImageUseCase {
  private readonly logger = new Logger(UploadProfileImageUseCase.name);

  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly cloudinary: CloudinaryService,
    private readonly imageUtils: ImageUtilsService,
  ) {}

  async execute(
    userId: number,
    file: Express.Multer.File,
    lang: SupportedLang,
  ): Promise<{ url: string; publicId: string }> {
    

    
    this.imageUtils.validateFile(file, lang);
    this.logger.debug(`Image validation passed for user ${userId}`);

   
    const user = await this.userRepo.findById(userId);
    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', lang),
      });
    }

    const oldPublicId = user.profileImgPublicId;
    let uploadResult: CloudinaryUploadResult | null = null;

    try {
    
      uploadResult = await this.cloudinary.uploadFile(
        file,
        `profile-images/${userId}`,
      );

      if (!uploadResult?.url || !uploadResult?.publicId) {
        throw new BadRequestException({
          success: false,
          message: t('imageUploadFailed', lang),
        });
      }

      this.logger.log(
        `Image uploaded to Cloudinary for user ${userId}: ${uploadResult.publicId}`,
      );

    
      user.updateProfileImage(uploadResult.url, uploadResult.publicId);

  
      await this.userRepo.updateProfileImage(
        userId,
        uploadResult.url,
        uploadResult.publicId,
      );

      this.logger.log(`Database updated for user ${userId}`);

    
      if (oldPublicId) {
        try {
          await this.cloudinary.deleteFile(oldPublicId);
          this.logger.log(`Old image deleted for user ${userId}: ${oldPublicId}`);
        } catch (err) {
          this.logger.warn(
            `Failed to delete old Cloudinary image for user ${userId}: ${oldPublicId}`,
            err,
          );
         
        }
      }

      this.logger.log(
        `Profile image upload completed successfully for user ${userId}`,
      );

      
      return {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    } catch (error) {
      
      if (uploadResult?.publicId) {
        this.logger.error(
          `Database update failed for user ${userId}. Rolling back Cloudinary upload: ${uploadResult.publicId}`,
        );
        try {
          await this.cloudinary.deleteFile(uploadResult.publicId);
          this.logger.log(
            `Successfully rolled back Cloudinary upload: ${uploadResult.publicId}`,
          );
        } catch (rollbackErr) {
          this.logger.error(
            `Failed to rollback Cloudinary upload: ${uploadResult.publicId}`,
            rollbackErr,
          );
        }
      }

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error during profile image upload for user ${userId}`,
        error,
      );
      throw new InternalServerErrorException({
        success: false,
        message: t('imageUploadFailed', lang),
      });
    }
  }
}