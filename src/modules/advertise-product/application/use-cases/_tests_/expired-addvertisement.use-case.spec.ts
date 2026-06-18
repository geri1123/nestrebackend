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
            expireAndReturnAds: jest.fn(),
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

    adRepo.expireAndReturnAds.mockResolvedValue(mockExpiredAds);
    notificationService.sendNotification.mockResolvedValue({} as any);

    const result = await useCase.execute();

    expect(adRepo.expireAndReturnAds).toHaveBeenCalledWith(expect.any(Date));
    expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      userId: 10,
      type: 'advertisement_expire',
      templateData: { productId: 100 },
      metadata: { productId: 100, advertisementId: 1 },
    });
    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      userId: 20,
      type: 'advertisement_expire',
      templateData: { productId: 200 },
      metadata: { productId: 200, advertisementId: 2 },
    });
    expect(result).toBe(2);
  });

  it('should return 0 when no ads to expire', async () => {
    adRepo.expireAndReturnAds.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toBe(0);
    expect(notificationService.sendNotification).not.toHaveBeenCalled();
  });

  it('should handle notification failure and continue — Promise.allSettled', async () => {
    const mockExpiredAds = [
      { id: 1, userId: 10, productId: 100 },
      { id: 2, userId: 20, productId: 200 },
    ];

    adRepo.expireAndReturnAds.mockResolvedValue(mockExpiredAds);
    notificationService.sendNotification
      .mockRejectedValueOnce(new Error('notification failed')) // i pari dështon
      .mockResolvedValueOnce({} as any);                      // i dyti kalon

    // nuk duhet të hedhë error
    const result = await useCase.execute();
    expect(result).toBe(2);
    expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
  });

  it('should handle repository errors', async () => {
    adRepo.expireAndReturnAds.mockRejectedValue(new Error('Database error'));

    await expect(useCase.execute()).rejects.toThrow('Database error');
  });

  it('should process ads in batches of 20', async () => {
    // gjenero 25 ads — duhet 2 batch (20 + 5)
    const mockExpiredAds = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      userId: i + 10,
      productId: i + 100,
    }));

    adRepo.expireAndReturnAds.mockResolvedValue(mockExpiredAds);
    notificationService.sendNotification.mockResolvedValue({} as any);

    const result = await useCase.execute();

    expect(result).toBe(25);
    expect(notificationService.sendNotification).toHaveBeenCalledTimes(25);
  });
});