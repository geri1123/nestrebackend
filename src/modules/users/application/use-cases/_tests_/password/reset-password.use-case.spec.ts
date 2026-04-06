import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResetPasswordUseCase } from '../../password/reset-password.use-case';
import { USER_REPO } from '../../../../domain/repositories/user.repository.interface';
import { CacheService } from '../../../../../../infrastructure/cache/cache.service';

jest.mock('../../../../../../common/utils/hash', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn().mockResolvedValue('hashed-new-password'),
}));
import { comparePassword } from '../../../../../../common/utils/hash';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepo: {
    findByIdWithPassword: jest.Mock;
    findById: jest.Mock;
    updatePassword: jest.Mock;
  };
  let cacheService: { get: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: USER_REPO,
          useValue: {
            findByIdWithPassword: jest.fn(),
            findById: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: { get: jest.fn(), delete: jest.fn() },
        },
      ],
    }).compile();

    useCase = moduleRef.get(ResetPasswordUseCase);
    userRepo = moduleRef.get(USER_REPO);
    cacheService = moduleRef.get(CacheService);
  });

  it('resets password successfully with valid token', async () => {
    cacheService.get.mockResolvedValue({ userId: 1 });
    userRepo.findByIdWithPassword.mockResolvedValue({ id: 1, password: 'hashed-password' });
    userRepo.findById.mockResolvedValue({ id: 1 });
    (comparePassword as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute('valid-token', 'NewPassword123!', 'en');

    expect(userRepo.updatePassword).toHaveBeenCalledWith(1, 'hashed-new-password');
    expect(cacheService.delete).toHaveBeenCalledWith('password_reset:valid-token');
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it('throws BadRequestException if token is invalid or expired', async () => {
    cacheService.get.mockResolvedValue(null);

    await expect(
      useCase.execute('bad-token', 'NewPassword123!', 'en'),
    ).rejects.toThrow(BadRequestException);

    expect(userRepo.updatePassword).not.toHaveBeenCalled();
  });

  it('throws NotFoundException if user does not exist', async () => {
    cacheService.get.mockResolvedValue({ userId: 99 });
    userRepo.findByIdWithPassword.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('token', 'NewPassword123!', 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(userRepo.updatePassword).not.toHaveBeenCalled();
  });

  it('throws BadRequestException if new password equals old password', async () => {
    cacheService.get.mockResolvedValue({ userId: 1 });
    userRepo.findByIdWithPassword.mockResolvedValue({ id: 1, password: 'hashed-password' });
    userRepo.findById.mockResolvedValue({ id: 1 });
    (comparePassword as jest.Mock).mockResolvedValue(true);

    await expect(
      useCase.execute('token', 'SamePassword', 'en'),
    ).rejects.toThrow(BadRequestException);

    expect(userRepo.updatePassword).not.toHaveBeenCalled();
    expect(cacheService.delete).not.toHaveBeenCalled();
  });

  it('allows Google user without password to set a new password', async () => {
    cacheService.get.mockResolvedValue({ userId: 2 });
    userRepo.findByIdWithPassword.mockResolvedValue({ id: 2, password: null });
    userRepo.findById.mockResolvedValue({ id: 2 });

    const result = await useCase.execute('token', 'NewGooglePassword!', 'en');

    expect(userRepo.updatePassword).toHaveBeenCalledWith(2, 'hashed-new-password');
    expect(cacheService.delete).toHaveBeenCalledWith('password_reset:token');
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });
});