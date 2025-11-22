import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user/user.repository";
import { RegistrationRequestRepository } from "../repositories/registration-request/registration-request.repository";
import { AgencyRepository } from "../repositories/agency/agency.repository";

@Injectable()
export class UserCleanupService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly registrationRequestRepo: RegistrationRequestRepository,
    private readonly agencyRepo: AgencyRepository,
  ) {}

  async deleteInactiveUnverifiedUsersBefore(date: Date): Promise<number> {
    const users = await this.userRepo.findUnverifiedBefore(date);

    for (const user of users) {
     
      await this.registrationRequestRepo.deleteByUserId(user.id);
      await this.agencyRepo.deleteByOwnerUserId(user.id);

      // Delete the user
      await this.userRepo.deleteById(user.id);
    }

    return users.length;
  }
}