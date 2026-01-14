

import { Inject, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user.interface';
import { AuthTokenService , CustomJwtPayload } from '../../infrastructure/auth/services/auth-token.service';
import {type IUserDomainRepository, USER_REPO } from '../../modules/users/domain/repositories/user.repository.interface';

@Injectable()
export class SoftAuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    @Inject(USER_REPO)
     private readonly userRepo: IUserDomainRepository,
  ) {}

  extractToken(req: any): string | null {
    const authHeader = req.headers.authorization;
    return (
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)
    );
  }

  async attachUserIfExists(req: RequestWithUser) {
    const token = this.extractToken(req);
    if (!token) return;

    try {
      const decoded: CustomJwtPayload = this.authTokenService.verify(token);

      const user = await this.userRepo.findById(decoded.userId);
      if (!user) return;

      req.userId = user.id;
      req.user = user; 
    } catch {
     
    }
  }
}
// import { Inject, Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { CustomJwtPayload } from '../../infrastructure/auth/auth-token.service';
// import {type IUserDomainRepository, USER_REPO } from '../../modules/users/domain/repositories/user.repository.interface';

// @Injectable()
// export class SoftAuthService {
//   constructor(
//     private readonly jwtService: JwtService,
//       @Inject(USER_REPO)
//     private readonly userRepo: IUserDomainRepository,
//   ) {}

//   async attachUserIfExists(req: RequestWithUser) {
//     const authHeader = req.headers.authorization;
//     const token =
//       req.cookies?.token ||
//       (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

//     if (!token) return;

//     try {
     
// const decoded = this.jwtService.verify<CustomJwtPayload>(token);

//       const user = await this.userRepo.findById(decoded.userId);
//       if (!user) return;

//       req.userId = user.id;
//     } catch (e) {
     
//     }
//   }
// }