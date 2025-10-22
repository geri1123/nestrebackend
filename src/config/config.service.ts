import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  // Database
  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }
  get dbPort(): number {
    return Number(this.configService.get<number>('DB_PORT', 3306));
  }
  get dbUser(): string {
    return this.configService.get<string>('DB_USER', 'root');
  }
  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', '');
  }
  get dbName(): string {
    return this.configService.get<string>('DB_NAME', '');
  }

  // Server
  get port(): number {
    return Number(this.configService.get<number>('PORT', 8080));
  }
  get corsOrigin(): string {
    return this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  }

  // JWT
  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', '');
  }

  // Client
  get clientBaseUrl(): string {
    return this.configService.get<string>('CLIENT_BASE_URL', 'http://localhost:3000');
  }

  // Email
  get emailUser(): string {
    return this.configService.get<string>('EMAIL_USER', '');
  }
  get emailPass(): string {
    return this.configService.get<string>('EMAIL_PASS', '');
  }
  get emailService(): string {
    return this.configService.get<string>('EMAIL_SERVICE', 'gmail');
  }

  // Firebase
  get firebaseBucket(): string {
    return this.configService.get<string>('FIREBASE_STORAGE_BUCKET', '');
  }
 get firebaseProjectId(): string {
    return this.configService.get<string>('FIREBASE_PROJECT_ID')!;
  }

  get firebasePrivateKey(): string {
    return this.configService.get<string>('FIREBASE_PRIVATE_KEY')!.replace(/\\n/g, '\n');
  }

  get firebaseClientEmail(): string {
    return this.configService.get<string>('FIREBASE_CLIENT_EMAIL')!;
  }

  get firebaseClientId(): string {
    return this.configService.get<string>('FIREBASE_CLIENT_ID')!;
  }

 
  // Node environment
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  //redis
   get redisUrl(): string {
    return this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
  }

  get redisTTL(): number {
    return Number(this.configService.get<number>('REDIS_TTL', 3600));
  }

}