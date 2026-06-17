import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ADMIN_REPOSITORY_TOKENS } from "../domain/repositories/admin.repository.tokens";
import { IAdminRepository } from "../domain/repositories/admin.repository.interface";
import { hashPassword } from "../../../../common/utils/hash";

interface RegisterAdmin {
  email: string;
  name: string;
  password: string;
}

@Injectable()
export class CreateAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_TOKENS.ADMIN_REPOSITORY)
    private readonly adminRepo: IAdminRepository,
  ) {}

  async execute(inputs: RegisterAdmin) {
    const errors: Record<string, string[]> = {};

    const emailExist = await this.adminRepo.findAdminByEmail(inputs.email);

    if (emailExist) {
      errors.email = ["Email exist"];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const hashedPassword = await hashPassword(inputs.password);

    const admin = await this.adminRepo.createAdmin({
      email: inputs.email,
      name: inputs.name,
      password: hashedPassword,
      role:"admin",
    });

    return admin;
  }
}