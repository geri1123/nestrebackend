import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AppConfigService } from '../../../../infrastructure/config/config.service';

export interface GoogleUserPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture?: string | null;
}

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(private readonly config: AppConfigService) {
    this.client = new OAuth2Client(config.googleClientId, config.googleClientSecret);
  }

  async verify(idToken: string): Promise<GoogleUserPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

      return {
        id: payload.sub!,                        
        email: payload.email!,
        firstName: payload.given_name || null,
        lastName: payload.family_name || null,
        profilePicture: payload.picture || null, 
      };
    } catch (err) {
      throw new UnauthorizedException('Failed to verify Google login');
    }
  }
}