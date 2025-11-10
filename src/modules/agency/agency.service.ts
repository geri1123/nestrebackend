import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AgencyRepository } from "../../repositories/agency/agency.repository";
import { RegisterAgencyOwnerDto } from "../auth/dto/register-agency-owner.dto";
import { SupportedLang, t } from "../../locales";

import { AgencyInfo } from "./types/agency-info";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
import { RequestWithUser } from "../../common/types/request-with-user.interface";
@Injectable()
export class AgencyService {
  constructor(
    private readonly agencyRepo: AgencyRepository,
    private readonly firebaseService: FirebaseService,
   
  ) {}
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
   

    const agency = await this.agencyRepo.findByOwnerUserId(userId);

    if (!agency) {
      throw new BadRequestException({
        success: false,
        message: t('agencyNotFound', language),
      });
    }

    await this.agencyRepo.activateAgency(agency.id);
    
  }
  async getAgencyWithOwnerById(agencyId: number) {
    return this.agencyRepo.findWithOwnerById(agencyId);
  }
async getPaginatedAgencies(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  // Fetch agencies and total count in parallel
  const [agencies, total] = await Promise.all([
    this.agencyRepo.getAllAgencies(skip, limit),
    this.agencyRepo.countAgencies(),
  ]);

  return {
    total,
    page,
    limit,
    agencies: agencies.map(a => ({
      id: a.id,
      name: a.agency_name,
      logo: a.logo ? this.firebaseService.getPublicUrl(a.logo) : null,
      address: a.address,
      created_at: a.created_at.toLocaleDateString('en-GB'),
    })),
  };
}
async getAgencyInfo(
  agencyId: number,
  language: SupportedLang = 'al',
  isProtectedRoute = false,
  req?: RequestWithUser
): Promise<AgencyInfo | null> {
  const agencyInfo = await this.agencyRepo.getAgencyInfoByOwner(agencyId); 

  if (!agencyInfo) {
    throw new BadRequestException({
      success: false,
      message: t('agencyNotFound', language),
    });
  }

  // Public page
 if (!isProtectedRoute && agencyInfo.status !== 'active') {
  throw new NotFoundException(t('agencyNotFound', language));
}
  // check ownership or permissions
  if (isProtectedRoute) {
    const isOwner = req?.user?.id === agencyInfo.owner_user_id;
    const isAgent =
      req?.user?.role === 'agent' && req?.agencyId === agencyInfo.id;

    if (!isOwner && !isAgent) {
      throw new ForbiddenException({
    success: false,
    message: t('unauthorizedAccess', language),
  });
    }
  }

  return agencyInfo;
}

}