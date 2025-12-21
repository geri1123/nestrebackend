import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAgentUseCase } from './update-agent.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../domain/repositories/agent.repository.tokens';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationTemplateService } from '../../../notification/notifications-template.service';
import { NotFoundException } from '@nestjs/common';
import { agencyagent_role_in_agency, agencyagent_status } from '@prisma/client';
import * as classValidator from 'class-validator';

// Mock class-validator
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
    role_in_agency: 'agent' as agencyagent_role_in_agency,
    commission_rate: 5,
    status: 'active' as agencyagent_status,
    end_date: null,
  };

  const mockExistingPermissions = {
    can_edit_own_post: true,
    can_edit_others_post: false,
    can_approve_requests: false,
    can_view_all_posts: true,
    can_delete_posts: false,
    can_manage_agents: false,
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
    
    // Mock validate to return no errors by default
    (classValidator.validate as jest.Mock).mockResolvedValue([]);
  });

  describe('execute', () => {
    it('should throw NotFoundException if agent does not exist', async () => {
      agentRepo.findById.mockResolvedValue(null);

      const dto = {
        role_in_agency: 'senior_agent' as agencyagent_role_in_agency,
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

      // DTO with same values as existing agent
      const dto = {
        role_in_agency: 'agent' as agencyagent_role_in_agency,
        commission_rate: 5,
        status: 'active' as agencyagent_status,
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
        role_in_agency: 'senior_agent' as agencyagent_role_in_agency,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({
        al: 'Notification text',
        en: 'Notification text',
        it: 'Notification text',
      });

      const dto = {
        role_in_agency: 'senior_agent' as agencyagent_role_in_agency,
      };

      const result = await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        role_in_agency: 'senior_agent',
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

      const updatedAgent = {
        ...mockExistingAgent,
        commission_rate: 10,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        commission_rate: 10,
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        commission_rate: 10,
      });
    });

    it('should update status', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const updatedAgent = {
        ...mockExistingAgent,
        status: 'inactive' as agencyagent_status,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        status: 'inactive' as agencyagent_status,
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        status: 'inactive',
      });
    });

    it('should update end_date', async () => {
      agentRepo.findById.mockResolvedValue(mockExistingAgent);
      agentPermissionRepo.getPermissionsByAgentId.mockResolvedValue(
        mockExistingPermissions,
      );

      const endDate = '2025-12-31';
      const updatedAgent = {
        ...mockExistingAgent,
        end_date: new Date(endDate),
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        end_date: endDate,
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        end_date: new Date(endDate),
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
          can_edit_others_post: true,
          can_approve_requests: true,
        },
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentPermissionRepo.updatePermissions).toHaveBeenCalledWith(10, {
        can_edit_others_post: true,
        can_approve_requests: true,
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
          can_edit_own_post: true,
          can_view_all_posts: true,
        },
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentPermissionRepo.createPermissions).toHaveBeenCalledWith(
        10,
        5,
        {
          can_edit_own_post: true,
          can_view_all_posts: true,
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
        role_in_agency: 'team_lead' as agencyagent_role_in_agency,
        commission_rate: 15,
        status: 'inactive' as agencyagent_status,
      };

      agentRepo.updateAgencyAgent.mockResolvedValue(updatedAgent);
      notificationTemplateService.getAllTranslations.mockReturnValue({});

      const dto = {
        role_in_agency: 'team_lead' as agencyagent_role_in_agency,
        commission_rate: 15,
        status: 'inactive' as agencyagent_status,
      };

      await useCase.execute(10, 5, dto, 'al', mockUser);

      expect(agentRepo.updateAgencyAgent).toHaveBeenCalledWith(10, {
        role_in_agency: 'team_lead',
        commission_rate: 15,
        status: 'inactive',
      });
    });

    it('should throw BadRequestException on validation errors', async () => {
      // Mock validation to return errors
      const validationError = {
        property: 'commission_rate',
        constraints: { min: 'Commission rate must be >= 0' },
      };
      
      (classValidator.validate as jest.Mock).mockResolvedValueOnce([validationError]);

      const dto = {
        commission_rate: -5,
      };

      await expect(
        useCase.execute(10, 5, dto as any, 'al', mockUser),
      ).rejects.toThrow();

      expect(agentRepo.findById).not.toHaveBeenCalled();
    });
  });
});