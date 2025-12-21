import { Test, TestingModule } from '@nestjs/testing';
import { ExpireProductAdsUseCase } from './expired-addvertisement.use-cace';
import { ADVERTISE_REPO, IProductAdvertisementRepository } from '../../domain/repositories/Iporiduct-advertisement.repository';

describe('ExpireProductAdsUseCase', () => {
  let useCase: ExpireProductAdsUseCase;
  let adRepo: jest.Mocked<IProductAdvertisementRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpireProductAdsUseCase,
        {
          provide: ADVERTISE_REPO,
          useValue: {
            expireAds: jest.fn(),
            getActiveAd: jest.fn(),
            createAdvertisementTx: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ExpireProductAdsUseCase>(ExpireProductAdsUseCase);
    adRepo = module.get(ADVERTISE_REPO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should expire ads past their end date', async () => {
    const mockDate = new Date('2024-12-21T10:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    adRepo.expireAds.mockResolvedValue(3);

    const result = await useCase.execute();

    expect(adRepo.expireAds).toHaveBeenCalledWith(mockDate);
    expect(result).toBe(3);

    jest.restoreAllMocks();
  });

  it('should return count of expired ads', async () => {
    adRepo.expireAds.mockResolvedValue(5);

    const result = await useCase.execute();

    expect(result).toBe(5);
  });

  it('should return 0 when no ads to expire', async () => {
    adRepo.expireAds.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result).toBe(0);
    expect(adRepo.expireAds).toHaveBeenCalledWith(expect.any(Date));
  });

  it('should pass current date to repository', async () => {
    const beforeCall = Date.now();
    
    adRepo.expireAds.mockResolvedValue(2);

    await useCase.execute();

    const afterCall = Date.now();
    const passedDate = adRepo.expireAds.mock.calls[0][0] as Date;

    expect(passedDate.getTime()).toBeGreaterThanOrEqual(beforeCall);
    expect(passedDate.getTime()).toBeLessThanOrEqual(afterCall);
  });

  it('should handle repository errors', async () => {
    adRepo.expireAds.mockRejectedValue(new Error('Database error'));

    await expect(useCase.execute()).rejects.toThrow('Database error');
  });
});