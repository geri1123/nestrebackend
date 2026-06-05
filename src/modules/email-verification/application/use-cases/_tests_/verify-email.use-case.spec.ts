import { BadRequestException } from '@nestjs/common';
import { VerifyEmailUseCase } from '../verify-email.use-case';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;

  const prisma = { $transaction: jest.fn() } as any;

  const cache = {
    get: jest.fn(),
    delete: jest.fn(),
    set: jest.fn(),
  } as any;

  const findUserById = { execute: jest.fn() } as any;
  const findRequestsByUserId = { execute: jest.fn() } as any;
  const verifyEmailUC = { execute: jest.fn() } as any;
  const activateAgencyByOwner = { execute: jest.fn() } as any;
  const getAgencyWithOwner = { execute: jest.fn() } as any;
  const setUnderReview = { execute: jest.fn() } as any;
  const notifications = { sendNotification: jest.fn() } as any;

  const emailQueue = {
    sendWelcomeEmail: jest.fn(),
    sendPendingApprovalEmail: jest.fn(),
  } as any;

  const mockUser = (overrides = {}) => ({
    id: 1,
    email: 'user@mail.com',
    firstName: 'John',
    emailVerified: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.$transaction.mockImplementation((cb: any) => cb({}));

    getAgencyWithOwner.execute.mockResolvedValue({ owner_user_id: 99 });

    useCase = new VerifyEmailUseCase(
      prisma,
      cache,
      findUserById,
      findRequestsByUserId,
      verifyEmailUC,
      activateAgencyByOwner,
      getAgencyWithOwner,
      setUnderReview,
      notifications,
      emailQueue,
    );
  });

  it('should throw if token is missing', async () => {
    await expect(useCase.execute('', 'en')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if token is invalid or expired', async () => {
    cache.get.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(useCase.execute('bad-token', 'en')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return alreadyVerified=true if token was already used', async () => {
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: 1 });

    findUserById.execute.mockResolvedValueOnce(
      mockUser({ emailVerified: true }),
    );

    const result = await useCase.execute('used-token', 'en');

    expect(result).toEqual({ alreadyVerified: true });
    expect(emailQueue.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('should return alreadyVerified=true if user already verified', async () => {
    cache.get.mockResolvedValueOnce({ userId: 1, role: 'user' });

    findUserById.execute.mockResolvedValueOnce(
      mockUser({ emailVerified: true }),
    );

    const result = await useCase.execute('valid-token', 'en');

    expect(result).toEqual({ alreadyVerified: true });

    expect(cache.delete).toHaveBeenCalledWith(
      'email_verification:valid-token',
    );

    expect(cache.set).toHaveBeenCalled();
  });

  it('should verify normal user and send welcome email', async () => {
    cache.get.mockResolvedValueOnce({ userId: 1, role: 'user' });

    findUserById.execute.mockResolvedValueOnce(mockUser());

    const result = await useCase.execute('valid-token', 'en');

    expect(result).toEqual({ alreadyVerified: false });

    expect(verifyEmailUC.execute).toHaveBeenCalledWith(
      1,
      'active',
      expect.anything(),
    );

    expect(emailQueue.sendWelcomeEmail).toHaveBeenCalledWith(
      'user@mail.com',
      'John',
    );

    expect(cache.delete).toHaveBeenCalledWith(
      'email_verification:valid-token',
    );
  });

  it('should handle agent verification flow', async () => {
    cache.get.mockResolvedValueOnce({ userId: 2, role: 'agent' });

    const agentUser = mockUser({
      id: 2,
      email: 'agent@mail.com',
      firstName: 'Agent',
    });

    findUserById.execute.mockResolvedValueOnce(agentUser);

    findRequestsByUserId.execute.mockResolvedValue({ agencyId: 10 });

    const result = await useCase.execute('agent-token', 'en');

    expect(result).toEqual({ alreadyVerified: false });

    expect(verifyEmailUC.execute).toHaveBeenCalledWith(
      2,
      'pending',
      expect.anything(),
    );

    expect(setUnderReview.execute).toHaveBeenCalled();

    expect(emailQueue.sendPendingApprovalEmail).toHaveBeenCalledWith(
      'agent@mail.com',
      'Agent',
    );

    expect(notifications.sendNotification).toHaveBeenCalled();
  });

  it('should activate agency when role is agency_owner', async () => {
    cache.get.mockResolvedValueOnce({ userId: 3, role: 'agency_owner' });

    const ownerUser = mockUser({
      id: 3,
      email: 'owner@mail.com',
      firstName: 'Owner',
    });

    findUserById.execute.mockResolvedValueOnce(ownerUser);

    const result = await useCase.execute('owner-token', 'en');

    expect(result).toEqual({ alreadyVerified: false });

    expect(activateAgencyByOwner.execute).toHaveBeenCalled();

    expect(emailQueue.sendWelcomeEmail).toHaveBeenCalledWith(
      'owner@mail.com',
      'Owner',
    );
  });
});