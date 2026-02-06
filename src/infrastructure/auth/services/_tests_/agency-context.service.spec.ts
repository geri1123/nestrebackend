import { AgencyContextService } from "../agency-context.service";

describe('AgencyContextService', () => {
  let service: AgencyContextService;
  let getAgentAuthContextMock: any;
  let getAgencyByOwnerMock: any;
  let getAgencyByIdMock: any;

  beforeEach(() => {
    getAgentAuthContextMock = { execute: jest.fn() };
    getAgencyByOwnerMock = { execute: jest.fn() };
    getAgencyByIdMock = { execute: jest.fn() };

    service = new AgencyContextService(
      getAgentAuthContextMock,
      getAgencyByOwnerMock,
      getAgencyByIdMock
    );
  });

  it('loads agent context correctly', async () => {
    getAgentAuthContextMock.execute.mockResolvedValue({
      agencyId: 1,
      agencyAgentId: 2,
      permissions: { canViewAllPosts: true },
      status: 'active',
    });
    getAgencyByIdMock.execute.mockResolvedValue({ id: 1, status: 'active' });

    const req: any = { user: { id: 1, role: 'agent' } };

    await service.loadAgencyContext(req, 'al');

    expect(req.agencyId).toBe(1);
    expect(req.agentPermissions.can_view_all_posts).toBe(true);
    expect(req.agentStatus).toBe('active');
  });

  it('throws if agent has no agency', async () => {
    getAgentAuthContextMock.execute.mockResolvedValue(null);
    const req: any = { user: { id: 1, role: 'agent' } };

    await expect(service.loadAgencyContext(req, 'al')).rejects.toThrow();
  });
});