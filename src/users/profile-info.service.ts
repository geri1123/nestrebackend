// src/users/profile-info.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository.js';
import { UserService } from './users.service.js';


@Injectable()
export class ProfileInfoService  {
  constructor(private readonly userservice:UserService) {}

  async updateAboutMe(userId: number, aboutMe: string): Promise<void> {
    await this.userservice.updateFields(userId, { about_me: aboutMe });
  }

  async updateUserPhone(userId: number, phone: string): Promise<void> {
    await this.userservice.updateFields(userId, { phone });
  }

  async updateFirstName(userId: number, firstName: string): Promise<void> {
    await this.userservice.updateFields(userId, { first_name: firstName });
  }

  async updateLastName(userId: number, lastName: string): Promise<void> {
    await this.userservice.updateFields(userId, { last_name: lastName });
  }
}
