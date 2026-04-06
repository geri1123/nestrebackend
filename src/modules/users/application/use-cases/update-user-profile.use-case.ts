import { Inject, Injectable } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository, UpdateUserFields } from '../../domain/repositories/user.repository.interface';
import { t, SupportedLang } from '../../../../locales';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  aboutMe?: string;
  phone?: string;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
  ) {}

  async execute(
    userId: number,
    data: UpdateProfileData,
    language: SupportedLang = 'al',
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error(t('userNotFound', language));

    const updateFields: Partial<UpdateUserFields> = {};
    if (data.firstName !== undefined) updateFields.first_name = data.firstName;
    if (data.lastName !== undefined)  updateFields.last_name  = data.lastName;
    if (data.aboutMe !== undefined)   updateFields.about_me   = data.aboutMe;
    if (data.phone !== undefined)     updateFields.phone       = data.phone;

    await this.userRepository.updateFields(userId, updateFields);

    return { success: true, message: t('userUpdatedSuccess', language) };
  }
}