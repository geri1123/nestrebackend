import { Injectable, BadRequestException } from "@nestjs/common";
import { AgencyRepository } from "../repositories/agency/agency.repository";
import { RegisterAgencyOwnerDto } from "../auth/dto/register-agency-owner.dto";
import { SupportedLang, t } from "../locales";

@Injectable()
export class AgencyService {
  constructor(private readonly agencyRepo: AgencyRepository) {}
    async checkAgencyPublicCode(publicCode: string) {
    return await this.agencyRepo.findByPublicCode(publicCode);
  }
  async getAgencyByPublicCode(publicCode: string) {
    const agency = await this.agencyRepo.findByPublicCode(publicCode);
    if (!agency) {
      return null; // Or throw an error if you prefer
    }
    return agency;
  }
  async getAgencyByOwnerOrFail(ownerUserId: number, language: SupportedLang) {
  const agency = await this.agencyRepo.findByOwnerUserId(ownerUserId);
  if (!agency) {
    throw new BadRequestException({
      success: false,
      message: t('agencyNotFound', language),
    });
  }
  return agency;
}
  async checkAgencyExists(
    agencyName: string,
    licenseNumber: string,
    language: SupportedLang = 'al'
  ): Promise<Record<string, string[]>> {
    const errors: Record<string, string[]> = {};

    if (await this.agencyRepo.agencyNameExist(agencyName)) {
      errors.agency_name = [t("agencyExists", language)];
    }

    if (await this.agencyRepo.licenseExists(licenseNumber)) {
      errors.license_number = [t("licenseExists", language)];
    }

    return errors;
  }

 
  async createAgency(
    dto: RegisterAgencyOwnerDto,
    userId: number,
    language: SupportedLang = "al"
  ): Promise<number> {
    console.log('🏢 [AgencyService] Creating agency');

    return this.agencyRepo.create({
      agency_name: dto.agency_name,
      license_number: dto.license_number,
      address: dto.address,
      owner_user_id: userId,
    });
  }

  async activateAgencyByOwner(userId: number, language: SupportedLang = 'al') {
    console.log('🏢 [AgencyService] Activating agency for user:', userId);

    const agency = await this.agencyRepo.findByOwnerUserId(userId);

    if (!agency) {
      throw new BadRequestException({
        success: false,
        message: t('agencyNotFound', language),
      });
    }

    await this.agencyRepo.activateAgency(agency.id);
    console.log('✅ [AgencyService] Agency activated:', agency.id);
  }
}