
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

    // 1️⃣ Validate file
    this.imageUtilsService.validateFile(file, language);
    this.logger.debug(`Image validation passed for agency ${agencyId}`);

    // 2️⃣ Verify agency exists
    await this.getAgencyById.execute(agencyId, language);

    // 3️⃣ Get current logo details
    const logoData = await this.agencyRepository.findLogoById(agencyId);
    const oldLogoPublicId = logoData?.logoPublicId;

    let uploadResult: CloudinaryUploadResult | null = null;

    try {
      // 4️⃣ Upload new logo to Cloudinary
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

      // 5️⃣ Update agency in database
      await this.agencyRepository.updateFields(agencyId, {
        logo: uploadResult.url,
        logoPublicId: uploadResult.publicId,
      });

      this.logger.log(`Database updated for agency ${agencyId}`);

      // 6️⃣ Delete old logo (best effort) - only after successful DB update
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
          // Don't throw - this is best effort
        }
      }

      this.logger.log(
        `Agency logo upload completed successfully for agency ${agencyId}`,
      );

      // 7️⃣ Return result
      return {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    } catch (error) {
      // Rollback: delete newly uploaded logo if DB update failed
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

      // Re-throw the original error
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