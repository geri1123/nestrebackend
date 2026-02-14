import { Inject, Injectable } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
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

    const updateFields: any = {};
    if (data.firstName !== undefined) updateFields.first_name = data.firstName;
    if (data.lastName !== undefined) updateFields.last_name = data.lastName;
    if (data.aboutMe !== undefined) updateFields.about_me = data.aboutMe;
    if (data.phone !== undefined) updateFields.phone = data.phone;

    await this.userRepository.updateFields(userId, updateFields);

    const messages: string[] = [];
    if (data.firstName !== undefined) messages.push(t('firstNameUpdated', language));
    if (data.lastName !== undefined) messages.push(t('lastNameUpdated', language));
    if (data.aboutMe !== undefined) messages.push(t('aboutMeUpdated', language));
    if (data.phone !== undefined) messages.push(t('phoneUpdated', language));

    return { success: true, message: messages.join(', ') };
  }
}