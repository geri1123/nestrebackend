
import { Inject, Injectable } from '@nestjs/common';
import { IUserDomainRepository, USER_REPO } from '../../../users/domain/repositories/user.repository.interface';
import { GetAllUsersAdminQuery } from '../types/user-query.types';

const ADMIN_USERS_PER_PAGE = 20;

@Injectable()
export class GetAllUsersAdminUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
  ) {}

  async execute(input: GetAllUsersAdminQuery) {
    const page = Math.max(1, input.page ?? 1);

    const { users, total } = await this.userRepo.findAllForAdmin({
      ...input,
      page,
      limit: ADMIN_USERS_PER_PAGE,
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit: ADMIN_USERS_PER_PAGE,
        totalPages: Math.ceil(total / ADMIN_USERS_PER_PAGE),
      },
    };
  }
}