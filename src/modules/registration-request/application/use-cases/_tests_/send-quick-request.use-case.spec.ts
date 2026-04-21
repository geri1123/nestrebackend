import { BadRequestException } from '@nestjs/common';
import { SendQuickRequestUseCase } from '../send-quick-request.use-case';

describe('SendQuickRequestUseCase', () => {
  let useCase: SendQuickRequestUseCase;

  const repo = { 
    create: jest.fn(),
    findPendingRequestByUserId: jest.fn(), // ← changed
  } as any;
  const getAgency = { execute: jest.fn() } as any;
  const notificationService = { sendNotification: jest.fn() } as any;
  const templateService = {
    getAllTranslations: jest.fn().mockReturnValue({}),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findPendingRequestByUserId.mockResolvedValue(null); // ← changed
    useCase = new SendQuickRequestUseCase(
      repo,
      getAgency,
      notificationService,
      templateService,
    );
  });

  it('should throw BadRequestException if user already has pending request', async () => {
    repo.findPendingRequestByUserId.mockResolvedValue({ id: 5, userId: 1 }); // ← changed

    await expect(
      useCase.execute(1, 10, 'john', 'en'),
    ).rejects.toThrow(BadRequestException);

    expect(repo.create).not.toHaveBeenCalled();
    expect(notificationService.sendNotification).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if agency does not exist', async () => {
    getAgency.execute.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 999, 'john', 'en'),
    ).rejects.toThrow(BadRequestException);

    expect(repo.create).not.toHaveBeenCalled();
    expect(notificationService.sendNotification).not.toHaveBeenCalled();
  });

  it('should create request and send notification on success', async () => {
    getAgency.execute.mockResolvedValue({ id: 10, owner_user_id: 99 });

    await useCase.execute(1, 10, 'john', 'en');

    expect(repo.create).toHaveBeenCalled();
    expect(notificationService.sendNotification).toHaveBeenCalled();
  });

  it('should notify agency owner, not requester', async () => {
    getAgency.execute.mockResolvedValue({ id: 10, owner_user_id: 99 });

    await useCase.execute(1, 10, 'john', 'en');

    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 99,
        type: 'user_send_request',
      }),
    );
  });

  it('should allow terminated agent (approved request) to send new request', async () => {
    // terminated agent has approved request, findPendingRequestByUserId returns null
    repo.findPendingRequestByUserId.mockResolvedValue(null);
    getAgency.execute.mockResolvedValue({ id: 10, owner_user_id: 99 });

    await useCase.execute(1, 10, 'john', 'en');

    expect(repo.create).toHaveBeenCalled();
  });
});