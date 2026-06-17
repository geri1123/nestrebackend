// admin/application/use-cases/get-all-users.use-case.ts

import { Inject, Injectable } from '@nestjs/common';

import {IUserDomainRepository, USER_REPO } from '../../../users/domain/repositories/user.repository.interface';

const ADMIN_USERS_PER_PAGE = 20; // ← këtu e kontrollon backend-i
interface GetAllUsersInput {
  status?: 'active' | 'deleted' | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

@Injectable()
export class GetAllUsersAdminUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
  ) {}

  async execute(input: GetAllUsersInput) {
    const page = Math.max(1, input.page ?? 1);

    const { users, total } =
      await this.userRepo.findAllForAdmin({
        ...input,
        page,
        limit: ADMIN_USERS_PER_PAGE,
      });

    return {
      users,
      total,
      page,
      limit: ADMIN_USERS_PER_PAGE,
      totalPages: Math.ceil(total / ADMIN_USERS_PER_PAGE),
    };
  }
}