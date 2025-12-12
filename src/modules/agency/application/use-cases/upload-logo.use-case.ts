import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';
import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UploadAgencyLogoUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly getAgencyById: GetAgencyByIdUseCase,
    private readonly imageUtilsService: ImageUtilsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(
    agencyId: number,
    file: Express.Multer.File,
    language: SupportedLang = 'al',
  ): Promise<string> {
    // Validate file
    this.imageUtilsService.validateFile(file, language);

    // Get agency and verify existence
    await this.getAgencyById.execute(agencyId, language);

    // Get current logo
    const agency = await this.agencyRepository.findLogoById(agencyId);
    const oldImagePath = agency?.logo;

    // Delete old image if exists and not default
    if (oldImagePath && !this.imageUtilsService.isDefaultImage(oldImagePath)) {
      try {
        await this.firebaseService.deleteFile(oldImagePath);
        console.log(`Deleted old agency logo: ${oldImagePath}`);
      } catch (error) {
        console.warn(`Failed to delete old agency logo:`, error);
      }
    }

    // Upload new image
    const destination = `agency-logo/${agencyId}`;
    const uploadedPath = await this.firebaseService.uploadFile(file, destination);

    if (!uploadedPath) {
      throw new BadRequestException({
        success: false,
        message: t('imageUploadFailed', language),
      });
    }

    // Update agency with new logo path
    try {
      await this.agencyRepository.updateFields(agencyId, { logo: uploadedPath });
    } catch (error) {
      // Rollback: delete uploaded image
      await this.firebaseService.deleteFile(uploadedPath);
      throw new BadRequestException({
        success: false,
        message: t('failedToUpdateAgencyLogo', language),
      });
    }

    return this.firebaseService.getPublicUrl(uploadedPath)!;
  }
}