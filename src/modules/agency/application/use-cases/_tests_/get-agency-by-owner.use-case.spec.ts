import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GetAgencyByOwnerUseCase } from '../get-agency-by-owner.use-case';
import { AGENCY_REPO, type IAgencyDomainRepository } from '../../../domain/repositories/agency.repository.interface';
import { SupportedLang } from '../../../../../locales';

describe('GetAgencyByOwnerUseCase', () => {
  let useCase: GetAgencyByOwnerUseCase;
  let agencyRepo: jest.Mocked<IAgencyDomainRepository>;

  const mockAgency = {
    id: 1,
    name: 'Test Agency',
    ownerUserId: 123,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAgencyByOwnerUseCase,
        {
          provide: AGENCY_REPO,
          useValue: {
            findByOwnerUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAgencyByOwnerUseCase>(GetAgencyByOwnerUseCase);
    agencyRepo = module.get(AGENCY_REPO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return agency when found', async () => {
      agencyRepo.findByOwnerUserId.mockResolvedValue(mockAgency as any);

      const result = await useCase.execute(123, 'al');

      expect(result).toEqual(mockAgency);
      expect(agencyRepo.findByOwnerUserId).toHaveBeenCalledWith(123);
    });

    it('should throw UnauthorizedException when agency not found', async () => {
      agencyRepo.findByOwnerUserId.mockResolvedValue(null);

      await expect(useCase.execute(123, 'al')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle different languages', async () => {
      agencyRepo.findByOwnerUserId.mockResolvedValue(null);

      await expect(useCase.execute(123, 'en')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call repository with correct ownerUserId', async () => {
      agencyRepo.findByOwnerUserId.mockResolvedValue(mockAgency as any);

      await useCase.execute(456, 'al');

      expect(agencyRepo.findByOwnerUserId).toHaveBeenCalledWith(456);
    });
  });
});