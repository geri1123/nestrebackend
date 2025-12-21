import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPricingUseCase } from './get-pricing.use-case';
import { ADVERTISEMENT_PRICING_REPO } from '../../domain/repositories/advertisement-pricing.repository.interface';
import { AdvertisementPricingEntity } from '../../domain/entities/advertisement-pricing.entity';

describe('GetPricingUseCase', () => {
  let useCase: GetPricingUseCase;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      getPricing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPricingUseCase,
        { provide: ADVERTISEMENT_PRICING_REPO, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetPricingUseCase>(GetPricingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return pricing when found', async () => {
    const pricing = new AdvertisementPricingEntity(
      1,
      'BANNER',
      100,
      30,
      10,
      true,
      new Date(),
      new Date()
    );

    mockRepo.getPricing.mockResolvedValue(pricing);

    const result = await useCase.execute('BANNER');

    expect(mockRepo.getPricing).toHaveBeenCalledWith('BANNER');
    expect(result).toEqual(pricing);
  });

  it('should throw NotFoundException when pricing not found', async () => {
    mockRepo.getPricing.mockResolvedValue(null);

    await expect(useCase.execute('BANNER')).rejects.toThrow(NotFoundException);
    await expect(useCase.execute('BANNER')).rejects.toThrow('Pricing not found');
  });
});