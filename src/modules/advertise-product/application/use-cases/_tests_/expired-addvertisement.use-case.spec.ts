import { Test, TestingModule } from '@nestjs/testing';
import { ExpireProductAdsUseCase } from '../expired-addvertisement.use-cace';
import { ADVERTISE_REPO, IProductAdvertisementRepository } from '../../../domain/repositories/Iporiduct-advertisement.repository';
import { NotificationService } from '../../../../notification/notification.service';

describe('ExpireProductAdsUseCase', () => {
  let useCase: ExpireProductAdsUseCase;
  let adRepo: jest.Mocked<IProductAdvertisementRepository>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpireProductAdsUseCase,
        {
          provide: ADVERTISE_REPO,
          useValue: {
            findExpiredAds: jest.fn(), 
            expireAds: jest.fn(),
            getActiveAd: jest.fn(),
            createAdvertisementTx: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ExpireProductAdsUseCase>(ExpireProductAdsUseCase);
    adRepo = module.get(ADVERTISE_REPO);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should expire ads and send notifications', async () => {
    const mockExpiredAds = [
      { id: 1, userId: 10, productId: 100 },
      { id: 2, userId: 20, productId: 200 },
    ];

    adRepo.findExpiredAds.mockResolvedValue(mockExpiredAds);
    adRepo.expireAds.mockResolvedValue(2);
    notificationService.sendNotification.mockResolvedValue({} as any);

    const result = await useCase.execute();

    expect(adRepo.findExpiredAds).toHaveBeenCalledWith(expect.any(Date));
    expect(adRepo.expireAds).toHaveBeenCalledWith(expect.any(Date));
    expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      userId: 10,
      type: 'advertisement_expire',
      templateData: { productId: 100 },
      metadata: { productId: 100, advertisementId: 1 },
    });
    expect(result).toBe(2);
  });

  it('should return 0 when no ads to expire', async () => {
    adRepo.findExpiredAds.mockResolvedValue([]);
    adRepo.expireAds.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result).toBe(0);
    expect(notificationService.sendNotification).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    adRepo.findExpiredAds.mockRejectedValue(new Error('Database error'));

    await expect(useCase.execute()).rejects.toThrow('Database error');
  });
});