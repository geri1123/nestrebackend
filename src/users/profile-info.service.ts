// src/users/profile-info.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository.js';


@Injectable()
export class ProfileInfoService  {
  constructor(private readonly userRepo: UserRepository) {}

  async updateAboutMe(userId: number, aboutMe: string): Promise<void> {
    await this.userRepo.updateFieldsById(userId, { about_me: aboutMe });
  }

  async updateUserPhone(userId: number, phone: string): Promise<void> {
    await this.userRepo.updateFieldsById(userId, { phone });
  }

  async updateFirstName(userId: number, firstName: string): Promise<void> {
    await this.userRepo.updateFieldsById(userId, { first_name: firstName });
  }

  async updateLastName(userId: number, lastName: string): Promise<void> {
    await this.userRepo.updateFieldsById(userId, { last_name: lastName });
  }
}
