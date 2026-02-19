import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAgentUseCase } from '../update-agent.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';
import { NotificationService } from '../../../../notification/notification.service';
import { NotificationTemplateService } from '../../../../notification/notifications-template.service';
import { NotFoundException } from '@nestjs/common';
import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';
import * as classValidator from 'class-validator';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('UpdateAgentUseCase', () => {
  let useCase: UpdateAgentUseCase;

  const agentRepo = {
    findById: jest.fn(),
    updateAgencyAgent: jest.fn(),
  };

  const agentPermissionRepo = {
    getPermissionsByAgentId: jest.fn(),
    updatePermissions: jest.fn(),
    createPermissions: jest.fn(),
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

  const mockExistingAgent = {
    id: 10,
    agentUserId: 100,
    agencyId: 5,
    roleInAgency: 'agent' as AgencyAgentRoleInAgency,
    commissionRate: 5,
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
    it('should throw NotFoundException if agent does not exist', async () => {
      agentRepo.findById.mockResolvedValue(null);

      const dto = {
        roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency,
      };

      await expect(
        useCase.execute(999, 5, dto, 'al', mockUser),
      ).rejects.toThrow(NotFoundException);

      expect(agentRepo.findById).toHaveBeenCalledWith(999);
      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
    });

    it('should return existing agent if no changes detected', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const dto = {
        roleInAgency: 'agent' as AgencyAgentRoleInAgency,
        commissionRate: 5,
        status: 'active' as AgencyAgentStatus,
      };

      const result = await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(result).toEqual(mockExistingAgent);
      expect(agentRepo.updateAgencyAgent).not.toHaveBeenCalled();
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('should update agent role and send notification', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const updatedAgent = {
        ...mockExistingAgent,
        roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({
        al: 'Notification text',
        en: 'Notification text',
        it: 'Notification text',
      });

      const dto = {
        roleInAgency: 'senior_agent' as AgencyAgentRoleInAgency,
      };

      const result = await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        roleInAgency: 'senior_agent',
      });

      expect(notificationTemplateService.getAllTranslations).toHaveBeenCalledWith(
        'agent_updated_by_agent',
        expect.objectContaining({
          updatedByName: 'admin_user',
          changesText: expect.any(String),
        }),
      );

      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: 100,
        type: 'agent_updated_by_agent',
        translations: expect.any(Object),
      });

      expect(result).toEqual({
        success: true,
        message: expect.any(String),
      });
    });

    it('should update commission rate', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const updatedAgent = { ...mockExistingAgent, commissionRate: 10 };
      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = { commissionRate: 10 };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        commissionRate: 10,
      });
    });

    it('should update status', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const updatedAgent = {
        ...mockExistingAgent,
        status: 'inactive' as AgencyAgentStatus,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = { status: 'inactive' as AgencyAgentStatus };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        status: 'inactive',
      });
    });

    it('should update endDate', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const endDate = '2025-12-31';
      const updatedAgent = {
        ...mockExistingAgent,
        endDate: new Date(endDate),
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = { endDate };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        endDate: new Date(endDate),
      });
    });

    it('should update permissions when they exist', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      agentRepo.updateAgencyAgent.mockResolvedValue(mockExistingAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        permissions: {
          canEditOthersPost: true,
          canApproveRequests: true,
        },
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentPermissionRepo.updatePermissions).toHaveBeenCalledWith(10, {
        canEditOthersPost: true,
        canApproveRequests: true,
      });

      expect(agentPermissionRepo.createPermissions).not.toHaveBeenCalled();
    });

    it('should create permissions when they do not exist', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(null);

      agentRepo.updateAgencyAgent.mockResolvedValue(mockExistingAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        permissions: {
          canEditOwnPost: true,
          canViewAllPosts: true,
        },
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentPermissionRepo.createPermissions).toHaveBeenCalledWith(
        10,
        5,
        {
          canEditOwnPost: true,
          canViewAllPosts: true,
        },
      );

      expect(agentPermissionRepo.updatePermissions).not.toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const updatedAgent = {
        ...mockExistingAgent,
        roleInAgency: 'team_lead' as AgencyAgentRoleInAgency,
        commissionRate: 15,
        status: 'inactive' as AgencyAgentStatus,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        roleInAgency: 'team_lead' as AgencyAgentRoleInAgency,
        commissionRate: 15,
        status: 'inactive' as AgencyAgentStatus,
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        roleInAgency: 'team_lead',
        commissionRate: 15,
        status: 'inactive',
      });
    });

    it('should throw BadRequestException on validation errors', async () => {
      const validationError = {
        property: 'commissionRate',
        constraints: { min: 'Commission rate must be >= 0' },
      };

      (classValidator.validate as jest.Mock).mockResolvedValueOnce([validationError]);

      const dto = { commissionRate: -5 };

      await expect(
        useCase.execute(10, 5, dto as any, 'al', mockUser),
      ).rejects.toThrow();

      expect(agentRepo.findById).not.toHaveBeenCalled();
    });
  });
});