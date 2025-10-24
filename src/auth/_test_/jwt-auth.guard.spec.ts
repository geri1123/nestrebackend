// jwt-auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../repositories/user/user.repository';
import { AgencyRepository } from '../../repositories/agency/agency.repository';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let userRepo: jest.Mocked<UserRepository>;
  let agencyRepo: jest.Mocked<AgencyRepository>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'test-secret') },
        },
        {
          provide: UserRepository,
          useValue: { updateFieldsById: jest.fn() },
        },
        {
          provide: AgencyRepository,
          useValue: { findByOwnerUserId: jest.fn() },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService);
    userRepo = module.get(UserRepository);
    agencyRepo = module.get(AgencyRepository);
    reflector = module.get(Reflector);
  });

  // ✅ Fixed: Create request object once and reuse it
  const createMockContext = (token?: string, cookies?: any): ExecutionContext => {
    const mockRequest = {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      cookies: cookies || {},
      query: {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest, // ✅ Always returns the same object
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it('should allow access for public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if no token provided', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should verify token from Authorization header', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const decoded = { userId: 1, username: 'test', role: 'user' };
    jwtService.verify.mockReturnValue(decoded);

    const context = createMockContext('valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(userRepo.updateFieldsById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ last_active: expect.any(Date) }),
    );
  });

  it('should set agencyId for agency_owner role', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const decoded = { userId: 2, username: 'owner', role: 'agency_owner' };
    jwtService.verify.mockReturnValue(decoded);
    agencyRepo.findByOwnerUserId.mockResolvedValue({ id: 10 } as any);

    const context = createMockContext('valid-token');
    const req = context.switchToHttp().getRequest();

    await guard.canActivate(context);

    expect(req.agencyId).toBe(10); // ✅ This will now work!
    expect(agencyRepo.findByOwnerUserId).toHaveBeenCalledWith(2);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const context = createMockContext('invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ✅ Additional test: verify token from cookies
  it('should verify token from cookies', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const decoded = { userId: 3, username: 'cookieuser', role: 'user' };
    jwtService.verify.mockReturnValue(decoded);

    const context = createMockContext(undefined, { token: 'cookie-token' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verify).toHaveBeenCalledWith('cookie-token', expect.any(Object));
  });
});