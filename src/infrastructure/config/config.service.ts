

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
get emailFrom(): string {
  return this.configService.get<string>('EMAIL_FROM', '');
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

  get jwtAccessSecret(): string {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_ACCESS_SECRET must be set and at least 32 characters. ' +
        'Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
      );
    }
    return secret;
  }

  get jwtRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_REFRESH_SECRET must be set and at least 32 characters. ' +
        'Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
      );
    }
    if (secret === this.jwtAccessSecret) {
      throw new Error('JWT_REFRESH_SECRET must differ from JWT_ACCESS_SECRET.');
    }
    return secret;
  }

  // Client
  get clientBaseUrl(): string {
    return this.configService.get<string>('CLIENT_BASE_URL', 'http://localhost:3000');
  }
get corsOrigins(): string[] {
  const origins = this.configService.get<string>('CORS_ORIGINS', this.clientBaseUrl);
  return origins.split(',').map(o => o.trim());
}
  // Email
 get emailHost(): string {
  return this.configService.get<string>('EMAIL_HOST', 'smtp-relay.brevo.com');
}
get emailPort(): number {
  return parseInt(this.configService.get<string>('EMAIL_PORT', '587'), 10);
}
get emailUser(): string {
  return this.configService.get<string>('EMAIL_USER', '');
}
get emailPass(): string {
  return this.configService.get<string>('EMAIL_PASS', '');
}
get supportEmail(): string {
  return this.configService.get<string>('SUPPORT_EMAIL', '');
}
get brevoApiKey(): string {
  return this.configService.get<string>('BREVO_API_KEY', '');
}
get passwordResetTokenExpiration(): number {
  return Number(this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRATION', 10)); // default 10 minutes
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
//google auth 2.0
get googleClientId(): string {
  return this.configService.get<string>('GOOGLE_CLIENT_ID' ,'') ;
}

get googleClientSecret(): string {
  return this.configService.get<string>('GOOGLE_CLIENT_SECRET','');
}

//mongo
get mongoUri(): string {
  return this.configService.get<string>('MONGO_URI','');
}

//cloudinary
get cloudinaryCloudName(): string {
  return this.configService.get<string>('CLOUDINARY_CLOUD_NAME')!;
}

get cloudinaryApiKey(): string {
  return this.configService.get<string>('CLOUDINARY_API_KEY')!;
}

get cloudinaryApiSecret(): string {
  return this.configService.get<string>('CLOUDINARY_API_SECRET')!;
}

// Whop
get whopApiKey(): string {
  return this.configService.get<string>('WHOP_API_KEY', '');
}
get whopCompanyId(): string {
  return this.configService.get<string>('WHOP_COMPANY_ID', '');
}
get whopAccessPassId(): string {
  return this.configService.get<string>('WHOP_ACCESS_PASS_ID', '');
}
get whopWebhookSecret(): string {
  return this.configService.get<string>('WHOP_WEBHOOK_SECRET', '');
}
get whopSuccessRedirectUrl(): string {
  return this.configService.get<string>('WHOP_SUCCESS_REDIRECT_URL', `${this.clientBaseUrl}/wallet?topup=success`);
}
get whopCancelRedirectUrl(): string {
  return this.configService.get<string>('WHOP_CANCEL_REDIRECT_URL', `${this.clientBaseUrl}/wallet?topup=cancelled`);
}
// Paysera
get payseraProjectId(): string {
  return this.configService.get<string>('PAYSERA_PROJECT_ID', '');
}
 
get payseraSignPassword(): string {
  return this.configService.get<string>('PAYSERA_SIGN_PASSWORD', '');
}
 
get payseraCallbackUrl(): string {
  return this.configService.get<string>(
    'PAYSERA_CALLBACK_URL',
    `${this.clientBaseUrl}/wallet/webhooks/paysera`,
  );
}
 
get payseraSuccessUrl(): string {
  return this.configService.get<string>(
    'PAYSERA_SUCCESS_URL',
    `${this.clientBaseUrl}/wallet?topup=success`,
  );
}
 
get payseraCancelUrl(): string {
  return this.configService.get<string>(
    'PAYSERA_CANCEL_URL',
    `${this.clientBaseUrl}/wallet?topup=cancelled`,
  );
}
 
}