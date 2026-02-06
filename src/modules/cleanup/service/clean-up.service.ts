import { Injectable } from "@nestjs/common";
import { FindUnverifiedUsersUseCase } from "../../users/application/use-cases/find-unverified-users.use-case";
import { DeleteUserUseCase } from "../application/use-cases/delete-unverified-user.use-case";
import { ExpireProductAdsUseCase } from "../../advertise-product/application/use-cases/expired-addvertisement.use-cace";

@Injectable()
export class CleanupService {
  constructor(
    private readonly findUnverifiedUsers: FindUnverifiedUsersUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly expireProductAdsUseCase: ExpireProductAdsUseCase,
  ) {}

  // Cleanup inactive unverified users
  async deleteInactiveUnverifiedUsersBefore(date: Date): Promise<number> {
    const users = await this.findUnverifiedUsers.execute(date);
    await Promise.all(users.map(u => this.deleteUser.execute(u.id)));
    return users.length;
  }

  // Cleanup expired advertisements
  async expireExpiredAdvertisements(): Promise<number> {
    return this.expireProductAdsUseCase.execute();
  }
}