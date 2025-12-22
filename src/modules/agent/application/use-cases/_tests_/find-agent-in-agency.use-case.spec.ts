import { NotFoundException } from '@nestjs/common';
import { GetSingleAgentInAgencyUseCase } from '../find-agent-in-agency.use-case';

import { SupportedLang } from '../../../../../locales';
import { IAgentDomainRepository } from '../../../domain/repositories/agents.repository.interface';
describe('GetSingleAgentInAgencyUseCase', () => {
  let useCase: GetSingleAgentInAgencyUseCase;
  let agentRepo: jest.Mocked<IAgentDomainRepository>;

  beforeEach(() => {
    agentRepo = {
      findByAgencyAndAgent: jest.fn(),
    } as unknown as jest.Mocked<IAgentDomainRepository>;

    useCase = new GetSingleAgentInAgencyUseCase(agentRepo);
  });

  it('should return agent record when agent exists in agency', async () => {
    const mockRecord = {
      agent: { id: 1, roleInAgency: 'agent' },
      agentUser: { id: 10, username: 'john_doe' },
      agency: { id: 5, agency_name: 'Test Agency' },
      permission: null,
    };

    agentRepo.findByAgencyAndAgent.mockResolvedValue(mockRecord as any);

    const result = await useCase.execute(5, 10, 'en');

    expect(agentRepo.findByAgencyAndAgent).toHaveBeenCalledWith(5, 10);
    expect(result).toEqual(mockRecord);
  });

  it('should throw NotFoundException when agent does not exist in agency', async () => {
    agentRepo.findByAgencyAndAgent.mockResolvedValue(null);

    await expect(
      useCase.execute(5, 999, 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(agentRepo.findByAgencyAndAgent).toHaveBeenCalledWith(5, 999);
  });
});