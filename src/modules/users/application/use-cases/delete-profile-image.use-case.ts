import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { SupportedLang, t } from '../../../../locales';
import { GetUserProfileUseCase } from './get-user-profile.use-case';

@Injectable()
export class DeleteProfileImageUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
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