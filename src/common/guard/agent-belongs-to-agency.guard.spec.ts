import { ForbiddenException } from '@nestjs/common';
import { AgentBelongsToAgencyGuard } from './AgentBelongsToAgency.guard';
import { GetAgentByIdUseCase } from '../../modules/agent/application/use-cases/get-agent-by-id.use-case';

describe('AgentBelongsToAgencyGuard', () => {
  let guard: AgentBelongsToAgencyGuard;

  const getAgentByIdMock = {
    execute: jest.fn(),
  };

  const mockContext = (req: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any);

  beforeEach(() => {
    guard = new AgentBelongsToAgencyGuard(
      getAgentByIdMock as unknown as GetAgentByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('allows access when agent belongs to agency', async () => {
    getAgentByIdMock.execute.mockResolvedValue({
      id: 1,
      agencyId: 10,
    });

    const req = {
      params: { id: '1' },
      agencyId: 10,
      language: 'al',
    };

    const result = await guard.canActivate(mockContext(req));

    expect(result).toBe(true);
    expect(getAgentByIdMock.execute).toHaveBeenCalledWith(1, 'al');
  });

  it('throws ForbiddenException when agent does not belong to agency', async () => {
    getAgentByIdMock.execute.mockResolvedValue({
      id: 1,
      agencyId: 99,
    });

    const req = {
      params: { id: '1' },
      agencyId: 10,
      language: 'al',
    };

    await expect(
      guard.canActivate(mockContext(req)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});