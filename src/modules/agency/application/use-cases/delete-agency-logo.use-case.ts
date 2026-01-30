import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class DeleteAgencyLogoUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly getAgencyById: GetAgencyByIdUseCase,
  ) {}

  async execute(agencyId: number, language: SupportedLang = 'al'): Promise<void> {
    // Verify agency exists
    await this.getAgencyById.execute(agencyId, language);

    // Get current logo
    const agency = await this.agencyRepository.findLogoById(agencyId);
    const oldImagePath = agency?.logo;

    if (!oldImagePath) {
      throw new BadRequestException({
        success: false,
        message: t('noimagetodelete', language),
      });
    }

    try {
      await oldImagePath;
    } catch (error) {
      console.warn(`Failed to delete agency logo from storage:`, error);
    }

    // Remove from database
    await this.agencyRepository.deleteLogo(agencyId);
  }
}
