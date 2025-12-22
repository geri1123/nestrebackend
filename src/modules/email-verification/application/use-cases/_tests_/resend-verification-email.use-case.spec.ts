import { BadRequestException } from '@nestjs/common';
import { ResendVerificationEmailUseCase } from '../resend-verification-email.use-case';
jest.mock('../../../../../common/utils/hash', () => ({
  generateToken: jest.fn(() => 'fixed-token'),
}));

describe('ResendVerificationEmailUseCase', () => {
  let useCase: ResendVerificationEmailUseCase;

  const findUser = { execute: jest.fn() } as any;
  const cache = { set: jest.fn() } as any;
  const email = { sendVerificationEmail: jest.fn() } as any;

  beforeEach(() => {
    useCase = new ResendVerificationEmailUseCase(
      findUser,
      cache,
      email,
    );
  });

  it('should throw if email is already verified', async () => {
    findUser.execute.mockResolvedValue({
      email_verified: true,
    });

    await expect(
      useCase.execute('test@mail.com', 'en'),
    ).rejects.toThrow(BadRequestException);

    expect(cache.set).not.toHaveBeenCalled();
    expect(email.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should throw if user status is not pending or inactive', async () => {
    findUser.execute.mockResolvedValue({
      email_verified: false,
      status: 'active',
    });

    await expect(
      useCase.execute('test@mail.com', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should store token in cache and send verification email', async () => {
    findUser.execute.mockResolvedValue({
      id: 1,
      email: 'test@mail.com',
      first_name: 'John',
      role: 'user',
      status: 'pending',
      email_verified: false,
    });

    await useCase.execute('test@mail.com', 'en');

    expect(cache.set).toHaveBeenCalledWith(
      'email_verification:fixed-token',
      { userId: 1, role: 'user' },
      30 * 60 * 1000,
    );

    expect(email.sendVerificationEmail).toHaveBeenCalledWith(
      'test@mail.com',
      'John',
      'fixed-token',
      'en',
    );
  });

  it('should use default name when first_name is null', async () => {
    findUser.execute.mockResolvedValue({
      id: 2,
      email: 'user@mail.com',
      first_name: null,
      role: 'user',
      status: 'inactive',
      email_verified: false,
    });

    await useCase.execute('user@mail.com', 'en');

    expect(email.sendVerificationEmail).toHaveBeenCalledWith(
      'user@mail.com',
      'User',
      'fixed-token',
      'en',
    );
  });
});