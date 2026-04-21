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
  const agentRepo = { updateAgencyAgent: jest.fn() } as any;
  const agentPermissionRepo = {
    getPermissionsByAgentId: jest.fn(),
    updatePermissions: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (cb: any) => cb({}));

    useCase = new ApproveAgencyRequestUseCase(
      prisma,
      findExistingAgent,
      createAgent,
      addPermissions,
      updateUserFields,
      getUser,
      notificationService,
      emailQueue,
      agentRepo,
      agentPermissionRepo,
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

    expect(emailQueue.sendAgentWelcomeEmail).not.toHaveBeenCalled();
    expect(notificationService.sendNotification).not.toHaveBeenCalled();
  });

  it('should create agent when no existing agent found', async () => {
    getUser.execute.mockResolvedValue({
      id: 1,
      emailVerified: true,
      role: UserRole.user,
      status: UserStatus.inactive,
      email: 'test@mail.com',
    });

    findExistingAgent.execute.mockResolvedValue(null);
    createAgent.execute.mockResolvedValue({ id: 100, status: AgencyAgentStatus.active });

    const result = await useCase.execute({
      request: {
        userId: 1,
        user: { firstName: 'John', lastName: 'Doe', email: 'test@mail.com', role: UserRole.user, status: UserStatus.inactive },
      } as any,
      agencyId: 10,
      approvedBy: 99,
      roleInAgency: 'agent',
      permissions: {},
    });

    expect(createAgent.execute).toHaveBeenCalled();
    expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    expect(addPermissions.execute).toHaveBeenCalled();
    expect(updateUserFields.execute).toHaveBeenCalled();
    expect(emailQueue.sendAgentWelcomeEmail).toHaveBeenCalledWith('test@mail.com', 'John Doe');
    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      userId: 1,
      type: 'agency_confirm_agent',
      metadata: { agencyId: 10, approvedBy: 99 },
    });
    expect(result.id).toBe(100);
  });

  it('should update existing terminated agent instead of creating new one', async () => {
    getUser.execute.mockResolvedValue({
      id: 1,
      emailVerified: true,
      role: UserRole.user,
      status: UserStatus.active,
      email: 'test@mail.com',
    });

    findExistingAgent.execute.mockResolvedValue({ id: 50, status: AgencyAgentStatus.terminated });
    agentRepo.updateAgencyAgent.mockResolvedValue({ id: 50, status: AgencyAgentStatus.active });
    agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue({ id: 1 });

    const result = await useCase.execute({
      request: {
        userId: 1,
        user: { firstName: 'Jane', lastName: 'Doe', email: 'test@mail.com', role: UserRole.user, status: UserStatus.active },
      } as any,
      agencyId: 10,
      approvedBy: 99,
      roleInAgency: 'agent',
      permissions: {},
    });

    expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(
      50,
      expect.objectContaining({ status: AgencyAgentStatus.active, endDate: null }),
      expect.anything(),
    );
    expect(createAgent.execute).not.toHaveBeenCalled();
    expect(agentPermissionRepo.updatePermissions).toHaveBeenCalled();
    expect(addPermissions.execute).not.toHaveBeenCalled();
    expect(result.id).toBe(50);
  });

  it('should create permissions if terminated agent had none', async () => {
    getUser.execute.mockResolvedValue({ id: 1, emailVerified: true, email: 'test@mail.com' });
    findExistingAgent.execute.mockResolvedValue({ id: 50, status: AgencyAgentStatus.terminated });
    agentRepo.updateAgencyAgent.mockResolvedValue({ id: 50, status: AgencyAgentStatus.active });
    agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(null); // ← no existing permissions

    await useCase.execute({
      request: {
        userId: 1,
        user: { firstName: 'Jane', lastName: 'Doe', email: 'test@mail.com' },
      } as any,
      agencyId: 10,
      approvedBy: 99,
      roleInAgency: 'agent',
      permissions: {},
    });

    expect(agentPermissionRepo.updatePermissions).not.toHaveBeenCalled();
    expect(addPermissions.execute).toHaveBeenCalled(); // ← creates new permissions
  });
});