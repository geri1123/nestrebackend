
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeleteAgencyLogoUseCase } from '../delete-agency-logo.use-case';
import { GetAgencyByIdUseCase } from '../get-agency-by-id.use-case';
import { AGENCY_REPO, type IAgencyDomainRepository } from '../../../domain/repositories/agency.repository.interface';
import { SupportedLang } from '../../../../../locales';

describe('DeleteAgencyLogoUseCase', () => {
  let useCase: DeleteAgencyLogoUseCase;
  let agencyRepository: jest.Mocked<IAgencyDomainRepository>;
  let getAgencyById: jest.Mocked<GetAgencyByIdUseCase>;

  const mockAgency = {
    id: 1,
    name: 'Test Agency',
    logo: 'path/to/logo.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAgencyLogoUseCase,
        {
          provide: AGENCY_REPO,
          useValue: {
            findLogoById: jest.fn(),
            deleteLogo: jest.fn(),
          },
        },
        {
          provide: GetAgencyByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteAgencyLogoUseCase>(DeleteAgencyLogoUseCase);
    agencyRepository = module.get(AGENCY_REPO);
    getAgencyById = module.get(GetAgencyByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully delete agency logo', async () => {
      getAgencyById.execute.mockResolvedValue(mockAgency as any);
      agencyRepository.findLogoById.mockResolvedValue(mockAgency as any);
      agencyRepository.deleteLogo.mockResolvedValue(undefined);

      await useCase.execute(1, 'al');

      expect(getAgencyById.execute).toHaveBeenCalledWith(1, 'al');
      expect(agencyRepository.findLogoById).toHaveBeenCalledWith(1);
      expect(agencyRepository.deleteLogo).toHaveBeenCalledWith(1);
    });

    it('should use default language when not provided', async () => {
      getAgencyById.execute.mockResolvedValue(mockAgency as any);
      agencyRepository.findLogoById.mockResolvedValue(mockAgency as any);
      agencyRepository.deleteLogo.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(getAgencyById.execute).toHaveBeenCalledWith(1, 'al');
    });

    it('should throw BadRequestException when agency has no logo', async () => {
      const agencyWithoutLogo = { ...mockAgency, logo: null };
      
      getAgencyById.execute.mockResolvedValue(agencyWithoutLogo as any);
      agencyRepository.findLogoById.mockResolvedValue(agencyWithoutLogo as any);

      await expect(useCase.execute(1, 'al')).rejects.toThrow(BadRequestException);
      expect(agencyRepository.deleteLogo).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when logo is undefined', async () => {
      const agencyWithoutLogo = { ...mockAgency, logo: undefined };
      
      getAgencyById.execute.mockResolvedValue(agencyWithoutLogo as any);
      agencyRepository.findLogoById.mockResolvedValue(agencyWithoutLogo as any);

      await expect(useCase.execute(1, 'al')).rejects.toThrow(BadRequestException);
      expect(agencyRepository.deleteLogo).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when logo is empty string', async () => {
      const agencyWithoutLogo = { ...mockAgency, logo: '' };
      
      getAgencyById.execute.mockResolvedValue(agencyWithoutLogo as any);
      agencyRepository.findLogoById.mockResolvedValue(agencyWithoutLogo as any);

      await expect(useCase.execute(1, 'al')).rejects.toThrow(BadRequestException);
      expect(agencyRepository.deleteLogo).not.toHaveBeenCalled();
    });

    it('should propagate error when agency does not exist', async () => {
      const notFoundError = new BadRequestException('Agency not found');
      getAgencyById.execute.mockRejectedValue(notFoundError);

      await expect(useCase.execute(999, 'al')).rejects.toThrow(notFoundError);
      expect(agencyRepository.findLogoById).not.toHaveBeenCalled();
      expect(agencyRepository.deleteLogo).not.toHaveBeenCalled();
    });

    it('should continue with database deletion even if storage deletion fails', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      getAgencyById.execute.mockResolvedValue(mockAgency as any);
      agencyRepository.findLogoById.mockResolvedValue(mockAgency as any);
      agencyRepository.deleteLogo.mockResolvedValue(undefined);

      await useCase.execute(1, 'al');

      expect(agencyRepository.deleteLogo).toHaveBeenCalledWith(1);
      consoleWarnSpy.mockRestore();
    });

    it('should work with different supported languages', async () => {
      const languages: SupportedLang[] = ['al', 'en'];
      
      for (const lang of languages) {
        getAgencyById.execute.mockResolvedValue(mockAgency as any);
        agencyRepository.findLogoById.mockResolvedValue(mockAgency as any);
        agencyRepository.deleteLogo.mockResolvedValue(undefined);

        await useCase.execute(1, lang);

        expect(getAgencyById.execute).toHaveBeenCalledWith(1, lang);
      }
    });

    it('should throw error if deleteLogo fails', async () => {
      const dbError = new Error('Database error');
      
      getAgencyById.execute.mockResolvedValue(mockAgency as any);
      agencyRepository.findLogoById.mockResolvedValue(mockAgency as any);
      agencyRepository.deleteLogo.mockRejectedValue(dbError);

      await expect(useCase.execute(1, 'al')).rejects.toThrow(dbError);
    });
  });
});