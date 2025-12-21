import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreatePricingUseCase } from './create-pricing.use-case';
import { ADVERTISEMENT_PRICING_REPO } from '../../domain/repositories/advertisement-pricing.repository.interface';
import { AdvertisementPricingEntity } from '../../domain/entities/advertisement-pricing.entity';
import { advertisement_type } from '@prisma/client';

describe('CreatePricingUseCase', () => {
  let useCase: CreatePricingUseCase;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      getPricing: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePricingUseCase,
        { provide: ADVERTISEMENT_PRICING_REPO, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreatePricingUseCase>(CreatePricingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create pricing successfully when none exists', async () => {
    const dto = {
      adType: advertisement_type.cheap,
      price: 100,
      duration: 30,
      discount: 10,
      isActive: true,
    };

    const expected = new AdvertisementPricingEntity(
      1,
      'cheap',
      100,
      30,
      10,
      true,
      new Date(),
      new Date()
    );

    mockRepo.getPricing.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(expected);

    const result = await useCase.execute(dto);

    expect(mockRepo.getPricing).toHaveBeenCalledWith(dto.adType);
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('should throw BadRequestException when pricing already exists', async () => {
    const dto = {
      adType: advertisement_type.normal,
      price: 100,
      duration: 30,
    };

    const existing = new AdvertisementPricingEntity(
      1,
      'normal',
      100,
      30,
      null,
      true,
      new Date(),
      new Date()
    );

    mockRepo.getPricing.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(dto)).rejects.toThrow(
      'Pricing already exists for this type.'
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});