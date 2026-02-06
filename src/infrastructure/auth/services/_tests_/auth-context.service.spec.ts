import { AuthContextService, AuthContext } from '../auth-context.service';

import { UnauthorizedException } from '@nestjs/common';
import { user_role, user_status } from '@prisma/client';

describe('AuthContextService', () => {
  let service: AuthContextService;
  let authTokenServiceMock: any;
  let getUserProfileMock: any;
  let userRepositoryMock: any;
  let cacheServiceMock: any;

  const mockUser = {
    id: 1,
    username: 'john',
    role: user_role.user,
    status: user_status.active,
    emailVerified: true,
  };

  beforeEach(() => {
    authTokenServiceMock = { verifyAccessToken: jest.fn().mockReturnValue({ userId: 1 }) };
    getUserProfileMock = { execute: jest.fn().mockResolvedValue(mockUser) };
    userRepositoryMock = { updateFields: jest.fn().mockResolvedValue(null) };
    cacheServiceMock = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };

    service = new AuthContextService(
      authTokenServiceMock,
      getUserProfileMock,
      userRepositoryMock,
      cacheServiceMock
    );
  });

  describe('extractToken', () => {
    it('returns token from cookies', () => {
      const req = { cookies: { token: 'abc' } };
      expect(service.extractToken(req)).toBe('abc');
    });

    it('returns token from Authorization header', () => {
      const req = { headers: { authorization: 'Bearer xyz' } };
      expect(service.extractToken(req)).toBe('xyz');
    });

    it('returns null if no token', () => {
      const req = {};
      expect(service.extractToken(req)).toBeNull();
    });
  });

  describe('buildAuthContext', () => {
    it('returns cached context if present', async () => {
      const cached: AuthContext = { userId: 1, user: mockUser };
      cacheServiceMock.get.mockResolvedValue(cached);

      const context = await service.buildAuthContext(1, 'en');
      expect(context).toEqual(cached);
      expect(getUserProfileMock.execute).not.toHaveBeenCalled();
    });

    it('fetches user and sets cache if no cached context', async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      const context = await service.buildAuthContext(1, 'en');

      expect(getUserProfileMock.execute).toHaveBeenCalledWith(1);
      expect(cacheServiceMock.set).toHaveBeenCalled();
      expect(context.userId).toBe(mockUser.id);
      expect(context.user.username).toBe(mockUser.username);
    });

    it('throws UnauthorizedException if user not found', async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      getUserProfileMock.execute.mockResolvedValue(null);

      await expect(service.buildAuthContext(2, 'en')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('invalidateContext', () => {
    it('calls cacheService.delete', async () => {
      await service.invalidateContext(1);
      expect(cacheServiceMock.delete).toHaveBeenCalledWith('ctx:1');
    });
  });

  describe('updateLastActive', () => {
    it('calls userRepository.updateFields', async () => {
      await service.updateLastActive(1);
      expect(userRepositoryMock.updateFields).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe('authenticate', () => {
    it('verifies token, builds context, and updates last active', async () => {
      cacheServiceMock.get.mockResolvedValue(null);

      const context = await service.authenticate('token123', 'en');
      expect(authTokenServiceMock.verifyAccessToken).toHaveBeenCalledWith('token123');
      expect(getUserProfileMock.execute).toHaveBeenCalledWith(1);
      expect(context.userId).toBe(mockUser.id);
      expect(userRepositoryMock.updateFields).toHaveBeenCalled(); // last active
    });
  });
});