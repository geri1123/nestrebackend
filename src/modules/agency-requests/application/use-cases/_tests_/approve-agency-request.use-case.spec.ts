import { BadRequestException } from '@nestjs/common';
import { ApproveAgencyRequestUseCase } from '../approve-agency-request.use-case';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { agencyagent_status, user_role, user_status } from '@prisma/client';

describe('ApproveAgencyRequestUseCase', () => {
  let useCase: ApproveAgencyRequestUseCase;

  const prisma = {
    $transaction: jest.fn(),
  } as any;

  const findExistingAgent = { execute: jest.fn() } as any;
  const createAgent = { execute: jest.fn() } as any;
  const ensureIdCardUnique = { execute: jest.fn() } as any;
  const addPermissions = { execute: jest.fn() } as any;
  const updateUserFields = { execute: jest.fn() } as any;
  const getUser = { execute: jest.fn() } as any;
  const emailService = { sendAgentWelcomeEmail: jest.fn() } as any;
  const notificationService = { sendNotification: jest.fn() } as any;
  const notificationTemplateService = {
    getAllTranslations: jest.fn().mockReturnValue({}),
  } as any;

  beforeEach(() => {
    prisma.$transaction.mockImplementation(async (cb) => cb({}));

    useCase = new ApproveAgencyRequestUseCase(
      prisma,
      findExistingAgent,
      createAgent,
      ensureIdCardUnique,
      addPermissions,
      updateUserFields,
      getUser,
      emailService,
      notificationService,
      notificationTemplateService,
    );
  });

  it('should throw if user email is not verified', async () => {
    getUser.execute.mockResolvedValue({ emailVerified: false });

    await expect(
      useCase.execute({
        request: { userId: 1 } as any,
        agencyId: 10,
        approvedBy: 99,
        roleInAgency: 'agent',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create agent and complete approval flow', async () => {
    getUser.execute.mockResolvedValue({
      id: 1,
      emailVerified: true,
      role: user_role.user,
      status: user_status.inactive,
      email: 'test@mail.com',
    });

    findExistingAgent.execute.mockResolvedValue(null);

    createAgent.execute.mockResolvedValue({
      id: 100,
      status: agencyagent_status.active,
    });

    const result = await useCase.execute({
      request: {
        userId: 1,
        user: { firstName: 'John', lastName: 'Doe', email: 'test@mail.com' },
      } as any,
      agencyId: 10,
      approvedBy: 99,
      roleInAgency: 'agent',
      permissions: {},
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(createAgent.execute).toHaveBeenCalled();
    expect(updateUserFields.execute).toHaveBeenCalled();
    expect(addPermissions.execute).toHaveBeenCalled();
    expect(emailService.sendAgentWelcomeEmail).toHaveBeenCalled();
    expect(notificationService.sendNotification).toHaveBeenCalled();

    expect(result.id).toBe(100);
  });
});