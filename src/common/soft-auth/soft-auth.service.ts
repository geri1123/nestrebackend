import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../modules/users/infrastructure/persistence/user.repository';
import { RequestWithUser } from '../types/request-with-user.interface';
import { AppConfigService } from '../../infrastructure/config/config.service';

@Injectable()
export class SoftAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly config: AppConfigService,
  ) {}

  async attachUserIfExists(req: RequestWithUser) {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) return;

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.jwtSecret,
      });

      const user = await this.userRepo.findById(decoded.userId);
      if (!user) return;

      req.userId = user.id;
    } catch (e) {
     
    }
  }
}