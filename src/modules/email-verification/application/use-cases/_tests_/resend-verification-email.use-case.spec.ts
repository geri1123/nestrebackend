import { BadRequestException } from '@nestjs/common';
import { ResendVerificationEmailUseCase } from '../resend-verification-email.use-case';
import { CacheTTL } from '../../../../../common/constants/cache-ttl.constants';

jest.mock('../../../../../common/utils/hash', () => ({
  generateToken: jest.fn(() => 'fixed-token'),
}));

describe('ResendVerificationEmailUseCase', () => {
  let useCase: ResendVerificationEmailUseCase;

  const findUser   = { execute: jest.fn() } as any;
  const cache      = { set: jest.fn() }     as any;
  const emailQueue = { sendVerificationEmail: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ResendVerificationEmailUseCase(findUser, cache, emailQueue);
  });

  it('should throw if email is already verified', async () => {
    findUser.execute.mockResolvedValue({ email_verified: true });

    await expect(useCase.execute('test@mail.com', 'en')).rejects.toThrow(
      BadRequestException,
    );

    expect(cache.set).not.toHaveBeenCalled();
    expect(emailQueue.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should throw if user status is not pending or inactive', async () => {
    findUser.execute.mockResolvedValue({
      email_verified: false,
      status: 'active',
    });

    await expect(useCase.execute('test@mail.com', 'en')).rejects.toThrow(
      BadRequestException,
    );

    expect(cache.set).not.toHaveBeenCalled();
    expect(emailQueue.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should store token in cache and send verification email for pending user', async () => {
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
      CacheTTL.EMAIL_VERIFICATION,
    );
    expect(emailQueue.sendVerificationEmail).toHaveBeenCalledWith(
      'test@mail.com',
      'John',
      'fixed-token',
      'en',
    );
  });

  it('should store token in cache and send verification email for inactive user', async () => {
    findUser.execute.mockResolvedValue({
      id: 2,
      email: 'inactive@mail.com',
      first_name: 'Jane',
      role: 'agent',
      status: 'inactive',
      email_verified: false,
    });

    await useCase.execute('inactive@mail.com', 'en');

    expect(cache.set).toHaveBeenCalledWith(
      'email_verification:fixed-token',
      { userId: 2, role: 'agent' },
      CacheTTL.EMAIL_VERIFICATION,
    );
    expect(emailQueue.sendVerificationEmail).toHaveBeenCalledWith(
      'inactive@mail.com',
      'Jane',
      'fixed-token',
      'en',
    );
  });

  it('should use fallback name "User" when first_name is null', async () => {
    findUser.execute.mockResolvedValue({
      id: 3,
      email: 'user@mail.com',
      first_name: null,
      role: 'user',
      status: 'inactive',
      email_verified: false,
    });

    await useCase.execute('user@mail.com', 'en');

    expect(emailQueue.sendVerificationEmail).toHaveBeenCalledWith(
      'user@mail.com',
      'User',
      'fixed-token',
      'en',
    );
  });

  it('should work with Albanian language', async () => {
    findUser.execute.mockResolvedValue({
      id: 4,
      email: 'al@mail.com',
      first_name: 'Ardit',
      role: 'agency_owner',
      status: 'pending',
      email_verified: false,
    });

    await useCase.execute('al@mail.com', 'al');

    expect(cache.set).toHaveBeenCalledWith(
      'email_verification:fixed-token',
      { userId: 4, role: 'agency_owner' },
      CacheTTL.EMAIL_VERIFICATION,
    );
    expect(emailQueue.sendVerificationEmail).toHaveBeenCalledWith(
      'al@mail.com',
      'Ardit',
      'fixed-token',
      'al',
    );
  });
});