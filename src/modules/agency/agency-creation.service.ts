
// TODO: Continue here tomorrow
// FIXME: Pick up here

import { BadRequestException, Injectable } from "@nestjs/common";
import { UserService } from "../users/services/users.service";
import { AgencyService } from "./agency.service";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { CreateAgencyDto } from "./dto/create-agency.dto";
import { SupportedLang } from "../../locales";
import { validate } from "class-validator";
import { agency_status, user_role } from "@prisma/client";

@Injectable()
export class AgencyCreationService {
  constructor(
    private readonly agencyService: AgencyService,
    private readonly userService: UserService
  ) {}

  async registerAgencyFromUser(
    dto: CreateAgencyDto,
    userId: number,
    language: SupportedLang
  ) {
    
    const [errors, agencyErrors] = await Promise.all([
      validate(dto),
      this.agencyService.checkAgencyExists(dto.agency_name, dto.license_number, language),
    ]);

    const extraErrors: Record<string, string[]> = {};
    Object.assign(extraErrors, agencyErrors);

    
    if (errors.length > 0 || Object.keys(extraErrors).length > 0) {
      throwValidationErrors(errors, language, extraErrors);
    }

  
    await this.userService.updateFields(userId, { role: user_role.agency_owner});

  
    const agencyId = await this.agencyService.createAgency(dto, userId, language , agency_status.active);

    return { agencyId };
  }
}