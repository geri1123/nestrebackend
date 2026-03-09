import { BadRequestException } from '@nestjs/common';
import { ApproveAgencyRequestUseCase } from '../approve-agency-request.use-case';
import { AgencyAgentStatus, UserRole, UserStatus } from '@prisma/client';

describe('ApproveAgencyRequestUseCase', () => {
  let useCase: ApproveAgencyRequestUseCase;

  const prisma = { $transaction: jest.fn() } as any;
  const findExistingAgent = { execute: jest.fn() } as any;
  const createAgent = { execute: jest.fn() } as any;
  const addPermissions = { execute: jest.fn() } as any;   
  const updateUserFields = { execute: jest.fn() } as any;
  const getUser = { execute: jest.fn() } as any;
  const notificationService = { sendNotification: jest.fn() } as any;
  const emailQueue = { sendAgentWelcomeEmail: jest.fn() } as any;
  

  beforeEach(() => {
    prisma.$transaction.mockImplementation(async (cb) => cb({}));

    useCase = new ApproveAgencyRequestUseCase(
      prisma,
      findExistingAgent,
      createAgent,
      addPermissions,      
      updateUserFields,
      getUser,
      notificationService,
      emailQueue,          
    );

    jest.clearAllMocks();
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

    expect(emailQueue.sendAgentWelcomeEmail).not.toHaveBeenCalled();
    expect(notificationService.sendNotification).not.toHaveBeenCalled();
  });

  it('should create agent and complete approval flow', async () => {
    getUser.execute.mockResolvedValue({
      id: 1,
      emailVerified: true,
      role: UserRole.user,
      status: UserStatus.inactive,
      email: 'test@mail.com',
    });

    findExistingAgent.execute.mockResolvedValue(null);

    createAgent.execute.mockResolvedValue({
      id: 100,
      status: AgencyAgentStatus.active,
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
    expect(emailQueue.sendAgentWelcomeEmail).toHaveBeenCalledWith('test@mail.com', 'John Doe');
    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      userId: 1,
      type: 'agency_confirm_agent',
      metadata: { agencyId: 10, approvedBy: 99 },
    });
    expect(result.id).toBe(100);
  });
});