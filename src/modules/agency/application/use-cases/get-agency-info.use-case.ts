import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AgencyInfoVO } from '../../domain/value-objects/agency-info.vo';
import { SupportedLang, t } from '../../../../locales';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';

@Injectable()
export class GetAgencyInfoUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(
    agencyId: number,
    language: SupportedLang = 'al',
    isProtectedRoute = false,
  ): Promise<AgencyInfoVO> {
    const agencyInfo = await this.agencyRepository.getAgencyInfoByOwner(agencyId);

    if (!agencyInfo) {
      throw new BadRequestException({
        success: false,
        message: t('agencyNotFound', language),
      });
    }

    // Only hide suspended agencies for public/non-protected routes
    if (!isProtectedRoute && agencyInfo.status !== 'active') {
      throw new NotFoundException(t('agencyNotFound', language));
    }

    // Transform logo path to public URL
    if (agencyInfo.logo) {
      agencyInfo.logo = this.firebaseService.getPublicUrl(agencyInfo.logo) || null;
    }

    return agencyInfo;
  }
}