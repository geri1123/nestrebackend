import { Test, TestingModule } from '@nestjs/testing';
import { EnsureIdCardUniqueUseCase } from '../ensure-idcard-unique.use-case';
import { BadRequestException } from '@nestjs/common';
import { AGENT_REPOSITORY_TOKENS } from '../../../domain/repositories/agent.repository.tokens';

describe('EnsureIdCardUniqueUseCase', () => {
  let useCase: EnsureIdCardUniqueUseCase;

  const agentRepo = {
    findByIdCardNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnsureIdCardUniqueUseCase,
        {
          provide: AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY,
          useValue: agentRepo,
        },
      ],
    }).compile();

    useCase = module.get(EnsureIdCardUniqueUseCase);
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────

  it('throws BadRequestException if ID card already exists', async () => {
    agentRepo.findByIdCardNumber.mockResolvedValue({ id: 1 });

    await expect(
      useCase.execute('ID-123', 'al'),
    ).rejects.toThrow(BadRequestException);

    expect(agentRepo.findByIdCardNumber).toHaveBeenCalledWith('ID-123');
  });

  // ─────────────────────────────────────────────

  it('passes silently if ID card is unique', async () => {
    agentRepo.findByIdCardNumber.mockResolvedValue(null);

    await expect(
      useCase.execute('ID-123', 'al'),
    ).resolves.not.toThrow();

    expect(agentRepo.findByIdCardNumber).toHaveBeenCalledWith('ID-123');
  });
});