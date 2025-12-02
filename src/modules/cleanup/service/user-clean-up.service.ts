import { Injectable } from "@nestjs/common";
import { FindUnverifiedUsersUseCase } from "../../users/application/use-cases/find-unverified-users.use-case";
import { DeleteUserUseCase } from "../application/use-cases/delete-user.use-case";
@Injectable()
export class UserCleanupService {
  constructor(
    private readonly findUnverifiedUsers: FindUnverifiedUsersUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  async deleteInactiveUnverifiedUsersBefore(date: Date): Promise<number> {
    const users = await this.findUnverifiedUsers.execute(date);

    for (const u of users) {
      await this.deleteUser.execute(u.id);
    }

    return users.length;
  }
}
