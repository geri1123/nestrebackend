import { AgentsRepository } from '../agent/agent.repository';


describe('AgentsRepository', () => {
  let repo: AgentsRepository;
  let prisma: any;

  beforeEach(() => {
    // Mock PrismaService methods
    prisma = {
      agencyagent: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    repo = new AgentsRepository(prisma);
  });

  describe('findAgentByUserId', () => {
    it('should return null if agent not found', async () => {
      (prisma.agencyagent.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repo.findAgentByUserId(1);
      expect(result).toBeNull();
    });

    it('should return agent info if found', async () => {
      const mockAgent = {
        id: 1,
        agent_id: 5,
        agency_id: 2,
        role_in_agency: 'sales',
        id_card_number: 'ABC123',
        status: 'active',
        commission_rate: 10,
        start_date: new Date(),
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
        agency: { id: 2, agency_name: 'My Agency' },
        addedByUser: { id: 3, username: 'admin', email: 'admin@test.com' },
      };
      (prisma.agencyagent.findFirst as jest.Mock).mockResolvedValue(mockAgent);

      const result = await repo.findAgentByUserId(5);
      expect(result).toEqual({
        ...mockAgent,
        commission_rate: 10,
      });
    });
  });

  describe('create', () => {
    it('should call prisma.create and return result', async () => {
      const agentData = {
        userId: 5,
        agency_id: 2,
        added_by: 3,
        id_card_number: 'ABC123',
        role_in_agency: 'sales',
        status: 'active',
        commission_rate: 10,
        start_date: new Date(),
        end_date: null,
      };

      const mockCreateResult = { id: 1, ...agentData };
      (prisma.agencyagent.create as jest.Mock).mockResolvedValue(mockCreateResult);

      const result = await repo.create(agentData as any);
      expect(prisma.agencyagent.create).toHaveBeenCalledWith({
        data: {
          agent_id: 5,
          agency_id: 2,
          added_by: 3,
          id_card_number: 'ABC123',
          role_in_agency: 'sales',
          status: 'active',
          commission_rate: 10,
          start_date: agentData.start_date,
          end_date: agentData.end_date,
        },
      });
      expect(result).toEqual(mockCreateResult);
    });
  });
});
