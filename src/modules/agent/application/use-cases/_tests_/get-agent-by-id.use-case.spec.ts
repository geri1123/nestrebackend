import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAgentByIdUseCase } from '../get-agent-by-id.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';

describe('GetAgentByIdUseCase', () => {
  let useCase: GetAgentByIdUseCase;

  const agentRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAgentByIdUseCase,
        {
          provide: AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY,
          useValue: agentRepo,
        },
      ],
    }).compile();

    useCase = module.get(GetAgentByIdUseCase);
    jest.clearAllMocks();
  });

  it('returns agent when found', async () => {
    const agent = { id: 1, agencyId: 10 };

    agentRepo.findById.mockResolvedValue(agent);

    const result = await useCase.execute(1, 'al');

    expect(result).toEqual(agent);
    expect(agentRepo.findById).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when agent does not exist', async () => {
    agentRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 'al'),
    ).rejects.toThrow(NotFoundException);
  });
});