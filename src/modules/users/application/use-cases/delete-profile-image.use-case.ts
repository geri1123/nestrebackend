import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../constants/user.tokens';
import {type IUserRepository } from '../../../../repositories/user/Iuser.repository';

@Injectable()
export class DeleteProfileImageUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  execute(userId: number): Promise<void> {
    return this.userRepository.deleteImage(userId);
  }
}