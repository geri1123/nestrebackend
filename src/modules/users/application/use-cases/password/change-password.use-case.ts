import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ChangePasswordDto } from '../../../dto/change-password.dto';
import { SupportedLang, t } from '../../../../../locales';
import { type IUserDomainRepository, USER_REPO } from '../../../domain/repositories/user.repository.interface';
import { comparePassword, hashPassword } from '../../../../../common/utils/hash';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
  ) {}

  async execute(userId: number, dto: ChangePasswordDto, lang: SupportedLang) {
    const errors: Record<string, string[]> = {};

    const user = await this.userRepo.findByIdWithPassword(userId);

    if (!user) {
      throw new BadRequestException(t('userNotFound', lang));
    }

    const passwordMatch = await comparePassword(dto.currentPassword, user.password);
    if (!passwordMatch) {
      errors.currentPassword = [t('currentPasswordIncorrect', lang)];
    }

    const isSamePassword = await comparePassword(dto.newPassword, user.password);
    if (isSamePassword) {
      errors.newPassword = [t('passwordSameAsCurrent', lang)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors,
      });
    }

    const hashed = await hashPassword(dto.newPassword);
    await this.userRepo.updatePassword(userId, hashed);

    return {
      success: true,
      message: t('passwordChangedSuccessfully', lang),
    };
  }
}