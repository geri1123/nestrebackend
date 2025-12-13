import {
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  USER_REPO,
  type IUserDomainRepository,
} from '../../domain/repositories/user.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { SupportedLang, t } from '../../../../locales';
import { GetUserProfileUseCase } from './get-user-profile.use-case';

@Injectable()
export class DeleteProfileImageUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,

    private readonly cloudinary: CloudinaryService,
    private readonly getUserProfile: GetUserProfileUseCase,
  ) {}

  async execute(userId: number, lang: SupportedLang): Promise<void> {
    // 1️⃣ Load domain user
    const user = await this.getUserProfile.execute(userId, lang);

    // 2️⃣ Guard
    if (!user.hasProfileImage() || !user.profileImgPublicId) {
      throw new BadRequestException({
        success: false,
        message: t('noimagetodelete', lang),
      });
    }

    // 3️⃣ Delete from Cloudinary using public_id
    try {
      await this.cloudinary.deleteFile(user.profileImgPublicId);
    } catch (err) {
      console.warn('⚠️ Failed deleting Cloudinary image', err);
    }

    // 4️⃣ Update domain + DB
    user.removeProfileImage();
    await this.userRepo.deleteProfileImage(userId);
  }
}