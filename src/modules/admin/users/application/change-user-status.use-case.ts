import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { IUserDomainRepository, USER_REPO } from "../../../users/domain/repositories/user.repository.interface";

@Injectable()
export class ChangeUserStatusUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
  ) {}

  async execute(
    userId: number,
    status: UserStatus,
  ) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.updateStatus(
      userId,
      status,
    );

    return {
      success: true,
    };
  }
}