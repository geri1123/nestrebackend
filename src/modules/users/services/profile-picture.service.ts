import { BadRequestException, Injectable } from "@nestjs/common";
import { UserService } from "./users.service";
import { FirebaseService } from "../../../infrastructure/firebase/firebase.service";
import { SupportedLang, t } from "../../../locales";
import { ImageUtilsService } from "../../../common/utils/image-utils.service";

@Injectable()
export class ProfilePictureService {
  constructor(
    private readonly userService: UserService,
    private readonly firebaseService: FirebaseService,
    private readonly imageUtilsService: ImageUtilsService 
  ) {}

  async updateProfileImage(
    userId: number,
    file: Express.Multer.File,
    language: SupportedLang
  ): Promise<string> {
 
     this.imageUtilsService.validateFile(file, language);

  
    const user = await this.userService.findByIdOrFail(userId, language);
    const oldImagePath = user.profile_img;


    if (oldImagePath && !this.imageUtilsService.isDefaultImage(oldImagePath)) {
      try {
        await this.firebaseService.deleteFile(oldImagePath);
        console.log(` Deleted old profile image: ${oldImagePath}`);
      } catch (error) {
        console.warn(` Failed to delete old profile image:`, error);
      }
    }

   
    const destination = `profile-images/${userId}`;
    const uploadedPath = await this.firebaseService.uploadFile(file, destination);
    
    if (!uploadedPath) {
      throw new BadRequestException({
        success: false,
        message: t('imageUploadFailed', language),
      });
    }

   

   
    try {
      await this.userService.updateProfileImage(userId, uploadedPath);
    } catch (error) {
      // Rollback: delete uploaded image
      await this.firebaseService.deleteFile(uploadedPath);
      throw new BadRequestException({
        success: false,
        message:t('failedToUpdateProfileImage',language),
      });
    }

 
    return this.firebaseService.getPublicUrl(uploadedPath)!;
  }

  async deleteProfileImage(userId: number, language: SupportedLang): Promise<void> {
    const user = await this.userService.findByIdOrFail(userId, language);
    const oldImagePath = user.profile_img;

    if (!oldImagePath) {
      throw new BadRequestException({
        success: false,
        message: t('noimagetodelete' , language),
      });
    }

    // if (!this.imageUtilsService.isDefaultImage(oldImagePath)) {
    //   throw new BadRequestException({
    //     success: false,
    //     message: "Cannot delete default profile image",
    //   });
    // }

 
    try {
      await this.firebaseService.deleteFile(oldImagePath);
    } catch (error) {
      console.warn(`Failed to delete profile image from storage:`, error);
    }

    
    await this.userService.deleteProfileImage(userId);
  }

  // private validateFile(file: Express.Multer.File, language: SupportedLang): void {
  //   if (!file) {
  //     throw new BadRequestException({
  //       success: false,
  //       message:t('noImageUploaded', language),
  //     });
  //   }

  //   if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
  //     throw new BadRequestException({
  //       success: false,
  //       message:t('invalidImageType', language),
  //     });
  //   }

  //   if (file.size > this.MAX_FILE_SIZE) {
  //     throw new BadRequestException({
  //       success: false,
  //       message:t('imageTooLarge', language),
  //     });
  //   }
  // }

  // private isDefaultImage(path: string): boolean {
  //   return this.DEFAULT_IMAGE_PREFIXES.some(prefix => path.startsWith(prefix));
  // }
}
