import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { AppConfigService } from '../config/config.service';
import * as streamifier from 'streamifier';
import { CloudinaryUploadResult } from './types/cloudinary-upload.result';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: AppConfigService) {
    cloudinary.config({
      cloud_name: this.config.cloudinaryCloudName,
      api_key: this.config.cloudinaryApiKey,
      api_secret: this.config.cloudinaryApiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          max_bytes: 5 * 1024 * 1024, // 5MB limit
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error(`Failed to upload to Cloudinary: ${error?.message}`, error);
            return reject(error);
          }

          this.logger.log(`Successfully uploaded to Cloudinary: ${result.public_id}`);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Deleted Cloudinary image: ${publicId}, result: ${result.result}`);
    } catch (error) {
      this.logger.error(`Failed to delete Cloudinary image: ${publicId}`, error);
      throw error;
    }
  }
}