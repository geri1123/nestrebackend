import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GetAgencyByPublicCodeUseCase } from '../check-public-code.use-case';
import { AGENCY_REPO, type IAgencyDomainRepository } from '../../../domain/repositories/agency.repository.interface';
import { Agency } from '../../../domain/entities/agency.entity';
import { SupportedLang } from '../../../../../locales';

describe('GetAgencyByPublicCodeUseCase', () => {
  let useCase: GetAgencyByPublicCodeUseCase;
  let agencyRepository: jest.Mocked<IAgencyDomainRepository>;

  const mockAgency: Agency = new Agency(
    1,
    'Test Agency',
    'LIC-123456',
    '123 Test Street',
    100,
    'active',
    'ABC123',
    'logo-public-id',
    'test@agency.com',
    '+1234567890',
    'https://testagency.com',
    'https://cloudinary.com/logo.jpg',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAgencyByPublicCodeUseCase,
        {
          provide: AGENCY_REPO,
          useValue: {
            findByPublicCode: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAgencyByPublicCodeUseCase>(GetAgencyByPublicCodeUseCase);
    agencyRepository = module.get(AGENCY_REPO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return agency when found by public code', async () => {
      agencyRepository.findByPublicCode.mockResolvedValue(mockAgency);

      const result = await useCase.execute('ABC123', 'al');

      expect(result).toEqual(mockAgency);
      expect(agencyRepository.findByPublicCode).toHaveBeenCalledWith('ABC123');
    });

    it('should use default language when not provided', async () => {
      agencyRepository.findByPublicCode.mockResolvedValue(mockAgency);

      const result = await useCase.execute('ABC123');

      expect(result).toEqual(mockAgency);
      expect(agencyRepository.findByPublicCode).toHaveBeenCalledWith('ABC123');
    });

    it('should throw BadRequestException when agency not found', async () => {
      agencyRepository.findByPublicCode.mockResolvedValue(null);

      await expect(useCase.execute('INVALID', 'al')).rejects.toThrow(
        BadRequestException,
      );
      expect(agencyRepository.findByPublicCode).toHaveBeenCalledWith('INVALID');
    });

    it('should throw BadRequestException with correct structure', async () => {
      agencyRepository.findByPublicCode.mockResolvedValue(null);

      try {
        await useCase.execute('INVALID', 'al');
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toHaveProperty('success', false);
        expect(error.response).toHaveProperty('message');
      }
    });

    it('should handle different supported languages', async () => {
      agencyRepository.findByPublicCode.mockResolvedValue(null);

      await expect(useCase.execute('INVALID', 'en')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle case-sensitive public codes', async () => {
      agencyRepository.findByPublicCode.mockResolvedValue(mockAgency);

      await useCase.execute('abc123', 'al');

      expect(agencyRepository.findByPublicCode).toHaveBeenCalledWith('abc123');
    });

    it('should propagate repository errors', async () => {
      const dbError = new Error('Database connection failed');
      agencyRepository.findByPublicCode.mockRejectedValue(dbError);

      await expect(useCase.execute('ABC123', 'al')).rejects.toThrow(dbError);
    });
  });
});