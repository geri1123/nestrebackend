import { ForbiddenException } from '@nestjs/common';
import { AgentBelongsToAgencyGuard } from '../agent-belongs-to-agency.guard';
import { GetAgentByIdUseCase } from '../../../../modules/agent/application/use-cases/get-agent-by-id.use-case';
import { RequestWithUser } from '../../../../common/types/request-with-user.interface';
import { AgentEntity } from '../../../../modules/agent/domain/entities/agent.entity';

describe('AgentBelongsToAgencyGuard', () => {
  let guard: AgentBelongsToAgencyGuard;
  let getAgentByIdMock: jest.Mocked<GetAgentByIdUseCase>;

  // Helper to mock ExecutionContext
  const mockContext = (req: Partial<RequestWithUser>) => ({
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as any);

  beforeEach(() => {
    // Mock the use-case
    getAgentByIdMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAgentByIdUseCase>;

    guard = new AgentBelongsToAgencyGuard(getAgentByIdMock);
    jest.clearAllMocks();
  });

  it('allows access when agent belongs to agency', async () => {
    const agentMock = { id: 1, agencyId: 10 } as unknown as AgentEntity;

    getAgentByIdMock.execute.mockResolvedValue(agentMock);

    const req: Partial<RequestWithUser> = {
      params: { id: '1' },
      agencyId: 10,
      language: 'al',
    };

    const result = await guard.canActivate(mockContext(req));

    expect(result).toBe(true);
    expect(getAgentByIdMock.execute).toHaveBeenCalledWith(1, 'al');
  });

  it('throws ForbiddenException when agent belongs to a different agency', async () => {
    const agentMock = { id: 1, agencyId: 99 } as unknown as AgentEntity;

    getAgentByIdMock.execute.mockResolvedValue(agentMock);

    const req: Partial<RequestWithUser> = {
      params: { id: '1' },
      agencyId: 10,
      language: 'al',
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
    expect(getAgentByIdMock.execute).toHaveBeenCalledWith(1, 'al');
  });

  it('throws ForbiddenException when agent does not exist', async () => {
    // Use the same mock from beforeEach, return null safely
    getAgentByIdMock.execute.mockResolvedValue(null as unknown as AgentEntity);

    const req: Partial<RequestWithUser> = {
      params: { id: '1' },
      agencyId: 10,
      language: 'al',
    };

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
    expect(getAgentByIdMock.execute).toHaveBeenCalledWith(1, 'al');
  });

  it('parses agentId from string params correctly', async () => {
    const agentMock = { id: 42, agencyId: 10 } as unknown as AgentEntity;

    getAgentByIdMock.execute.mockResolvedValue(agentMock);

    const req: Partial<RequestWithUser> = {
      params: { id: '42' },
      agencyId: 10,
      language: 'al',
    };

    const result = await guard.canActivate(mockContext(req));

    expect(result).toBe(true);
    expect(getAgentByIdMock.execute).toHaveBeenCalledWith(42, 'al');
  });
});