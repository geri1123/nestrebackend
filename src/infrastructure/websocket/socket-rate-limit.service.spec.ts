import { SocketRateLimitService } from './socket-rate-limit.service';

describe('SocketRateLimitService', () => {
  let service: SocketRateLimitService;

  beforeEach(() => {
    service = new SocketRateLimitService();
  });

  afterEach(() => {
    service.clear();
  });

  it('should allow connections under limit', () => {
    for (let i = 0; i < 10; i++) {
      expect(service.checkRateLimit('127.0.0.1')).toBe(true);
    }
  });

  it('should block when limit exceeded', () => {
    for (let i = 0; i < 10; i++) {
      service.checkRateLimit('127.0.0.1');
    }

    expect(service.checkRateLimit('127.0.0.1')).toBe(false);
  });

  it('should track rate limits per IP', () => {
    for (let i = 0; i < 10; i++) {
      service.checkRateLimit('1.1.1.1');
    }

    expect(service.checkRateLimit('2.2.2.2')).toBe(true);
  });
});