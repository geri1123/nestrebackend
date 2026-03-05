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
    getAllTranslations: jest.fn(),
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
  });

  describe('execute', () => {

    // ── Validation ────────────────────────────────────────────────────────────

    it('should throw BadRequestException on validation errors', async () => {
      const validationError = {
        property: 'commissionRate',
        constraints: { min: 'Commission rate must be >= 0' },
      };
      (classValidator.validate as jest.Mock).mockResolvedValueOnce([validationError]);

      await expect(
        useCase.execute(10, 5, { commissionRate: -5 } as any, 'en', mockUser),
      ).rejects.toThrow();

      expect(agentRepo.findById).not.toHaveBeenCalled();
    });

    // ── Not found ─────────────────────────────────────────────────────────────

    it('should throw NotFoundException if target agent does not exist', async () => {
      // No actingAgentId → Promise.all resolves [null, null]
      agentRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, 5, { roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency }, 'en', mockUser),
      ).rejects.toThrow(NotFoundException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    // ── Terminated agent ──────────────────────────────────────────────────────

    it('should throw ForbiddenException if target agent is already terminated', async () => {
      agentRepo.findById.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated' as AgencyAgentStatus,
      });

      await expect(
        useCase.execute(10, 5, { status: 'active' as AgencyAgentStatus }, 'en', mockUser),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    // ── Self-update ───────────────────────────────────────────────────────────

    it('should throw ForbiddenException if agent tries to update themselves', async () => {
      // actingAgentId === id (10 === 10)
      // Promise.all fires findById(10) for target AND findById(10) for acting agent
      agentRepo.findById.mockResolvedValue(mockAgentAgent);

      await expect(
        useCase.execute(10, 5, {}, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    // ── Role hierarchy ────────────────────────────────────────────────────────

    it('should throw ForbiddenException if agent tries to update a senior_agent', async () => {
      // Promise.all resolves: [findById(target=20), findById(acting=10)]
      agentRepo.findById
        .mockResolvedValueOnce(mockSeniorAgent)  // target (rank 2)
        .mockResolvedValueOnce(mockAgentAgent);  // acting (rank 1) → target >= acting → forbidden

      await expect(
        useCase.execute(20, 5, { status: 'inactive' as AgencyAgentStatus }, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if agent tries to update a team_lead', async () => {
      agentRepo.findById
        .mockResolvedValueOnce(mockTeamLead)    // target (rank 3)
        .mockResolvedValueOnce(mockAgentAgent); // acting (rank 1)

      await expect(
        useCase.execute(30, 5, { status: 'inactive' as AgencyAgentStatus }, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if agent tries to update another agent (equal rank)', async () => {
      const anotherAgent = { ...mockAgentAgent, id: 11, agentUserId: 101 };
      agentRepo.findById
        .mockResolvedValueOnce(anotherAgent)    // target (rank 1)
        .mockResolvedValueOnce(mockAgentAgent); // acting (rank 1) → equal → forbidden

      await expect(
        useCase.execute(11, 5, { commissionRate: 8 }, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if senior_agent tries to update a team_lead', async () => {
      agentRepo.findById
        .mockResolvedValueOnce(mockTeamLead)     // target (rank 3)
        .mockResolvedValueOnce(mockSeniorAgent); // acting (rank 2)

      await expect(
        useCase.execute(30, 5, { status: 'inactive' as AgencyAgentStatus }, 'en', mockUser, 20),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if agent tries to assign senior_agent role', async () => {
      // Target rank (1) < acting rank (1) is false → actually equal → would be caught
      // by rank check first. But dto.roleInAgency = senior_agent (rank 2) >= acting (1)
      const anotherAgent = { ...mockAgentAgent, id: 11, agentUserId: 101 };
      agentRepo.findById
        .mockResolvedValueOnce(anotherAgent)    // target (rank 1)
        .mockResolvedValueOnce(mockAgentAgent); // acting (rank 1)

      await expect(
        useCase.execute(11, 5, { roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency }, 'en', mockUser, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if senior_agent tries to assign team_lead role', async () => {
      // Target is agent (rank 1) < acting senior_agent (rank 2) → rank check passes
      // dto.roleInAgency = team_lead (rank 3) >= acting (rank 2) → forbidden
      agentRepo.findById
        .mockResolvedValueOnce(mockAgentAgent)   // target (rank 1)
        .mockResolvedValueOnce(mockSeniorAgent); // acting (rank 2)

      await expect(
        useCase.execute(10, 5, { roleInAgency: 'team_lead' as AgencyAgentRoleInAgency }, 'en', mockUser, 20),
      ).rejects.toThrow(ForbiddenException);

      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should allow team_lead to update an agent', async () => {
      agentRepo.findById
        .mockResolvedValueOnce(mockAgentAgent) // target (rank 1)
        .mockResolvedValueOnce(mockTeamLead);  // acting (rank 3) → 1 < 3 → allowed

      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockAgentAgent, commissionRate: 8 });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const result = await useCase.execute(10, 5, { commissionRate: 8 }, 'en', mockUser, 30);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, { commissionRate: 8 });
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });

    it('should allow team_lead to update a senior_agent', async () => {
      agentRepo.findById
        .mockResolvedValueOnce(mockSeniorAgent) // target (rank 2)
        .mockResolvedValueOnce(mockTeamLead);   // acting (rank 3) → 2 < 3 → allowed

      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockSeniorAgent, commissionRate: 12 });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const result = await useCase.execute(20, 5, { commissionRate: 12 }, 'en', mockUser, 30);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(20, { commissionRate: 12 });
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });

    it('should allow agency owner (no actingAgentId) to update any agent', async () => {
      // No actingAgentId → second Promise.all slot is Promise.resolve(null), findById called once
      agentRepo.findById.mockResolvedValue(mockTeamLead);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockTeamLead, status: 'inactive' });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const result = await useCase.execute(
        30, 5, { status: 'inactive' as AgencyAgentStatus }, 'en', mockUser,
      );

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(30, { status: 'inactive' });
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });

    // ── Termination ───────────────────────────────────────────────────────────

    it('should run transaction on termination: update agent, revert user role, detach products', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      // updateAgencyAgent is called inside the $transaction callback with tx as 3rd arg
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        status: 'terminated',
      });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const result = await useCase.execute(
        10, 5, { status: 'terminated' as AgencyAgentStatus }, 'en', mockUser,
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(
        10,
        { status: 'terminated' },
        mockTx,
      );
      expect(userRepo.updateFields).toHaveBeenCalledWith(
        100,
        { role: 'user' },
        mockTx,
      );
      expect(agentRepo.detachAgentProducts).toHaveBeenCalledWith(
        100,
        5,
        mockTx,
      );
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });

    // ── No changes ────────────────────────────────────────────────────────────

    it('should return existing agent if no changes detected', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);

      // Exact same values as mockAgentAgent → hasAgentChanges returns false → early return
      const dto = {
        roleInAgency: 'agent' as AgencyAgentRoleInAgency,
        commissionRate: 5,
        status: 'active' as AgencyAgentStatus,
      };

      const result = await useCase.execute(10, 5, dto, 'en', mockUser);

      expect(result).toEqual(mockAgentAgent);
      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    // ── Field updates ─────────────────────────────────────────────────────────

    it('should update agent role and send notification', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockAgentAgent, roleInAgency: 'senior_agent' });
      notificationTemplateService.getAllTranslations.mockReturnValue({ al: 'txt', en: 'txt', it: 'txt' });

      const result = await useCase.execute(
        10, 5, { roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency }, 'en', mockUser,
      );

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, { roleInAgency: 'senior_agent' });
      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: 100,
        type: 'agent_updated_by_agent',
        translations: expect.any(Object),
      });
      expect(result).toEqual({ success: true, message: expect.any(String) });
    });

    it('should update commission rate', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockAgentAgent, commissionRate: 10 });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      await useCase.execute(10, 5, { commissionRate: 10 }, 'en', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, { commissionRate: 10 });
    });

    it('should update status to inactive without transaction', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockAgentAgent, status: 'inactive' });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      await useCase.execute(10, 5, { status: 'inactive' as AgencyAgentStatus }, 'en', mockUser);

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, { status: 'inactive' });
    });

    it('should update endDate', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      const endDate = '2025-12-31';
      agentRepo.updateAgencyAgent.mockResolvedValue({ ...mockAgentAgent, endDate: new Date(endDate) });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      await useCase.execute(10, 5, { endDate }, 'en', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, { endDate: new Date(endDate) });
    });

    it('should update multiple fields at once', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      agentRepo.updateAgencyAgent.mockResolvedValue({
        ...mockAgentAgent,
        roleInAgency: 'senior_agent',
        commissionRate: 15,
        status: 'inactive',
      });
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      await useCase.execute(10, 5, {
        roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency,
        commissionRate: 15,
        status: 'inactive' as AgencyAgentStatus,
      }, 'en', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        roleInAgency: 'senior_agent',
        commissionRate: 15,
        status: 'inactive',
      });
    });

    // ── Permissions ───────────────────────────────────────────────────────────

    it('should update permissions when they exist', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(mockExistingPermissions);
      // permissions differ from existing → hasAgentChanges returns true
      agentRepo.updateAgencyAgent.mockResolvedValue(mockAgentAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      await useCase.execute(10, 5, {
        permissions: { canEditOthersPost: true, canApproveRequests: true },
      }, 'en', mockUser);

      expect(agentPermissionRepo.updatePermissions).toHaveBeenCalledWith(10, {
        canEditOthersPost: true,
        canApproveRequests: true,
      });
      expect(agentPermissionRepo.createPermissions).not.toHaveBeenCalled();
    });

    it('should create permissions when they do not exist', async () => {
      agentRepo.findById.mockResolvedValue(mockAgentAgent);
      // null → no existing permissions → createPermissions
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(null);
      agentRepo.updateAgencyAgent.mockResolvedValue(mockAgentAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      await useCase.execute(10, 5, {
        permissions: { canEditOwnPost: true, canViewAllPosts: true },
      }, 'en', mockUser);

      expect(agentPermissionRepo.createPermissions).toHaveBeenCalledWith(10, 5, {
        canEditOwnPost: true,
        canViewAllPosts: true,
      });
      expect(agentPermissionRepo.updatePermissions).not.toHaveBeenCalled();
    });
  });
});