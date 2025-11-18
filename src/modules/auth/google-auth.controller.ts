// import { Controller, Post, Body, Req } from '@nestjs/common';
// import { GoogleAuthService } from './google-auth.service';
// import { SupportedLang } from '../../locales';
// import { type RequestWithLang } from '../../middlewares/language.middleware';

// @Controller('auth')
// export class GoogleAuthController {
//   constructor(private readonly googleAuthService: GoogleAuthService) {}

//   @Post('google/login')
//   async loginWithGoogle(
//     @Body('idToken') idToken: string,
//     @Body('role') role: 'user' | 'agent' | 'agency_owner',
//     @Req() req:RequestWithLang, 
//   ) {
//     const lang: SupportedLang = req.language || 'al';
//     return this.googleAuthService.loginOrRegisterWithGoogle(idToken, role, lang);
//   }
// }