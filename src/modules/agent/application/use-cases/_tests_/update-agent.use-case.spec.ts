import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAgentUseCase } from '../update-agent.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';
import { NotificationService } from '../../../../notification/notification.service';
import { NotificationTemplateService } from '../../../../notification/notifications-template.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';
import { USER_REPO } from '../../../../users/domain/repositories/user.repository.interface';
import { AGENCY_REPO } from '../../../../agency/domain/repositories/agency.repository.interface';
import { PRODUCT_REPO } from '../../../../product/domain/repositories/product.repository.interface';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { UserEventPublisher } from '../../../../users/application/events/user-event.publisher';
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

  const agencyRepo = {
    findOwnerUserId: jest.fn(),
  };

  const productRepo = {
    transferAgentProducts: jest.fn(),
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

  const userEventPublisher = {
    userUpdated: jest.fn(),
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
          provide: AGENCY_REPO,
          useValue: agencyRepo,
        },
        {
          provide: PRODUCT_REPO,
          useValue: productRepo,
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
        {
          provide: UserEventPublisher,
          useValue: userEventPublisher,
        },
      ],
    }).compile();

    useCase = module.get(UpdateAgentUseCase);
    jest.clearAllMocks();
    (classValidator.validate as jest.Mock).mockResolvedValue([]);
    notificationTemplateService.getTemplate.mockReturnValue('mocked message');
  });

  describe('validation', () => {
    it('should throw BadRequestException on validation errors', async () => {
      (classValidator.validate as jest.Mock).mockResolvedValueOnce([
        { property: 'commissionRate', constraints: { min: 'error' } },
      ]);

      await expect(
        useCase.execute(10, 5, { commissionRate: -5 } as any, 'en', mockUser),
      ).rejects.toThrow();

      expect(agentRepo.findById).not.toHaveBeenCalled();
    });
  });

  describe('agent lookup', () => {
    it('should throw NotFoundException if agent not found', async () => {
      agentRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, 5, {}, 'en', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if agent is already terminated', async () => {
      agentRepo.findById.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated',
      });

      await expect(
        useCase.execute(10, 5, { status: 'active' }, 'en', mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('role hierarchy (actingAgentId)', () => {
    it('should throw ForbiddenException if acting agent tries to update themselves', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);

      await expect(
        useCase.execute(10, 5, {}, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if acting agent has lower rank than target', async () => {
      // acting = agent (rank 1), target = senior_agent (rank 2) — cannot update higher
      agentRepo.findById
        .mockResolvedValueOnce(mockSeniorAgent)  // target
        .mockResolvedValueOnce(mockAgentAgent);  // acting

      await expect(
        useCase.execute(20, 5, { commissionRate: 15 }, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if acting agent has equal rank to target', async () => {
      // acting = senior_agent (rank 2), target = senior_agent (rank 2) — equal rank blocked
      agentRepo.findById
        .mockResolvedValueOnce(mockSeniorAgent)  // target
        .mockResolvedValueOnce(mockSeniorAgent); // acting (same rank)

      await expect(
        useCase.execute(20, 5, { commissionRate: 15 }, 'en', mockUser, 20),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if acting agent tries to assign a role >= their own rank', async () => {
      // acting = senior_agent (rank 2), tries to promote target to team_lead (rank 3)
      agentRepo.findById
        .mockResolvedValueOnce(mockAgentAgent)   // target (rank 1)
        .mockResolvedValueOnce(mockSeniorAgent); // acting (rank 2)

      await expect(
        useCase.execute(10, 5, { roleInAgency: 'team_lead' }, 'en', mockUser, 20),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow update if acting agent has strictly higher rank than target', async () => {
      // acting = team_lead (rank 3), target = agent (rank 1)
      agentRepo.findById
        .mockResolvedValueOnce(mockAgentAgent) // target
        .mockResolvedValueOnce(mockTeamLead);  // acting

      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        commissionRate: 8,
      });

      const result = await useCase.execute(
        10,
        5,
        { commissionRate: 8 },
        'en',
        mockUser,
        30,
      );

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });
  });

  describe('no-change early return', () => {
    it('should return existing agent without updating if nothing changed', async () => {
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
  });

  describe('standard update', () => {
    it('should update agent and send notification', async () => {
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

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ commissionRate: 10 }),
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
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });

    it('should NOT run transaction for a regular (non-termination) update', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        commissionRate: 10,
      });

      await useCase.execute(10, 5, { commissionRate: 10 }, 'en', mockUser);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('termination flow', () => {
    it('should run full transaction when terminating an agent', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agencyRepo.findOwnerUserId.mockResolvedValue(99);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated',
      });

      await useCase.execute(10, 5, { status: 'terminated' }, 'en', mockUser);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(agencyRepo.findOwnerUserId).toHaveBeenCalledWith(5);
      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ status: 'terminated' }),
        mockTx,
      );
      expect(userRepo.updateFields).toHaveBeenCalledWith(
        100,
        { role: 'user' },
        mockTx,
      );
      expect(productRepo.transferAgentProducts).toHaveBeenCalledWith(
        100,
        5,
        99,
        mockTx,
      );
    });

    it('should publish userUpdated event after termination', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agencyRepo.findOwnerUserId.mockResolvedValue(99);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated',
      });

      await useCase.execute(10, 5, { status: 'terminated' }, 'en', mockUser);

      expect(userEventPublisher.userUpdated).toHaveBeenCalledWith(100);
    });

    it('should NOT publish userUpdated event for a non-termination update', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        commissionRate: 10,
      });

      await useCase.execute(10, 5, { commissionRate: 10 }, 'en', mockUser);

      expect(userEventPublisher.userUpdated).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if agency owner is not found during termination', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agencyRepo.findOwnerUserId.mockResolvedValue(null);

      await expect(
        useCase.execute(10, 5, { status: 'terminated' }, 'en', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('permissions update', () => {
    it('should update existing permissions when they already exist', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue(mockAgentAgent);

      await useCase.execute(
        10,
        5,
        { permissions: { canEditOthersPost: true } },
        'en',
        mockUser,
      );

      expect(agentPermissionRepo.updatePermissions).toHaveBeenCalledWith(
        10,
        { canEditOthersPost: true },
      );
      expect(agentPermissionRepo.createPermissions).not.toHaveBeenCalled();
    });

    it('should create new permissions when none exist yet', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(null);
      agentRepo.updateAgencyAgent.mockResolvedValue(mockAgentAgent);

      await useCase.execute(
        10,
        5,
        { permissions: { canEditOwnPost: true } },
        'en',
        mockUser,
      );

      expect(agentPermissionRepo.createPermissions).toHaveBeenCalledWith(
        10,
        5,
        { canEditOwnPost: true },
      );
      expect(agentPermissionRepo.updatePermissions).not.toHaveBeenCalled();
    });

    it('should skip permission update if dto.permissions is not provided', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        commissionRate: 8,
      });

      await useCase.execute(10, 5, { commissionRate: 8 }, 'en', mockUser);

      expect(agentPermissionRepo.updatePermissions).not.toHaveBeenCalled();
      expect(agentPermissionRepo.createPermissions).not.toHaveBeenCalled();
    });
  });
});