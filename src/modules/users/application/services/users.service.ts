import { Injectable } from '@nestjs/common';
import { hashPassword } from '../../../../common/utils/hash';
import { SupportedLang } from '../../../../locales';
import { NavbarUser, UserStatusType } from '../../types/base-user-info';
import { UpdatableUserFields } from '../../types/update-user-info';
import { FindUserByIdentifierOrFailUseCase } from '../../use-cases/find-user-by-identifier-or-fail.use-case';
import { FindUserByIdOrFailUseCase } from '../../use-cases/find-user-by-id-or-fail.use-case';
import { EnsureUsernameAvailabilityUseCase } from '../../use-cases/ensure-username-availability.use-case';
import { UpdateUserFieldsUseCase } from '../../use-cases/update-user-fields.use-case';
import { FindEmailOrFailActiveUseCase } from '../../use-cases/find-email-or-fail-active.use-case';
import { VerifyEmailUseCase } from '../../use-cases/verify-email.use-case';
import { FindUserByIdentifierUseCase } from '../../use-cases/find-user-by-identifier.use-case';
import { UpdateLastLoginUseCase } from '../../use-cases/update-last-login.use-case';
import { UpdateProfileImageUseCase } from '../../use-cases/update-profile-image.use-case';
import { GetNavbarUserUseCase } from '../../use-cases/get-navbar-user.use-case';
import { DeleteProfileImageUseCase } from '../../use-cases/delete-profile-image.use-case';

@Injectable()
export class UserService {
  constructor(  private readonly findUserByIdentifierOrFailUseCase: FindUserByIdentifierOrFailUseCase,
    private readonly findUserByIdOrFailUseCase: FindUserByIdOrFailUseCase,
    private readonly ensureUsernameAvailabilityUseCase: EnsureUsernameAvailabilityUseCase,
    private readonly updateUserFieldsUseCase: UpdateUserFieldsUseCase,
    private readonly findEmailOrFailActiveUseCase: FindEmailOrFailActiveUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly findUserByIdentifierUseCase: FindUserByIdentifierUseCase,
    private readonly updateLastLoginUseCase: UpdateLastLoginUseCase,
    private readonly updateProfileImageUseCase: UpdateProfileImageUseCase,
    private readonly getNavbarUserUseCase: GetNavbarUserUseCase,
    private readonly deleteProfileImageUseCase: DeleteProfileImageUseCase,
  ) {}

    async findByIdentifierOrFail(identifier: string, language: SupportedLang) {
    return this.findUserByIdentifierOrFailUseCase.execute(identifier, language);
  }
   async findByIdOrFail(userId: number, lang: SupportedLang) {
       return this.findUserByIdOrFailUseCase.execute(userId, lang);
  }
   async usernameExists(username: string, language: SupportedLang = 'al'): Promise<boolean> {
    await this.ensureUsernameAvailabilityUseCase.execute(username, language);
    return true;
  }
   async updateFields(userId: number, fields: Partial<UpdatableUserFields>): Promise<void> {
    return this.updateUserFieldsUseCase.execute(userId, fields);
  }

  async updatePassword(userId: number, newPassword: string) {
const hashedPassword = await hashPassword(newPassword);
    return this.updateUserFieldsUseCase.execute(userId, { password: hashedPassword });
  }
   async verifyEmail(userId: number, emailVerified: boolean, statusToUpdate: UserStatusType) {
    return this.verifyEmailUseCase.execute(userId, emailVerified, statusToUpdate);
  }
   async findByIdentifier(identifier: string) {  
    return this.findUserByIdentifierUseCase.execute(identifier);
  }
  async updateLastLogin(userId: number) {
      return this.updateLastLoginUseCase.execute(userId);
  }
    async updateProfileImage(userId: number, imageUrl: string) {
    await this.updateProfileImageUseCase.execute(userId, imageUrl);
  }
  async getNavbarUser(userId: number, language: SupportedLang = 'al'): Promise<NavbarUser> {
    return this.getNavbarUserUseCase.execute(userId, language);
  }
   async deleteProfileImage(userId: number) {
    await this.deleteProfileImageUseCase.execute(userId);
  }
}