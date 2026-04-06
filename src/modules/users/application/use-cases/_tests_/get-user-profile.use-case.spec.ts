import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase, UserProfileData } from '../get-user-profile.use-case';
import { USER_REPO } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { AGENT_PROFILE_PORT } from '../../../../agent/application/ports/agent-profile.port';
import { AGENCY_OWNER_PROFILE_PORT } from '../../../../agency/application/ports/agency-owner-profile.port';
import { UserRole } from '@prisma/client';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepo: { findById: jest.Mock };
  let agentProfilePort: { getAgentProfileData: jest.Mock };
  let agencyOwnerProfilePort: { getAgencyData: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        { provide: USER_REPO, useValue: { findById: jest.fn() } },
        { provide: AGENT_PROFILE_PORT, useValue: { getAgentProfileData: jest.fn() } },
        { provide: AGENCY_OWNER_PROFILE_PORT, useValue: { getAgencyData: jest.fn() } },
      ],
    }).compile();

    useCase = moduleRef.get(GetUserProfileUseCase);
    userRepo = moduleRef.get(USER_REPO);
    agentProfilePort = moduleRef.get(AGENT_PROFILE_PORT);
    agencyOwnerProfilePort = moduleRef.get(AGENCY_OWNER_PROFILE_PORT);
  });

  it('returns profile for regular user without extra data', async () => {
    const user = new User(
      1,
      'regularUser',
      'user@test.com',
      'Regular',
      'User',
      null,
      null,
      null,
      null,
      UserRole.user, // Regular user
      'active',
      true,
      new Date(),
      null,
      null,
      false, // googleUser
      null   // googleId
    );

    userRepo.findById.mockResolvedValue(user);

    const result: UserProfileData = await useCase.execute(1, 'en');

    expect(result.user).toBe(user);
    expect(result.agentProfile).toBeUndefined();
    expect(result.agency).toBeUndefined();
    expect(userRepo.findById).toHaveBeenCalledWith(1);
  });

  it('returns agentProfile for agent user', async () => {
    const user = new User(
      2,
      'agent1',
      'agent@test.com',
      'Agent',
      'User',
      null,
      null,
      null,
      null,
      UserRole.agent, // Correct role
      'active',
      true,
      new Date(),
      null,
      null,
      false,
      null
    );

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
        name: 'Test Agency',
        email: null,
        logo: null,
        website: null,
        status: 'active',
        address: 'Tirana',
        publicCode: null,
      },
    };

    userRepo.findById.mockResolvedValue(user);
    agentProfilePort.getAgentProfileData.mockResolvedValue(mockAgentProfile);

    const result = await useCase.execute(2, 'al');

    expect(result.user).toBe(user);
    expect(result.agentProfile).toEqual(mockAgentProfile);
    expect(result.agency).toBeUndefined();
    expect(agentProfilePort.getAgentProfileData).toHaveBeenCalledWith(2, 'al');
    expect(agencyOwnerProfilePort.getAgencyData).not.toHaveBeenCalled();
  });

  it('returns agency for agency_owner user', async () => {
    const user = new User(
      3,
      'owner1',
      'owner@test.com',
      'Owner',
      'One',
      null,
      null,
      null,
      null,
      UserRole.agency_owner, // Correct role
      'active',
      true,
      new Date(),
      null,
      null,
      false,
      null
    );

    const mockAgency = {
      id: 1,
      name: 'Test Agency',
      email: 'a@test.com',
      logo: null,
      status: 'active',
      address: '123 St',
      phone: '123',
      website: null,
      licenseNumber: 'LIC001',
      publicCode: 'PUB001',
    };

    userRepo.findById.mockResolvedValue(user);
    agencyOwnerProfilePort.getAgencyData.mockResolvedValue(mockAgency);

    const result = await useCase.execute(3, 'al');

    expect(result.user).toBe(user);
    expect(result.agency).toEqual(mockAgency);
    expect(result.agentProfile).toBeUndefined();
    expect(agencyOwnerProfilePort.getAgencyData).toHaveBeenCalledWith(3, 'al');
    expect(agentProfilePort.getAgentProfileData).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute(999, 'al')).rejects.toThrow(NotFoundException);
  });
});