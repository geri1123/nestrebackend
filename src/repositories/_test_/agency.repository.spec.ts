import { AgencyRepository } from '../agency/agency.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { generatePublicCode } from '../../common/utils/hash';

jest.mock('../../utils/hash');

describe('AgencyRepository', () => {
  let repo: AgencyRepository;
  let prisma: any;

  beforeEach(() => {
  
    prisma = {
      agency: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    repo = new AgencyRepository(prisma);
  });

  it('should return null if agency not found', async () => {
    (prisma.agency.findFirst as jest.Mock).mockResolvedValue(null);
    const result = await repo.findAgencyByUserId(1);
    expect(result).toBeNull();
  });

  it('should return agency if found', async () => {
    const mockAgency = { id: 1, agency_name: 'My Agency' };
    (prisma.agency.findFirst as jest.Mock).mockResolvedValue(mockAgency);
    const result = await repo.findAgencyByUserId(1);
    expect(result).toEqual(mockAgency);
  });

  it('should create agency with unique public code', async () => {
    (generatePublicCode as jest.Mock)
      .mockReturnValueOnce('CODE1')
      .mockReturnValueOnce('CODE2');

    (prisma.agency.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 1 }) // first exists
      .mockResolvedValueOnce(null);     // second free

    (prisma.agency.create as jest.Mock).mockResolvedValue({ id: 10 });

    const id = await repo.create({ agency_name: 'Test' } as any);
    expect(id).toBe(10);
    expect(generatePublicCode).toHaveBeenCalledTimes(2);
  });
});
