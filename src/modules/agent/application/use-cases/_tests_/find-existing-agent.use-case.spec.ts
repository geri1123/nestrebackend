import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FindExistingAgentUseCase } from '../find-existing-agent.use-case';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';

describe('FindExistingAgentUseCase', () => {
  let useCase: FindExistingAgentUseCase;

  const agentRepo = {
    findExistingAgent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindExistingAgentUseCase,
        {
          provide: AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY,
          useValue: agentRepo,
        },
      ],
    }).compile();

    useCase = module.get(FindExistingAgentUseCase);
    jest.clearAllMocks();
  });

  it('throws BadRequestException if agent already exists', async () => {
    agentRepo.findExistingAgent.mockResolvedValue({ id: 10 });

    await expect(
      useCase.execute(10, 'al'),
    ).rejects.toThrow(BadRequestException);

    expect(agentRepo.findExistingAgent).toHaveBeenCalledWith(10);
  });

  it('returns undefined if agent does not exist', async () => {
    agentRepo.findExistingAgent.mockResolvedValue(null);

    const result = await useCase.execute(10, 'al');

    expect(result).toBeNull();
    expect(agentRepo.findExistingAgent).toHaveBeenCalledWith(10);
  });
});