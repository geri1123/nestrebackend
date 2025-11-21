import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../repositories/user/user.repository';
import { RequestWithUser } from '../types/request-with-user.interface';

@Injectable()
export class SoftAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly config: ConfigService,
  ) {}

  async attachUserIfExists(req: RequestWithUser) {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) return;

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepo.findById(decoded.userId);
      if (!user) return;

      req.user = user;
      req.userId = user.id;
    } catch (e) {
     
    }
  }
}