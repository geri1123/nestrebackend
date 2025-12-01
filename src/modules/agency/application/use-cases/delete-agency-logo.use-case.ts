import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class DeleteAgencyLogoUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly getAgencyById: GetAgencyByIdUseCase,
    private readonly firebaseService: FirebaseService,
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

    // Delete from storage
    try {
      await this.firebaseService.deleteFile(oldImagePath);
    } catch (error) {
      console.warn(`Failed to delete agency logo from storage:`, error);
    }

    // Remove from database
    await this.agencyRepository.deleteLogo(agencyId);
  }
}
