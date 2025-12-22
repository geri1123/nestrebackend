import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GetAgencyByIdUseCase } from '../get-agency-by-id.use-case';
import { AGENCY_REPO, type IAgencyDomainRepository } from '../../../domain/repositories/agency.repository.interface';
import { Agency } from '../../../domain/entities/agency.entity';
import { SupportedLang } from '../../../../../locales';

describe('GetAgencyByIdUseCase', () => {
  let useCase: GetAgencyByIdUseCase;
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
        GetAgencyByIdUseCase,
        {
          provide: AGENCY_REPO,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAgencyByIdUseCase>(GetAgencyByIdUseCase);
    agencyRepository = module.get(AGENCY_REPO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return agency when found by id', async () => {
      agencyRepository.findById.mockResolvedValue(mockAgency);

      const result = await useCase.execute(1, 'al');

      expect(result).toEqual(mockAgency);
      expect(agencyRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should use default language when not provided', async () => {
      agencyRepository.findById.mockResolvedValue(mockAgency);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockAgency);
      expect(agencyRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when agency not found', async () => {
      agencyRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 'al')).rejects.toThrow(
        BadRequestException,
      );
      expect(agencyRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException with correct structure', async () => {
      agencyRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(999, 'al');
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toHaveProperty('success', false);
        expect(error.response).toHaveProperty('message');
      }
    });

    it('should handle different supported languages', async () => {
      agencyRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 'en')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle different agency ids', async () => {
      const agency2 = new Agency(
        2,
        'Another Agency',
        'LIC-789012',
        '456 Another Street',
        200,
        'active',
        'XYZ789',
      );

      agencyRepository.findById.mockResolvedValue(agency2);

      const result = await useCase.execute(2, 'al');

      expect(result).toEqual(agency2);
      expect(agencyRepository.findById).toHaveBeenCalledWith(2);
    });

    it('should propagate repository errors', async () => {
      const dbError = new Error('Database connection failed');
      agencyRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute(1, 'al')).rejects.toThrow(dbError);
    });

    it('should handle zero as agency id', async () => {
      agencyRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(0, 'al')).rejects.toThrow(
        BadRequestException,
      );
      expect(agencyRepository.findById).toHaveBeenCalledWith(0);
    });

    it('should handle negative agency ids', async () => {
      agencyRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(-1, 'al')).rejects.toThrow(
        BadRequestException,
      );
      expect(agencyRepository.findById).toHaveBeenCalledWith(-1);
    });
  });
});