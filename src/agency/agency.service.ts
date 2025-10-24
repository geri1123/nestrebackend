import { Injectable, BadRequestException } from "@nestjs/common";
import { AgencyRepository } from "../repositories/agency/agency.repository";
import { RegisterAgencyOwnerDto } from "../auth/dto/register-agency-owner.dto";
import { SupportedLang, t } from "../locales";

@Injectable()
export class AgencyService {
  constructor(private readonly agencyRepo: AgencyRepository) {}

  /**
   * Validate agency data before creating user
   * This allows us to fail fast before any database writes
   */
  async validateAgencyData(dto: RegisterAgencyOwnerDto, language: SupportedLang = 'al') {
    const errors: Record<string, string[]> = {};

    if (await this.agencyRepo.agencyNameExist(dto.agency_name)) {
      errors.agency_name = [t("agencyExists", language)];
    }

    if (await this.agencyRepo.licenseExists(dto.license_number)) {
      errors.license_number = [t("licenseExists", language)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }
  }

  async createAgency(
    dto: RegisterAgencyOwnerDto, 
    userId: number, 
    language: SupportedLang = "al"
  ) {
    // Note: Validation should be done BEFORE calling this method
    // to avoid partial state in transactions
    
    return this.agencyRepo.create({
      agency_name: dto.agency_name,
      license_number: dto.license_number,
      address: dto.address,
      owner_user_id: userId,
    });
  }

  async activateAgencyByOwner(userId: number, language: SupportedLang = 'al') {
    console.log('🏢 [AgencyService] activateAgencyByOwner called with userId:', userId);
    
    const agency = await this.agencyRepo.findByOwnerUserId(userId);
    console.log('🏢 [AgencyService] Agency lookup result:', agency);
    
    if (!agency) {
      console.error('❌ [AgencyService] No agency found for userId:', userId);
      throw new BadRequestException({
        success: false,
        message: t('agencyNotFound', language),
      });
    }

    console.log('🏢 [AgencyService] Found agency, calling activateAgency with ID:', agency.id);
    
    try {
      await this.agencyRepo.activateAgency(agency.id);
      console.log('✅ [AgencyService] Agency activated successfully:', agency.id);
    } catch (error) {
      console.error('❌ [AgencyService] Failed to activate agency:', error);
      throw error;
    }
  }
}