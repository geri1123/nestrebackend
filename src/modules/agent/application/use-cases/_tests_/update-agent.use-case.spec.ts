import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAgentUseCase } from '../update-agent.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';
import { NotificationService } from '../../../../notification/notification.service';
import { NotificationTemplateService } from '../../../../notification/notifications-template.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';
import { USER_REPO } from '../../../../users/domain/repositories/user.repository.interface';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import * as classValidator from 'class-validator';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('UpdateAgentUseCase', () => {
  let useCase: UpdateAgentUseCase;

  const mockTx = {};

  const agentRepo = {
    findById: jest.fn(),
    updateAgencyAgent: jest.fn(),
    detachAgentProducts: jest.fn(),
  };

  const agentPermissionRepo = {
    getPermissionsByAgentId: jest.fn(),
    updatePermissions: jest.fn(),
    createPermissions: jest.fn(),
  };

  const userRepo = {
    updateFields: jest.fn(),
  };

  const prisma = {
    $transaction: jest.fn((cb) => cb(mockTx)),
  };

  const notificationService = {
    sendNotification: jest.fn(),
  };

  const notificationTemplateService = {
    getTemplate: jest.fn(),
  };

  const mockUser = {
    id: 1,
    username: 'admin_user',
  };

  const mockAgentAgent = {
    id: 10,
    agentUserId: 100,
    agencyId: 5,
    roleInAgency: 'agent' as AgencyAgentRoleInAgency,
    commissionRate: 5,
    status: 'active' as AgencyAgentStatus,
    endDate: null,
  };

  const mockSeniorAgent = {
    id: 20,
    agentUserId: 200,
    agencyId: 5,
    roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency,
    commissionRate: 10,
    status: 'active' as AgencyAgentStatus,
    endDate: null,
  };

  const mockTeamLead = {
    id: 30,
    agentUserId: 300,
    agencyId: 5,
    roleInAgency: 'team_lead' as AgencyAgentRoleInAgency,
    commissionRate: 15,
    status: 'active' as AgencyAgentStatus,
    endDate: null,
  };

  const mockExistingPermissions = {
    canEditOwnPost: true,
    canEditOthersPost: false,
    canApproveRequests: false,
    canViewAllPosts: true,
    canDeletePosts: false,
    canManageAgents: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAgentUseCase,
        {
          provide: AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY,
          useValue: agentRepo,
        },
        {
          provide: AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY,
          useValue: agentPermissionRepo,
        },
        {
          provide: USER_REPO,
          useValue: userRepo,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        { provide: NotificationService, useValue: notificationService },
        {
          provide: NotificationTemplateService,
          useValue: notificationTemplateService,
        },
      ],
    }).compile();

    useCase = module.get(UpdateAgentUseCase);
    jest.clearAllMocks();
    (classValidator.validate as jest.Mock).mockResolvedValue([]);

    // default mock për template
    notificationTemplateService.getTemplate.mockReturnValue('mocked message');
  });

  describe('execute', () => {

    it('should throw BadRequestException on validation errors', async () => {
      (classValidator.validate as jest.Mock).mockResolvedValueOnce([
        {
          property: 'commissionRate',
          constraints: { min: 'error' },
        },
      ]);

      await expect(
        useCase.execute(10, 5, { commissionRate: -5 } as any, 'en', mockUser),
      ).rejects.toThrow();

      expect(agentRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if agent not found', async () => {
      agentRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, 5, {}, 'en', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw Forbidden if terminated', async () => {
      agentRepo.findById.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated',
      });

      await expect(
        useCase.execute(10, 5, { status: 'active' }, 'en', mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow update and send notification', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);

      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        commissionRate: 10,
      });

      const result = await useCase.execute(
        10,
        5,
        { commissionRate: 10 },
        'en',
        mockUser,
      );

      expect(notificationTemplateService.getTemplate).toHaveBeenCalled();

      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: 100,
        type: 'agent_updated_by_agent',
        translations: expect.arrayContaining([
          expect.objectContaining({
            languageCode: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });

      expect(result).toEqual({
        success: true,
        message: expect.any(String),
      });
    });

    it('should run transaction on termination', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);

      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated',
      });

      await useCase.execute(
        10,
        5,
        { status: 'terminated' },
        'en',
        mockUser,
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(userRepo.updateFields).toHaveBeenCalled();
      expect(agentRepo.detachAgentProducts).toHaveBeenCalled();
    });

    it('should return early if no changes', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);

      const result = await useCase.execute(
        10,
        5,
        {
          roleInAgency: 'agent',
          commissionRate: 5,
          status: 'active',
        },
        'en',
        mockUser,
      );

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
      expect(result).toEqual(mockAgentAgent);
    });

    it('should update permissions (existing)', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue(mockAgentAgent);

      await useCase.execute(
        10,
        5,
        {
          permissions: { canEditOthersPost: true },
        },
        'en',
        mockUser,
      );

      expect(agentPermissionRepo.updatePermissions).toHaveBeenCalled();
    });

    it('should create permissions (new)', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(null);
      agentRepo.updateAgencyAgent.mockResolvedValue(mockAgentAgent);

      await useCase.execute(
        10,
        5,
        {
          permissions: { canEditOwnPost: true },
        },
        'en',
        mockUser,
      );

      expect(agentPermissionRepo.createPermissions).toHaveBeenCalled();
    });
  });
});