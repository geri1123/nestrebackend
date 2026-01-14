
// import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// export interface CustomJwtPayload {
//   userId: number;
//   username: string;
//   email: string;
//   role: string;
// }
// @Injectable()
// export class AuthTokenService {
//   constructor(private readonly jwtService: JwtService) {}

//   generate(user: any, expiresInDays = 1): string {
//     const payload :CustomJwtPayload = {
//       userId: Number(user.id),
//       username: String(user.username),
//       email: String(user.email),
//       role: String(user.role),
//     };

//     const expiresInSeconds = expiresInDays * 24 * 60 * 60;

//     return this.jwtService.sign(payload, {
//       expiresIn: expiresInSeconds,
//     });


//   }
   
  
// }

// modules/auth/infrastructure/services/auth-token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
export interface CustomJwtPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  generate(user: any, expiresInDays = 1): string {
    const payload: CustomJwtPayload = {
      userId: Number(user.id),
      username: String(user.username),
      email: String(user.email),
      role: String(user.role),
    };

    const expiresInSeconds = expiresInDays * 24 * 60 * 60;

    return this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: expiresInSeconds,
    });
  }

  verify(token: string): CustomJwtPayload {
    return this.jwtService.verify<CustomJwtPayload>(token, {
      secret: this.configService.jwtSecret,
    });
  }
}