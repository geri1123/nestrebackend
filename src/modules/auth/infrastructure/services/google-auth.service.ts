import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AppConfigService } from '../../../../infrastructure/config/config.service';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(private readonly config: AppConfigService) {
    this.client = new OAuth2Client(config.googleClientId, config.googleClientSecret);
  }

  async verify(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

      return {
        email: payload.email!,
        firstName: payload.given_name || null,
        lastName: payload.family_name || null,
      };
    } catch (err) {
      throw new UnauthorizedException('Failed to verify Google login');
    }
  }
}
