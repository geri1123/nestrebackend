// firebase/firebase.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { Bucket } from '@google-cloud/storage';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;

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

  getBucket(): Bucket {
    return this.bucket;
  }

  async uploadFile(file: Express.Multer.File, destination: string): Promise<string> {
    const fileName = `${destination}/${Date.now()}_${file.originalname}`;
    const fileUpload = this.bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: true,
    });

    return fileName;
  }

  getPublicUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    return `https://storage.googleapis.com/${this.appConfig.firebaseBucket}/${filePath}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.bucket.file(filePath).delete();
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const [url] = await this.bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }
}
