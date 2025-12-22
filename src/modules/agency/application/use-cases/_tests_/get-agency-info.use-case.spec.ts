import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetAgencyInfoUseCase } from '../get-agency-info.use-case';
import { AGENCY_REPO, type IAgencyDomainRepository } from '../../../domain/repositories/agency.repository.interface';
import { AgencyInfoVO } from '../../../domain/value-objects/agency-info.vo';
import { SupportedLang } from '../../../../../locales';

describe('GetAgencyInfoUseCase', () => {
  let useCase: GetAgencyInfoUseCase;
  let agencyRepository: jest.Mocked<IAgencyDomainRepository>;

  const mockActiveAgencyInfo: AgencyInfoVO = {
    id: 1,
    agencyName: 'Test Agency',
    status: 'active',
    logo: 'https://cloudinary.com/logo.jpg',
    publicCode: 'ABC123',
    address: '123 Test Street',
    phone: '+1234567890',
    website: 'https://testagency.com',
  } as AgencyInfoVO;

  const mockSuspendedAgencyInfo: AgencyInfoVO = {
    ...mockActiveAgencyInfo,
    id: 2,
    status: 'suspended',
  } as AgencyInfoVO;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAgencyInfoUseCase,
        {
          provide: AGENCY_REPO,
          useValue: {
            getAgencyInfoByOwner: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAgencyInfoUseCase>(GetAgencyInfoUseCase);
    agencyRepository = module.get(AGENCY_REPO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('when agency exists', () => {
      it('should return active agency info for public route', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockActiveAgencyInfo);

        const result = await useCase.execute(1, 'al', false);

        expect(result).toEqual(mockActiveAgencyInfo);
        expect(agencyRepository.getAgencyInfoByOwner).toHaveBeenCalledWith(1);
      });

      it('should return active agency info for protected route', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockActiveAgencyInfo);

        const result = await useCase.execute(1, 'al', true);

        expect(result).toEqual(mockActiveAgencyInfo);
        expect(agencyRepository.getAgencyInfoByOwner).toHaveBeenCalledWith(1);
      });

      it('should return suspended agency info for protected route', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockSuspendedAgencyInfo);

        const result = await useCase.execute(2, 'al', true);

        expect(result).toEqual(mockSuspendedAgencyInfo);
        expect(agencyRepository.getAgencyInfoByOwner).toHaveBeenCalledWith(2);
      });

      it('should throw NotFoundException for suspended agency on public route', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockSuspendedAgencyInfo);

        await expect(useCase.execute(2, 'al', false)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should use default language and isProtectedRoute when not provided', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockActiveAgencyInfo);

        const result = await useCase.execute(1);

        expect(result).toEqual(mockActiveAgencyInfo);
        expect(agencyRepository.getAgencyInfoByOwner).toHaveBeenCalledWith(1);
      });

      it('should use default isProtectedRoute when only language provided', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockActiveAgencyInfo);

        const result = await useCase.execute(1, 'en');

        expect(result).toEqual(mockActiveAgencyInfo);
      });
    });

    describe('when agency does not exist', () => {
      it('should throw BadRequestException when agency not found', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(null);

        await expect(useCase.execute(999, 'al')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException with correct structure', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(null);

        try {
          await useCase.execute(999, 'al');
          fail('Should have thrown BadRequestException');
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.response).toHaveProperty('success', false);
          expect(error.response).toHaveProperty('message');
        }
      });

      it('should throw BadRequestException for both protected and public routes', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(null);

        await expect(useCase.execute(999, 'al', true)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(999, 'al', false)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('status validation for public routes', () => {
      it('should throw NotFoundException for inactive status on public route', async () => {
        const inactiveAgency = {
          ...mockActiveAgencyInfo,
          status: 'inactive',
        } as AgencyInfoVO;
        
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(inactiveAgency);

        await expect(useCase.execute(1, 'al', false)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should allow inactive status on protected route', async () => {
        const inactiveAgency = {
          ...mockActiveAgencyInfo,
          status: 'inactive',
        } as AgencyInfoVO;
        
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(inactiveAgency);

        const result = await useCase.execute(1, 'al', true);

        expect(result).toEqual(inactiveAgency);
      });
    });

    describe('language handling', () => {
      it('should handle different supported languages', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(null);

        await expect(useCase.execute(999, 'en')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should pass language to error messages', async () => {
        agencyRepository.getAgencyInfoByOwner.mockResolvedValue(mockSuspendedAgencyInfo);

        await expect(useCase.execute(2, 'en', false)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('error propagation', () => {
      it('should propagate repository errors', async () => {
        const dbError = new Error('Database connection failed');
        agencyRepository.getAgencyInfoByOwner.mockRejectedValue(dbError);

        await expect(useCase.execute(1, 'al')).rejects.toThrow(dbError);
      });
    });
  });
});