import { Test, TestingModule } from '@nestjs/testing';
import { CreateAgencyUseCase } from '../create-agency.use-case';
import { AGENCY_REPO } from '../../../domain/repositories/agency.repository.interface';
import { AgencyStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('CreateAgencyUseCase', () => {
  let useCase: CreateAgencyUseCase;

  const repoMock = {
    agencyNameExists: jest.fn(),
    licenseExists: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAgencyUseCase,
        { provide: AGENCY_REPO, useValue: repoMock },
      ],
    }).compile();

    useCase = module.get(CreateAgencyUseCase);
    jest.clearAllMocks();
  });

  it('throws if agency name exists', async () => {
    repoMock.agencyNameExists.mockResolvedValue(true);

    await expect(
      useCase.execute(
        { agency_name: 'Dream', license_number: 'LIC-1', address: 'Tirana' },
        1,
        AgencyStatus.active,
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if license exists', async () => {
    repoMock.agencyNameExists.mockResolvedValue(false);
    repoMock.licenseExists.mockResolvedValue(true);

    await expect(
      useCase.execute(
        { agency_name: 'Dream', license_number: 'LIC-1', address: 'Tirana' },
        1,
        AgencyStatus.active,
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates agency when data is valid', async () => {
    repoMock.agencyNameExists.mockResolvedValue(false);
    repoMock.licenseExists.mockResolvedValue(false);
    repoMock.create.mockResolvedValue(10);

    const agencyId = await useCase.execute(
      { agency_name: 'Dream', license_number: 'LIC-1', address: 'Tirana' },
      1,
      AgencyStatus.active,
      'al',
    );

    expect(repoMock.create).toHaveBeenCalled();
    expect(agencyId).toBe(10);
  });
});