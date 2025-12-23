import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RequestPasswordResetUseCase } from '../../password/request-password-reset.use-case'; 
import { USER_REPO } from '../../../../domain/repositories/user.repository.interface';
import { EmailService } from '../../../../../../infrastructure/email/email.service';
import { CacheService } from '../../../../../../infrastructure/cache/cache.service';
import { User } from '../../../../domain/entities/user.entity';
jest.mock('../../../../../../common/utils/hash', () => ({
  generateToken: () => 'fixed-token',
}));

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;

  let userRepo: { findByEmail: jest.Mock };
  let emailService: { sendPasswordRecoveryEmail: jest.Mock };
  let cacheService: { set: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RequestPasswordResetUseCase,
        {
          provide: USER_REPO,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordRecoveryEmail: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RequestPasswordResetUseCase);
    userRepo = moduleRef.get(USER_REPO);
    emailService = moduleRef.get(EmailService);
    cacheService = moduleRef.get(CacheService);
  });

  it('sends password reset email when user exists and is active', async () => {
    const user = new User(
      1,
      'john',
      'john@test.com',
      'John',
      null,
      null,
      null,
      null,
      null,
      'user',
      'active',
      true,
      new Date(),
      null,
      null,
    );

    userRepo.findByEmail.mockResolvedValue(user);

    await useCase.execute('john@test.com', 'en');

    expect(cacheService.set).toHaveBeenCalledWith(
      'password_reset:fixed-token',
      { userId: 1, email: 'john@test.com' },
      10 * 60 * 1000,
    );

    expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledWith(
      'john@test.com',
      'John',
      'fixed-token',
      'en',
      expect.any(Date),
    );
  });

  it('throws NotFoundException if user does not exist', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('missing@test.com', 'al'),
    ).rejects.toThrow(NotFoundException);

    expect(emailService.sendPasswordRecoveryEmail).not.toHaveBeenCalled();
    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it('throws NotFoundException if user is inactive', async () => {
    const inactiveUser = new User(
      2,
      'mark',
      'mark@test.com',
      null,
      null,
      null,
      null,
      null,
      null,
      'user',
      'inactive',
      true,
      new Date(),
      null,
      null,
    );

    userRepo.findByEmail.mockResolvedValue(inactiveUser);

    await expect(
      useCase.execute('mark@test.com', 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(emailService.sendPasswordRecoveryEmail).not.toHaveBeenCalled();
    expect(cacheService.set).not.toHaveBeenCalled();
  });
});