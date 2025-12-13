import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPO,type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UploadProfileImageUseCase {
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
  ): Promise<string> {

    // 1️⃣ Validate image
    this.imageUtils.validateFile(file, lang);

    // 2️⃣ Load user
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', lang),
      });
    }

    const oldPublicId = user.profileImgPublicId;

    // 3️⃣ Upload new image
    const uploadResult = await this.cloudinary.uploadFile(
      file,
      `profile-images/${userId}`,
    );

    if (!uploadResult?.url || !uploadResult?.publicId) {
      throw new BadRequestException({
        success: false,
        message: t('imageUploadFailed', lang),
      });
    }

    // 4️⃣ Update domain entity
    user.updateProfileImage(uploadResult.url, uploadResult.publicId);

    // 5️⃣ Persist
    await this.userRepo.updateProfileImage(
      userId,
      uploadResult.url,
      uploadResult.publicId,
    );

    // 6️⃣ Delete old image (best effort)
    if (oldPublicId) {
      try {
        await this.cloudinary.deleteFile(oldPublicId);
      } catch (err) {
        console.warn('⚠️ Failed to delete old Cloudinary image', err);
      }
    }

    // 7️⃣ Return URL
    return uploadResult.url;
  }
}