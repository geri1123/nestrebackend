import { ForbiddenException } from '@nestjs/common';
import { AgentBelongsToAgencyGuard } from '../agent-belongs-to-agency.guard';
import { GetAgentByIdUseCase } from '../../../modules/agent/application/use-cases/get-agent-by-id.use-case';
import { ModuleRef } from '@nestjs/core';

describe('AgentBelongsToAgencyGuard', () => {
  let guard: AgentBelongsToAgencyGuard;
  let getAgentByIdMock: any;
  let moduleRefMock: any;

  const mockContext = (req: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any);

  beforeEach(() => {
    getAgentByIdMock = {
      execute: jest.fn(),
    };

    moduleRefMock = {
      get: jest.fn().mockReturnValue(getAgentByIdMock),
    };

    guard = new AgentBelongsToAgencyGuard(moduleRefMock as unknown as ModuleRef);
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
    expect(moduleRefMock.get).toHaveBeenCalledWith(GetAgentByIdUseCase, { strict: false });
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

    await expect(guard.canActivate(mockContext(req))).rejects.toBeInstanceOf(ForbiddenException);
  });
});