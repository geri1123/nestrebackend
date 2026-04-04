import { Injectable, ForbiddenException } from '@nestjs/common';
import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../../locales';
import { AgencyStatus } from '@prisma/client';
import {
  IAgencyOwnerProfilePort,
  AgencyData,
} from '../../../modules/agency/application/ports/agency-owner-profile.port';

@Injectable()
export class AgencyOwnerContextService implements IAgencyOwnerProfilePort {
  constructor(
    private readonly getAgencyByOwner: GetAgencyByOwnerUseCase,
  ) {}

  async getAgencyData(userId: number, lang: string): Promise<AgencyData> {
    const agency = await this.getAgencyByOwner.execute(userId, lang as SupportedLang);

    return {
      id: agency.id,
      name: agency.agencyName,
      email: agency.agencyEmail ?? null,
      logo: agency.logo ?? null,
      status: agency.status,
      address: agency.address ?? null,
      phone: agency.phone ?? null,
      website: agency.website ?? null,
      licenseNumber: agency.licenseNumber,
      publicCode: agency.publicCode ?? null,
    };
  }

  async loadAgencyOwnerContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
    const agency = await this.getAgencyByOwner.execute(req.user!.id, lang);

    req.agencyId = agency.id;
    req.agencyStatus = agency.status;
    req.isAgencyOwner = true;
  }

  validateAgencyStatus(req: RequestWithUser, lang: SupportedLang): void {
    if (req.agencyStatus === AgencyStatus.suspended) {
      throw new ForbiddenException(t('agencySuspended', lang));
    }
  }
}