import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAgentByIdInAgencyUseCase } from '../get-agent-in-agency.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';

describe('GetAgentByIdInAgencyUseCase', () => {
  let useCase: GetAgentByIdInAgencyUseCase;

  const agentRepo = {
    getAgentByIdInAgency: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAgentByIdInAgencyUseCase,
        {
          provide: AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY,
          useValue: agentRepo,
        },
      ],
    }).compile();

    useCase = module.get(GetAgentByIdInAgencyUseCase);
    jest.clearAllMocks();
  });

  it('returns agent when found in agency', async () => {
    const agent = { id: 5, agencyId: 10 };

    agentRepo.getAgentByIdInAgency.mockResolvedValue(agent);

    const result = await useCase.execute(5, 10, 'al');

    expect(result).toEqual(agent);
    expect(agentRepo.getAgentByIdInAgency).toHaveBeenCalledWith(5, 10);
  });

  it('throws NotFoundException if agent not found in agency', async () => {
    agentRepo.getAgentByIdInAgency.mockResolvedValue(null);

    await expect(
      useCase.execute(5, 10, 'al'),
    ).rejects.toThrow(NotFoundException);
  });
});