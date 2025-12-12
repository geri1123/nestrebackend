import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { SupportedLang, t } from '../../../../locales';
import { GetUserProfileUseCase } from './get-user-profile.use-case';

@Injectable()
export class DeleteProfileImageUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,

    private readonly firebase: FirebaseService,
    private readonly getUserProfile: GetUserProfileUseCase,
  ) {}

  async execute(userId: number, lang: SupportedLang): Promise<void> {
    const user = await this.getUserProfile.execute(userId, lang);

    if (!user.hasProfileImage()) {
      throw new BadRequestException(t('noimagetodelete', lang));
    }

    try {
      await this.firebase.deleteFile(user.profileImg!);
    } catch (err) {
      console.warn(`Failed deleting image`, err);
    }

    user.removeProfileImage();
    await this.userRepo.deleteProfileImage(userId);
  }
}