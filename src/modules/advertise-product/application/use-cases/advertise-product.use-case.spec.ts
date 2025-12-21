import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AdvertiseProductUseCase } from './advertise-product.use-case';
import { ADVERTISE_REPO, IProductAdvertisementRepository } from '../../domain/repositories/Iporiduct-advertisement.repository';
import { ChangeWalletBalanceUseCase } from '../../../wallet/application/use-cases/change-wallet-balance.use-case';
import { FindProductByIdUseCase } from '../../../product/application/use-cases/find-product-by-id.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { GetPricingUseCase } from '../../../advertisement-pricing/application/use-cases/get-pricing.use-case';
import { advertisement_type, wallet_transaction_type } from '@prisma/client';

describe('AdvertiseProductUseCase', () => {
  let useCase: AdvertiseProductUseCase;
  let adRepo: jest.Mocked<IProductAdvertisementRepository>;
  let changeWalletBalanceUseCase: jest.Mocked<ChangeWalletBalanceUseCase>;
  let findProduct: jest.Mocked<FindProductByIdUseCase>;
  let prisma: jest.Mocked<PrismaService>;
  let getPricingUseCase: jest.Mocked<GetPricingUseCase>;

  const mockProduct = {
    id: 1,
    userId: 100,
    status: 'active' as const,
    name: 'Test Product',
  };

  const mockPricing = {
    id: 1,
    type: advertisement_type.normal,
    price: 10,
    duration: 14,
    discount: null,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvertiseProductUseCase,
        {
          provide: ADVERTISE_REPO,
          useValue: {
            getActiveAd: jest.fn(),
            createAdvertisementTx: jest.fn(),
            expireAds: jest.fn(),
          },
        },
        {
          provide: ChangeWalletBalanceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: FindProductByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: GetPricingUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<AdvertiseProductUseCase>(AdvertiseProductUseCase);
    adRepo = module.get(ADVERTISE_REPO);
    changeWalletBalanceUseCase = module.get(ChangeWalletBalanceUseCase);
    findProduct = module.get(FindProductByIdUseCase);
    prisma = module.get(PrismaService);
    getPricingUseCase = module.get(GetPricingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('should throw BadRequestException if product not found', async () => {
      findProduct.execute.mockResolvedValue(null as any);

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow(BadRequestException);

      expect(findProduct.execute).toHaveBeenCalledWith(1, 'en');
    });

    it('should throw ForbiddenException if user does not own product', async () => {
      findProduct.execute.mockResolvedValue({ ...mockProduct, userId: 999 } as any);

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if product is not active', async () => {
      findProduct.execute.mockResolvedValue({ ...mockProduct, status: 'inactive' } as any);

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product already advertised', async () => {
      findProduct.execute.mockResolvedValue(mockProduct as any);
      adRepo.getActiveAd.mockResolvedValue({ id: 1, productId: 1 } as any);

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow(BadRequestException);

      expect(adRepo.getActiveAd).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if advertisement type is not active', async () => {
      findProduct.execute.mockResolvedValue(mockProduct as any);
      adRepo.getActiveAd.mockResolvedValue(null);
      getPricingUseCase.execute.mockResolvedValue({ ...mockPricing, isActive: false } as any);

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow(BadRequestException);

      expect(getPricingUseCase.execute).toHaveBeenCalledWith(advertisement_type.normal);
    });
  });

  describe('price calculation', () => {
    beforeEach(() => {
      findProduct.execute.mockResolvedValue(mockProduct as any);
      adRepo.getActiveAd.mockResolvedValue(null);
    });

    it('should use base price when no discount', async () => {
      getPricingUseCase.execute.mockResolvedValue(mockPricing as any);
      
      const mockTx = {} as any;
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      changeWalletBalanceUseCase.execute.mockResolvedValue({ transactionId: 123 } as any);
      adRepo.createAdvertisementTx.mockResolvedValue({ id: 1 } as any);

      await useCase.execute(1, advertisement_type.normal, 100, 'en');

      expect(changeWalletBalanceUseCase.execute).toHaveBeenCalledWith(
        {
          userId: 100,
          type: wallet_transaction_type.purchase,
          amount: 10,
          language: 'en',
        },
        mockTx
      );
    });

    it('should apply discount correctly', async () => {
      getPricingUseCase.execute.mockResolvedValue({
        ...mockPricing,
        discount: 0.2,
      } as any);

      const mockTx = {} as any;
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      changeWalletBalanceUseCase.execute.mockResolvedValue({ transactionId: 123 } as any);
      adRepo.createAdvertisementTx.mockResolvedValue({ id: 1 } as any);

      await useCase.execute(1, advertisement_type.normal, 100, 'en');

      expect(changeWalletBalanceUseCase.execute).toHaveBeenCalledWith(
        {
          userId: 100,
          type: wallet_transaction_type.purchase,
          amount: 8,
          language: 'en',
        },
        mockTx
      );
    });
  });

  describe('transaction', () => {
    beforeEach(() => {
      findProduct.execute.mockResolvedValue(mockProduct as any);
      adRepo.getActiveAd.mockResolvedValue(null);
      getPricingUseCase.execute.mockResolvedValue(mockPricing as any);
    });

    it('should create ad and deduct wallet balance successfully', async () => {
      const mockTx = {} as any;
      const mockTransactionId = 123;
      const mockAd = {
        id: 1,
        productId: 1,
        userId: 100,
        type: advertisement_type.normal,
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      changeWalletBalanceUseCase.execute.mockResolvedValue({ 
        transactionId: mockTransactionId 
      } as any);
      
      adRepo.createAdvertisementTx.mockResolvedValue(mockAd as any);

      const result = await useCase.execute(1, advertisement_type.normal, 100, 'en');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(changeWalletBalanceUseCase.execute).toHaveBeenCalledWith(
        {
          userId: 100,
          type: wallet_transaction_type.purchase,
          amount: 10,
          language: 'en',
        },
        mockTx
      );
      
      expect(adRepo.createAdvertisementTx).toHaveBeenCalledWith(
        mockTx,
        1,
        100,
        advertisement_type.normal,
        expect.any(Date),
        expect.any(Date),
        mockTransactionId
      );

      expect(result).toEqual(mockAd);
    });

    it('should calculate correct end date based on duration', async () => {
      const mockTx = {} as any;
      
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      changeWalletBalanceUseCase.execute.mockResolvedValue({ 
        transactionId: 123 
      } as any);
      
      adRepo.createAdvertisementTx.mockResolvedValue({ id: 1 } as any);

      const beforeExecution = Date.now();
      await useCase.execute(1, advertisement_type.normal, 100, 'en');
      const afterExecution = Date.now();

      const createAdCall = adRepo.createAdvertisementTx.mock.calls[0];
      const startDate = createAdCall[4] as Date;
      const endDate = createAdCall[5] as Date;

      expect(startDate.getTime()).toBeGreaterThanOrEqual(beforeExecution);
      expect(startDate.getTime()).toBeLessThanOrEqual(afterExecution);

      const expectedDuration = 14 * 24 * 60 * 60 * 1000;
      const actualDuration = endDate.getTime() - startDate.getTime();
      expect(actualDuration).toBeCloseTo(expectedDuration, -3);
    });

    it('should throw BadRequestException on insufficient balance', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({} as any);
      });

      changeWalletBalanceUseCase.execute.mockRejectedValue(
        new Error('Insufficient balance')
      );

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow(BadRequestException);
    });

    it('should rollback transaction on failure', async () => {
      const mockTx = {} as any;
      
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      changeWalletBalanceUseCase.execute.mockResolvedValue({ 
        transactionId: 123 
      } as any);
      
      adRepo.createAdvertisementTx.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow('Database error');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should rethrow non-balance errors', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({} as any);
      });

      changeWalletBalanceUseCase.execute.mockRejectedValue(
        new Error('Some other error')
      );

      await expect(
        useCase.execute(1, advertisement_type.normal, 100, 'en')
      ).rejects.toThrow('Some other error');
    });
  });

  describe('integration scenarios', () => {
    it('should handle premium ad type with discount', async () => {
      findProduct.execute.mockResolvedValue(mockProduct as any);
      adRepo.getActiveAd.mockResolvedValue(null);
      getPricingUseCase.execute.mockResolvedValue({
        id: 3,
        type: advertisement_type.premium,
        price: 20,
        duration: 30,
        discount: 0.15,
        isActive: true,
      } as any);

      const mockTx = {} as any;
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      changeWalletBalanceUseCase.execute.mockResolvedValue({ 
        transactionId: 456 
      } as any);
      
      adRepo.createAdvertisementTx.mockResolvedValue({ 
        id: 2,
        type: advertisement_type.premium 
      } as any);

      await useCase.execute(1, advertisement_type.premium, 100, 'en');

      expect(changeWalletBalanceUseCase.execute).toHaveBeenCalledWith(
        {
          userId: 100,
          type: wallet_transaction_type.purchase,
          amount: 17,
          language: 'en',
        },
        mockTx
      );
    });
  });
});