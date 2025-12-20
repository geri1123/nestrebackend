import { Injectable, Logger } from '@nestjs/common';

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

@Injectable()
export class SocketRateLimitService {
  private readonly logger = new Logger(SocketRateLimitService.name);
  private connectionAttempts = new Map<string, number[]>();
  private config: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    maxAttempts: 10,
  };

  checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const attempts = this.connectionAttempts.get(ip) || [];

    const recentAttempts = attempts.filter(
      (time) => now - time < this.config.windowMs
    );

    if (recentAttempts.length >= this.config.maxAttempts) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return false;
    }

    recentAttempts.push(now);
    this.connectionAttempts.set(ip, recentAttempts);

    // Periodic cleanup
    if (this.connectionAttempts.size > 100) {
      this.cleanup();
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, attempts] of this.connectionAttempts.entries()) {
      const recentAttempts = attempts.filter(
        (time) => now - time < this.config.windowMs
      );
      if (recentAttempts.length === 0) {
        this.connectionAttempts.delete(ip);
      } else {
        this.connectionAttempts.set(ip, recentAttempts);
      }
    }
  }

  clear(): void {
    this.connectionAttempts.clear();
  }
}