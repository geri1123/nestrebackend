import { Test, TestingModule } from '@nestjs/testing';
import { CreateAgencyUseCase } from '../create-agency.use-case';
import { AGENCY_REPO } from '../../../domain/repositories/agency.repository.interface';
import { AgencyStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { UserEventPublisher } from '../../../../users/application/events/user-event.publisher';

describe('CreateAgencyUseCase', () => {
  let useCase: CreateAgencyUseCase;

  const repoMock = {
    agencyNameExists: jest.fn(),
    licenseExists: jest.fn(),
    create: jest.fn(),
  };

  const userEventPublisherMock = {
    userUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAgencyUseCase,
        { provide: AGENCY_REPO, useValue: repoMock },
        { provide: UserEventPublisher, useValue: userEventPublisherMock }, // ✅ FIX
      ],
    }).compile();

    useCase = module.get(CreateAgencyUseCase);
    jest.clearAllMocks();
  });

  it('throws if agency name exists', async () => {
    repoMock.agencyNameExists.mockResolvedValue(true);

    await expect(
      useCase.execute(
        { agencyName: 'Dream', licenseNumber: 'LIC-1', address: 'Tirana' },
        1,
        AgencyStatus.active,
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(userEventPublisherMock.userUpdated).not.toHaveBeenCalled(); // ✅ FIX
  });

  it('throws if license exists', async () => {
    repoMock.agencyNameExists.mockResolvedValue(false);
    repoMock.licenseExists.mockResolvedValue(true);

    await expect(
      useCase.execute(
        { agencyName: 'Dream', licenseNumber: 'LIC-1', address: 'Tirana' },
        1,
        AgencyStatus.active,
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(userEventPublisherMock.userUpdated).not.toHaveBeenCalled(); // ✅ FIX
  });

  it('creates agency and publishes event when data is valid', async () => {
    repoMock.agencyNameExists.mockResolvedValue(false);
    repoMock.licenseExists.mockResolvedValue(false);
    repoMock.create.mockResolvedValue(10);

    const agencyId = await useCase.execute(
      { agencyName: 'Dream', licenseNumber: 'LIC-1', address: 'Tirana' },
      1,
      AgencyStatus.active,
      'al',
    );

    expect(repoMock.create).toHaveBeenCalled();
    expect(agencyId).toBe(10);

    expect(userEventPublisherMock.userUpdated).toHaveBeenCalledWith(1); // ✅ FIX
  });
});