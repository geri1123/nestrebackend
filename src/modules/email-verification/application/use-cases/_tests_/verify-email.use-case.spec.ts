import { BadRequestException } from '@nestjs/common';
import { VerifyEmailUseCase } from '../verify-email.use-case';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;

  const prisma = { $transaction: jest.fn() } as any;
  const cache = { get: jest.fn(), delete: jest.fn(), set: jest.fn() } as any;
  const email = { sendPendingApprovalEmail: jest.fn(), sendWelcomeEmail: jest.fn() } as any;
  const findUserById = { execute: jest.fn() } as any;
  const findRequestsByUserId = { execute: jest.fn() } as any;
  const verifyEmailUC = { execute: jest.fn() } as any;
  const activateAgencyByOwner = { execute: jest.fn() } as any;
  const getAgencyWithOwner = { execute: jest.fn() } as any;
  const setUnderReview = { execute: jest.fn() } as any;
  const notifications = { sendNotification: jest.fn() } as any;
  const templates = { getAllTranslations: jest.fn().mockReturnValue({}) } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (cb) => cb({}));

    useCase = new VerifyEmailUseCase(
      prisma, cache, email, findUserById, findRequestsByUserId,
      verifyEmailUC, activateAgencyByOwner, getAgencyWithOwner,
      setUnderReview, notifications, templates,
    );
  });

  it('should throw if token is missing', async () => {
    await expect(useCase.execute('', 'en')).rejects.toThrow(BadRequestException);
  });

  it('should throw if token is invalid or expired', async () => {
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(useCase.execute('bad-token', 'en')).rejects.toThrow(BadRequestException);
  });

  it('should return alreadyVerified=true if token was already used', async () => {
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: 1 });

    findUserById.execute.mockResolvedValue({
      id: 1, email: 'user@mail.com', firstName: 'John', emailVerified: true,
    });

    const result = await useCase.execute('used-token', 'en');

    expect(result).toEqual({ alreadyVerified: true });
    expect(email.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(verifyEmailUC.execute).not.toHaveBeenCalled();
  });

  it('should return alreadyVerified=true if user email is already verified', async () => {
    cache.get.mockResolvedValueOnce({ userId: 1, role: 'user' });

    findUserById.execute.mockResolvedValue({
      id: 1, email: 'user@mail.com', firstName: 'John', emailVerified: true,
    });

    const result = await useCase.execute('valid-token', 'en');

    expect(result).toEqual({ alreadyVerified: true });
    expect(cache.delete).toHaveBeenCalledWith('email_verification:valid-token');
    expect(cache.set).toHaveBeenCalledWith('email_verification_used:valid-token', { userId: 1 }, 60 * 60 * 24);
    expect(email.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(verifyEmailUC.execute).not.toHaveBeenCalled();
  });

  it('should verify normal user and send welcome email', async () => {
    cache.get.mockResolvedValue({ userId: 1, role: 'user' });

    findUserById.execute.mockResolvedValue({
      id: 1, email: 'user@mail.com', firstName: 'John', emailVerified: false,
    });

    const result = await useCase.execute('valid-token', 'en');

    expect(result).toEqual({ alreadyVerified: false });
    expect(verifyEmailUC.execute).toHaveBeenCalledWith(1, 'active', expect.anything());
    expect(email.sendWelcomeEmail).toHaveBeenCalledWith('user@mail.com', 'John');
    expect(cache.delete).toHaveBeenCalledWith('email_verification:valid-token');
    expect(cache.set).toHaveBeenCalledWith('email_verification_used:valid-token', { userId: 1 }, 60 * 60 * 24);
  });

  it('should handle agent verification flow', async () => {
    cache.get.mockResolvedValue({ userId: 2, role: 'agent' });

    findUserById.execute.mockResolvedValue({
      id: 2, email: 'agent@mail.com', firstName: 'Agent', emailVerified: false,
    });

    findRequestsByUserId.execute.mockResolvedValue({ agencyId: 10 }); // ← single object

    getAgencyWithOwner.execute.mockResolvedValue({ owner_user_id: 99 });

    const result = await useCase.execute('agent-token', 'en');

    expect(result).toEqual({ alreadyVerified: false });
    expect(verifyEmailUC.execute).toHaveBeenCalledWith(2, 'pending', expect.anything());
    expect(setUnderReview.execute).toHaveBeenCalled();
    expect(email.sendPendingApprovalEmail).toHaveBeenCalled();
    expect(notifications.sendNotification).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith('email_verification_used:agent-token', { userId: 2 }, 60 * 60 * 24);
  });

  it('should activate agency when role is agency_owner', async () => {
    cache.get.mockResolvedValue({ userId: 3, role: 'agency_owner' });

    findUserById.execute.mockResolvedValue({
      id: 3, email: 'owner@mail.com', firstName: 'Owner', emailVerified: false,
    });

    const result = await useCase.execute('owner-token', 'en');

    expect(result).toEqual({ alreadyVerified: false });
    expect(activateAgencyByOwner.execute).toHaveBeenCalledWith(3, 'en', expect.anything());
    expect(email.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('should throw if agent has no registration request', async () => {
    cache.get.mockResolvedValue({ userId: 2, role: 'agent' });

    findUserById.execute.mockResolvedValue({
      id: 2, email: 'agent@mail.com', firstName: 'Agent', emailVerified: false,
    });

    findRequestsByUserId.execute.mockResolvedValue(null); // ← null not []

    await expect(useCase.execute('agent-token', 'en')).rejects.toThrow(BadRequestException);
  });

  it('should throw if agent request has no agencyId', async () => {
    cache.get.mockResolvedValue({ userId: 2, role: 'agent' });

    findUserById.execute.mockResolvedValue({
      id: 2, email: 'agent@mail.com', firstName: 'Agent', emailVerified: false,
    });

    findRequestsByUserId.execute.mockResolvedValue({ agencyId: null }); // ← single object

    await expect(useCase.execute('agent-token', 'en')).rejects.toThrow(BadRequestException);
  });

  it('should use default name "User" if firstName is missing', async () => {
    cache.get.mockResolvedValue({ userId: 1, role: 'user' });

    findUserById.execute.mockResolvedValue({
      id: 1, email: 'user@mail.com', firstName: null, emailVerified: false,
    });

    await useCase.execute('valid-token', 'en');

    expect(email.sendWelcomeEmail).toHaveBeenCalledWith('user@mail.com', 'User');
  });
});