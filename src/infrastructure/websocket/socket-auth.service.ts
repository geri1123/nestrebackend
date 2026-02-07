import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class SocketAuthService {
  private readonly logger = new Logger(SocketAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  extractToken(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const cookies = this.parseCookies(cookieHeader);
      if (cookies.token) {
        this.logger.debug(`Token from cookies - socket ${client.id}`);
        return cookies.token;
      }
    }

    // Priority 2: Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    // Priority 3: Auth object
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    // Priority 4: Query parameter (least secure)
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }

  verifyToken(token: string): { userId: number } | null {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.jwtSecret,
      });

      if (!decoded.userId) {
        return null;
      }

      return { userId: decoded.userId };
    } catch (error:any) {
      this.logger.warn(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
      return cookies;
    }, {} as Record<string, string>);
  }
}