import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
import { SupportedLang, t } from '../../../../locales';
import { GetUserProfileUseCase } from './get-user-profile.use-case';

@Injectable()
export class UploadProfileImageUseCase {
  constructor(
    @Inject(USER_REPO)

    private readonly userRepo: IUserDomainRepository,

    private readonly firebase: FirebaseService,
    private readonly imageUtils: ImageUtilsService,
    private readonly getUserProfile: GetUserProfileUseCase,
  ) {}

  async execute(
    userId: number,
    file: Express.Multer.File,
    lang: SupportedLang,
  ): Promise<string> {

    this.imageUtils.validateFile(file, lang);

    const user = await this.getUserProfile.execute(userId, lang);

    const oldPath = user.profileImg;

    if (oldPath && !this.imageUtils.isDefaultImage(oldPath)) {
      try {
        await this.firebase.deleteFile(oldPath);
      } catch (err) {
        console.warn(`Failed to delete old image`, err);
      }
    }

    const dest = `profile-images/${userId}`;
    const uploadedPath = await this.firebase.uploadFile(file, dest);

    if (!uploadedPath) {
      throw new BadRequestException(t('imageUploadFailed', lang));
    }

    user.updateProfileImage(uploadedPath);
    await this.userRepo.updateProfileImage(user.id, uploadedPath);

    return this.firebase.getPublicUrl(uploadedPath)!;
  }
}