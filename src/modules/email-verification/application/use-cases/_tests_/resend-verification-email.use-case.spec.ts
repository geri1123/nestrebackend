import { BadRequestException } from '@nestjs/common';
import { ResendVerificationEmailUseCase } from '../resend-verification-email.use-case';
import { EMAIL_EVENTS, EmailVerificationRequestedEvent } from '../../../../../infrastructure/events/email/email.events';

jest.mock('../../../../../common/utils/hash', () => ({
  generateToken: jest.fn(() => 'fixed-token'),
}));

describe('ResendVerificationEmailUseCase', () => {
  let useCase: ResendVerificationEmailUseCase;

  const findUser    = { execute: jest.fn() } as any;
  const cache       = { set: jest.fn() }     as any;
  const eventEmitter = { emit: jest.fn() }   as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ResendVerificationEmailUseCase(findUser, cache, eventEmitter);
  });

  it('should throw if email is already verified', async () => {
    findUser.execute.mockResolvedValue({ email_verified: true });

    await expect(useCase.execute('test@mail.com', 'en')).rejects.toThrow(
      BadRequestException,
    );

    expect(cache.set).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
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
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should store token in cache and emit verification event', async () => {
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

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.VERIFICATION_REQUESTED,
      new EmailVerificationRequestedEvent('test@mail.com', 'John', 'fixed-token', 'en'),
    );
  });

  it('should use fallback name "User" when first_name is null', async () => {
    findUser.execute.mockResolvedValue({
      id: 2,
      email: 'user@mail.com',
      first_name: null,
      role: 'user',
      status: 'inactive',
      email_verified: false,
    });

    await useCase.execute('user@mail.com', 'en');

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.VERIFICATION_REQUESTED,
      new EmailVerificationRequestedEvent('user@mail.com', 'User', 'fixed-token', 'en'),
    );
  });
});