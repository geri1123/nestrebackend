import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePricingUseCase } from '../update-pricing.use-case';
import { ADVERTISEMENT_PRICING_REPO } from '../../../domain/repositories/advertisement-pricing.repository.interface';
import { AdvertisementPricingEntity } from '../../../domain/entities/advertisement-pricing.entity';
import { advertisement_type } from '@prisma/client';

describe('UpdatePricingUseCase', () => {
  let useCase: UpdatePricingUseCase;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePricingUseCase,
        { provide: ADVERTISEMENT_PRICING_REPO, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdatePricingUseCase>(UpdatePricingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update pricing with all fields', async () => {
    const updateData = {
      price: 150,
      duration: 45,
      discount: 20,
      isActive: false,
    };

    const updated = new AdvertisementPricingEntity(
      1,
      'cheap',
      150,
      45,
      20,
      false,
      new Date(),
      new Date()
    );

    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute(advertisement_type.cheap, updateData);

    expect(mockRepo.update).toHaveBeenCalledWith(advertisement_type.cheap, updateData);
    expect(result).toEqual(updated);
  });

  it('should update pricing with partial fields', async () => {
    const updateData = { price: 150 };

    const updated = new AdvertisementPricingEntity(
      1,
      'normal',
      150,
      30,
      10,
      true,
      new Date(),
      new Date()
    );

    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute(advertisement_type.normal, updateData);

    expect(mockRepo.update).toHaveBeenCalledWith(advertisement_type.normal, updateData);
    expect(result).toEqual(updated);
  });

  it('should update isActive status', async () => {
    const updateData = { isActive: false };

    const updated = new AdvertisementPricingEntity(
      1,
      'premium',
      100,
      30,
      10,
      false,
      new Date(),
      new Date()
    );

    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute(advertisement_type.premium, updateData);

    expect(mockRepo.update).toHaveBeenCalledWith(advertisement_type.premium, updateData);
    expect(result.isActive).toBe(false);
  });
});