import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VerifyPasswordResetTokenUseCase } from '../../password/verify-password-reset-token.use-case';
import { CacheService } from '../../../../../../infrastructure/cache/cache.service';

describe('VerifyPasswordResetTokenUseCase', () => {
  let useCase: VerifyPasswordResetTokenUseCase;
  let cacheService: { get: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VerifyPasswordResetTokenUseCase,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(VerifyPasswordResetTokenUseCase);
    cacheService = moduleRef.get(CacheService);
  });

  it('returns true when token exists in cache', async () => {
    cacheService.get.mockResolvedValue({ userId: 1 });

    const result = await useCase.execute('valid-token', 'en');

    expect(result).toBe(true);
    expect(cacheService.get).toHaveBeenCalledWith(
      'password_reset:valid-token',
    );
  });

  it('throws BadRequestException when token is invalid or expired', async () => {
    cacheService.get.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-token', 'al'),
    ).rejects.toThrow(BadRequestException);
  });
});