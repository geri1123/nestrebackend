
import {
  Inject,
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AGENCY_REPO,
  type IAgencyDomainRepository,
} from '../../domain/repositories/agency.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { GetAgencyByIdUseCase } from './get-agency-by-id.use-case';
import { ImageUtilsService } from '../../../../common/utils/image-utils.service';
import { SupportedLang, t } from '../../../../locales';
import { CloudinaryUploadResult } from '../../../../infrastructure/cloudinary/types/cloudinary-upload.result';

@Injectable()
export class UploadAgencyLogoUseCase {
  private readonly logger = new Logger(UploadAgencyLogoUseCase.name);

  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
    private readonly getAgencyById: GetAgencyByIdUseCase,
    private readonly imageUtilsService: ImageUtilsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(
    agencyId: number,
    file: Express.Multer.File,
    language: SupportedLang = 'al',
  ): Promise<{ url: string; publicId: string }> {
    this.logger.log(`Starting agency logo upload for agency ${agencyId}`);

    this.imageUtilsService.validateFile(file, language);
    this.logger.debug(`Image validation passed for agency ${agencyId}`);

    await this.getAgencyById.execute(agencyId, language);

    const logoData = await this.agencyRepository.findLogoById(agencyId);
    const oldLogoPublicId = logoData?.logoPublicId;

    let uploadResult: CloudinaryUploadResult | null = null;

    try {
      uploadResult = await this.cloudinary.uploadFile(
        file,
        `agency-logos/${agencyId}`,
      );

      if (!uploadResult?.url || !uploadResult?.publicId) {
        throw new BadRequestException({
          success: false,
          message: t('imageUploadFailed', language),
        });
      }

      this.logger.log(
        `Logo uploaded to Cloudinary for agency ${agencyId}: ${uploadResult.publicId}`,
      );

      await this.agencyRepository.updateFields(agencyId, {
        logo: uploadResult.url,
        logoPublicId: uploadResult.publicId,
      });

      this.logger.log(`Database updated for agency ${agencyId}`);

      if (oldLogoPublicId && !this.imageUtilsService.isDefaultImage(oldLogoPublicId)) {
        try {
          await this.cloudinary.deleteFile(oldLogoPublicId);
          this.logger.log(
            `Old logo deleted for agency ${agencyId}: ${oldLogoPublicId}`,
          );
        } catch (err) {
          this.logger.warn(
            `Failed to delete old Cloudinary logo for agency ${agencyId}: ${oldLogoPublicId}`,
            err,
          );
        }
      }

      this.logger.log(
        `Agency logo upload completed successfully for agency ${agencyId}`,
      );

      return {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    } catch (error) {
      if (uploadResult?.publicId) {
        this.logger.error(
          `Database update failed for agency ${agencyId}. Rolling back Cloudinary upload: ${uploadResult.publicId}`,
        );
        try {
          await this.cloudinary.deleteFile(uploadResult.publicId);
          this.logger.log(
            `Successfully rolled back Cloudinary upload: ${uploadResult.publicId}`,
          );
        } catch (rollbackErr) {
          this.logger.error(
            `Failed to rollback Cloudinary upload: ${uploadResult.publicId}`,
            rollbackErr,
          );
        }
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error during agency logo upload for agency ${agencyId}`,
        error,
      );
      throw new InternalServerErrorException({
        success: false,
        message: t('failedToUpdateAgencyLogo', language),
      });
    }
  }
}