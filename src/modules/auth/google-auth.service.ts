// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { OAuth2Client } from 'google-auth-library';
// import { AppConfigService } from '../../config/app-config.service';
// import { UserService } from '../users/services/users.service';
// import { SupportedLang, t } from '../../locales';
// import { randomInt } from 'crypto';

// @Injectable()
// export class GoogleAuthService {
//   private client: OAuth2Client;

//   constructor(
//     private readonly config: AppConfigService,
//     private readonly userService: UserService,
//   ) {
//     this.client = new OAuth2Client(this.config.googleclientId);
//   }

//   async verifyGoogleToken(idToken: string) {
//     const ticket = await this.client.verifyIdToken({
//       idToken,
//       audience: this.config.googleclientId,
//     });
//     return ticket.getPayload();
//   }

//   async loginOrRegisterWithGoogle(
//     idToken: string,
//     role: 'user' | 'agent' | 'agency_owner',
//     lang: SupportedLang = 'al',
//   ) {
//     const payload = await this.verifyGoogleToken(idToken);

//     if (!payload?.email || !payload?.given_name) {
//       throw new UnauthorizedException({
//         success: false,
//         message: t('googleAuthFailed', lang),
//       });
//     }

//     // Check if user already exists by Google ID or email
//     let user = await this.userService.findByGoogleId(payload.sub);

//     if (!user) {
//       user = await this.userService.findByIdentifier(payload.email);
//     }

//     if (!user) {
//       // Create new user
//       const username = await this.generateUniqueUsername(payload.given_name);
//       user = await this.userService.createUser({
//         username,
//         email: payload.email,
//         first_name: payload.given_name,
//         last_name: payload.family_name || '',
//         password: Math.random().toString(36).slice(-10),
//         role,
//         google_user: true,
//         google_id: payload.sub,
//       });
//     } else if (!user.google_id) {
//       // Link Google ID to existing account
//       await this.userService.linkGoogleId(user.id, payload.sub);
//     }

//     // Create JWT
//     const token = this.userService.createJwtToken(user.id, user.role);

//     return { user, token };
//   }

//   private async generateUniqueUsername(firstName: string) {
//     let username: string;
//     let exists: boolean;

//     do {
//       const randomNum = randomInt(100, 999); // 3 random digits
//       username = `${firstName}${randomNum}`.toLowerCase();
//       exists = await this.userService.usernameExists(username);
//     } while (exists);

//     return username;
//   }
// }