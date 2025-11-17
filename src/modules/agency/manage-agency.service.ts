import { Injectable } from "@nestjs/common";
import { UpdateAgencyDto } from "./dto/update-agency.dto";
import { AgencyRepository } from "../../repositories/agency/agency.repository";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { SupportedLang } from "../../locales";

@Injectable()

export class ManageAgencyService{
  constructor(private readonly agencyRepo:AgencyRepository){}


async updateAgencyFields(dto: UpdateAgencyDto, language: SupportedLang, agencyId: number) {
  // 1) Validate DTO
  const errors = await validate(dto);
  if (errors.length > 0) {
    throwValidationErrors(errors, language);
  }

  // 2) Build only the fields that user sent
  const dataToUpdate: any = {};

  if (dto.agency_name !== undefined) dataToUpdate.agency_name = dto.agency_name;
  if (dto.agency_email !== undefined) dataToUpdate.agency_email = dto.agency_email;
  if (dto.phone !== undefined) dataToUpdate.phone = dto.phone;
  if (dto.address !== undefined) dataToUpdate.address = dto.address;
  if (dto.website !== undefined) dataToUpdate.website = dto.website;

  // If no fields provided
  if (Object.keys(dataToUpdate).length === 0) {
    return {
      success: false,
      message: "No fields provided.",
    };
  }

  
  const updatedAgency = await this.agencyRepo.updateAgencyFields(agencyId, dataToUpdate);

  
  return {
    success: true,
    message: "Agency updated successfully.",
    data: updatedAgency,
  };
}
}