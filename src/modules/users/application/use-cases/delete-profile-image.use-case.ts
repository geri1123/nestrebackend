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
  const user = await this.userRepo.findById(userId); 

  if (!user) {
    throw new BadRequestException({
      success: false,
      message: t('userNotFound', lang),
    });
  }

  if (!user.hasProfileImage() || !user.profileImgPublicId) {
    throw new BadRequestException({
      success: false,
      message: t('noimagetodelete', lang),
    });
  }

  try {
    await this.cloudinary.deleteFile(user.profileImgPublicId);
  } catch (err) {
    console.warn('Failed deleting Cloudinary image', err);
  }

  user.removeProfileImage();
  await this.userRepo.deleteProfileImage(userId);
}
}