import { BadRequestException, Injectable } from "@nestjs/common";
import { SupportedLang, t } from "../../locales";

@Injectable()
export class ImageUtilsService {
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly DEFAULT_IMAGE_PREFIXES = ['defaults/', 'system/'];

  validateFile(file: Express.Multer.File, language: SupportedLang): void {
    if (!file) {
      throw new BadRequestException({
        success: false,
        message: t('noImageUploaded', language),
      });
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({
        success: false,
        message: t('invalidImageType', language),
      });
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException({
        success: false,
        message: t('imageTooLarge', language),
      });
    }
  }

  isDefaultImage(path: string): boolean {
    return this.DEFAULT_IMAGE_PREFIXES.some(prefix => path.startsWith(prefix));
  }
}