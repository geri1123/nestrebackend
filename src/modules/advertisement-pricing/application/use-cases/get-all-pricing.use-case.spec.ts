import { Test, TestingModule } from '@nestjs/testing';
import { GetAllPricingUseCase } from './get-all-pricing.use-case';
import { ADVERTISEMENT_PRICING_REPO } from '../../domain/repositories/advertisement-pricing.repository.interface';
import { AdvertisementPricingEntity } from '../../domain/entities/advertisement-pricing.entity';

describe('GetAllPricingUseCase', () => {
  let useCase: GetAllPricingUseCase;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      getAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllPricingUseCase,
        { provide: ADVERTISEMENT_PRICING_REPO, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetAllPricingUseCase>(GetAllPricingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all pricing records', async () => {
    const pricings = [
      new AdvertisementPricingEntity(1, 'BANNER', 100, 30, 10, true, new Date(), new Date()),
      new AdvertisementPricingEntity(2, 'VIDEO', 200, 60, 15, true, new Date(), new Date()),
    ];

    mockRepo.getAll.mockResolvedValue(pricings);

    const result = await useCase.execute();

    expect(mockRepo.getAll).toHaveBeenCalled();
    expect(result).toEqual(pricings);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no pricing exists', async () => {
    mockRepo.getAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepo.getAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});