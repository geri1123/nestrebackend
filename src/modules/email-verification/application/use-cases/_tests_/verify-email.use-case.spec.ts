import { BadRequestException } from '@nestjs/common';
import { VerifyEmailUseCase } from '../verify-email.use-case';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;

  const prisma = {
    $transaction: jest.fn(),
  } as any;

  const cache = {
    get: jest.fn(),
    delete: jest.fn(),
  } as any;

  const email = {
    sendPendingApprovalEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  } as any;

  const findUserById = { execute: jest.fn() } as any;
  const findRequestsByUserId = { execute: jest.fn() } as any;
  const verifyEmailUC = { execute: jest.fn() } as any;
  const activateAgencyByOwner = { execute: jest.fn() } as any;
  const getAgencyWithOwner = { execute: jest.fn() } as any;
  const setUnderReview = { execute: jest.fn() } as any;
  const notifications = { sendNotification: jest.fn() } as any;
  const templates = {
    getAllTranslations: jest.fn().mockReturnValue({}),
  } as any;

  beforeEach(() => {
    prisma.$transaction.mockImplementation(async (cb) => cb({}));

    useCase = new VerifyEmailUseCase(
      prisma,
      cache,
      email,
      findUserById,
      findRequestsByUserId,
      verifyEmailUC,
      activateAgencyByOwner,
      getAgencyWithOwner,
      setUnderReview,
      notifications,
      templates,
    );
  });

  it('should throw if token is missing', async () => {
    await expect(
      useCase.execute('', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if token is invalid or expired', async () => {
    cache.get.mockResolvedValue(null);

    await expect(
      useCase.execute('bad-token', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should verify normal user and send welcome email', async () => {
    cache.get.mockResolvedValue({ userId: 1, role: 'user' });

    findUserById.execute.mockResolvedValue({
      id: 1,
      email: 'user@mail.com',
      firstName: 'John',
    });

    await useCase.execute('valid-token', 'en');

    expect(verifyEmailUC.execute).toHaveBeenCalledWith(1, 'active', expect.anything());
    expect(email.sendWelcomeEmail).toHaveBeenCalledWith('user@mail.com', 'John');
    expect(cache.delete).toHaveBeenCalledWith('email_verification:valid-token');
  });

  it('should handle agent verification flow', async () => {
    cache.get.mockResolvedValue({ userId: 2, role: 'agent' });

    findUserById.execute.mockResolvedValue({
      id: 2,
      email: 'agent@mail.com',
      firstName: 'Agent',
    });

    findRequestsByUserId.execute.mockResolvedValue([
      { agencyId: 10 },
    ]);

    getAgencyWithOwner.execute.mockResolvedValue({
      owner_user_id: 99,
    });

    await useCase.execute('agent-token', 'en');

    expect(verifyEmailUC.execute).toHaveBeenCalledWith(2, 'pending', expect.anything());
    expect(setUnderReview.execute).toHaveBeenCalled();
    expect(email.sendPendingApprovalEmail).toHaveBeenCalled();
    expect(notifications.sendNotification).toHaveBeenCalled();
  });

  it('should activate agency when role is agency_owner', async () => {
    cache.get.mockResolvedValue({ userId: 3, role: 'agency_owner' });

    findUserById.execute.mockResolvedValue({
      id: 3,
      email: 'owner@mail.com',
      firstName: 'Owner',
    });

    await useCase.execute('owner-token', 'en');

    expect(activateAgencyByOwner.execute).toHaveBeenCalledWith(
      3,
      'en',
      expect.anything(),
    );
  });
});