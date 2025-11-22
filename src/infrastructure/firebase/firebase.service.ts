import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { Bucket } from '@google-cloud/storage';
import { AppConfigService } from '../config/config.service';
import sharp from 'sharp';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private readonly IMAGE_MAX_WIDTH = 800;
  private readonly IMAGE_MAX_HEIGHT = 800;
  private readonly IMAGE_QUALITY = 85;
  private readonly MIN_VALID_SIZE = 100;

  constructor(private appConfig: AppConfigService) {}

  onModuleInit() {
    const serviceAccount = {
      type: 'service_account',
      project_id: this.appConfig.firebaseProjectId,
      private_key: this.appConfig.firebasePrivateKey,
      client_email: this.appConfig.firebaseClientEmail,
      client_id: this.appConfig.firebaseClientId,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${this.appConfig.firebaseClientEmail}`,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: this.appConfig.firebaseBucket,
      });
    }

    this.bucket = admin.storage().bucket();
  }

  private sanitizeFileName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .substring(0, 100);
  }

  async uploadFile(file: Express.Multer.File, destination: string): Promise<string> {
    const safeName = this.sanitizeFileName(file.originalname);
    const timestamp = Date.now();
    
 
    const fileName = `${destination}/${timestamp}_${safeName}`;
    
    console.log(`📁 Uploading to: ${fileName}`);
    
    const fileUpload = this.bucket.file(fileName);

    let buffer = file.buffer;
    let contentType = file.mimetype;

    // Compress images
    if (file.mimetype.startsWith('image/')) {
      try {
        const compressedBuffer = await this.compressImage(file.buffer);
        
        if (compressedBuffer && compressedBuffer.length >= this.MIN_VALID_SIZE) {
          const originalSize = file.buffer.length;
          const compressedSize = compressedBuffer.length;
          
          if (compressedSize < originalSize || originalSize > 1024 * 1024) {
            buffer = compressedBuffer;
            contentType = 'image/jpeg';
            console.log(` Compressed: ${originalSize} → ${compressedSize} bytes (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
          } else {
            console.log(` Using original (compressed was larger)`);
          }
        } else {
          console.warn(`Compression produced invalid output, using original`);
        }
      } catch (error) {
        console.error(' Image compression failed:', error);
        console.log(' Falling back to original image');
      }
    }

    
    await fileUpload.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          originalName: file.originalname,
          originalSize: file.buffer.length.toString(),
          uploadedAt: new Date().toISOString(),
        },
      },
      public: true,
    });

  
    return fileName;
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image: no dimensions');
      }

      console.log(` Processing image: ${metadata.width}x${metadata.height} ${metadata.format}`);

      const compressedBuffer = await sharp(buffer)
        .resize(this.IMAGE_MAX_WIDTH, this.IMAGE_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ 
          quality: this.IMAGE_QUALITY,
          mozjpeg: true,
        })
        .toBuffer();

      if (!compressedBuffer || compressedBuffer.length < this.MIN_VALID_SIZE) {
        throw new Error(`Compression produced invalid output: ${compressedBuffer?.length || 0} bytes`);
      }

      return compressedBuffer;
    } catch (error) {
      console.error('Sharp compression error:', error);
      throw error;
    }
  }

  getPublicUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    return `https://storage.googleapis.com/${this.appConfig.firebaseBucket}/${filePath}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (exists) {
        await file.delete();
        console.log(`Deleted file: ${filePath}`);
      } else {
        console.log(` File not found (already deleted?): ${filePath}`);
      }
    } catch (error: any) {
      if (error.code === 404) {
        console.log(`File not found: ${filePath}`);
        return;
      }
      console.error(` Failed to delete file ${filePath}:`, error.message);
    }
  }

 
  async deleteUserFolder(userId: number, folderPrefix: string = 'profile-images'): Promise<void> {
    try {
      const prefix = `${folderPrefix}/${userId}/`;
      console.log(` Deleting folder: ${prefix}`);
      
      await this.bucket.deleteFiles({ prefix });
      console.log(` Deleted all files in: ${prefix}`);
    } catch (error) {
      console.error(` Failed to delete folder:`, error);
    }
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const [url] = await this.bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }
}
