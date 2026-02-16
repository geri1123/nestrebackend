import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase, UserProfileData } from '../get-user-profile.use-case';
import { USER_REPO } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { AgencyOwnerContextService } from '../../../../../infrastructure/auth/services/agency-owner-context.service';
import { AgentContextService } from '../../../../../infrastructure/auth/services/agent-context.service';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepo: { findById: jest.Mock };
  let agentContextService: { getAgentProfileData: jest.Mock };
  let agencyOwnerContextService: { getAgencyData: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: USER_REPO,
          useValue: { findById: jest.fn() },
        },
        {
          provide: AgentContextService,
          useValue: { getAgentProfileData: jest.fn() },
        },
        {
          provide: AgencyOwnerContextService,
          useValue: { getAgencyData: jest.fn() },
        },
      ],
    }).compile();

    useCase = moduleRef.get(GetUserProfileUseCase);
    userRepo = moduleRef.get(USER_REPO);
    agentContextService = moduleRef.get(AgentContextService);
    agencyOwnerContextService = moduleRef.get(AgencyOwnerContextService);
  });

  it('should return UserProfileData when user exists (regular user)', async () => {
    const user = new User(
      1,
      'john',
      'john@test.com',
      null,
      null,
      null,
      null,
      null,
      null,
      'user',
      'active',
      true,
      new Date().toISOString(),
      null,
      null,
    );

    userRepo.findById.mockResolvedValue(user);

    const result: UserProfileData = await useCase.execute(1, 'en');

    expect(result.user).toBe(user);
    expect(result.agentProfile).toBeUndefined();
    expect(result.agency).toBeUndefined();
    expect(userRepo.findById).toHaveBeenCalledTimes(1);
    expect(userRepo.findById).toHaveBeenCalledWith(1);
  });

  it('should return UserProfileData with agentProfile for agent', async () => {
    const user = new User(
      2,
      'agentUser',
      'agent@test.com',
      null,
      null,
      null,
      null,
      null,
      null,
      'agent',
      'active',
      true,
      new Date().toISOString(),
      null,
      null,
    );

    userRepo.findById.mockResolvedValue(user);

    const mockAgentProfile = {
      agencyAgentId: 10,
      roleInAgency: 'agent',
      status: 'active',
      commissionRate: 5,
      startDate: new Date(),
      updatedAt: new Date(),
      permissions: {
        can_edit_own_post: true,
        can_edit_others_post: false,
        can_approve_requests: false,
        can_view_all_posts: true,
        can_delete_posts: false,
        can_manage_agents: false,
      },
      agency: {
        id: 1,
        name: 'Prime Agency',
        email: null,
        logo: null,
        website: null,
        status: 'active',
      },
    };

    agentContextService.getAgentProfileData.mockResolvedValue(mockAgentProfile);

    const result = await useCase.execute(2, 'en');

    expect(result.user).toBe(user);
    expect(result.agentProfile).toEqual(mockAgentProfile);
  });

  it('should return UserProfileData with agency for agency_owner', async () => {
    const user = new User(
      3,
      'ownerUser',
      'owner@test.com',
      null,
      null,
      null,
      null,
      null,
      null,
      'agency_owner',
      'active',
      true,
      new Date().toISOString(),
      null,
      null,
    );

    userRepo.findById.mockResolvedValue(user);

    const mockAgency = {
      id: 1,
      name: 'Prime Agency',
      email: 'agency@test.com',
      logo: null,
      status: 'active',
      address: '123 Street',
      phone: '123456789',
      website: 'https://agency.com',
      licenseNumber: 'LIC123',
      publicCode: 'PUB123',
    };

    agencyOwnerContextService.getAgencyData.mockResolvedValue(mockAgency);

    const result = await useCase.execute(3, 'en');

    expect(result.user).toBe(user);
    expect(result.agency).toEqual(mockAgency);
    expect(result.agentProfile).toBeUndefined();
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 'al')).rejects.toThrow(NotFoundException);
  });
});