import { Test, TestingModule } from '@nestjs/testing';
import { ActivateAgencyByOwnerUseCase } from '../activate-agency-by-owner.use-case';
import { AGENCY_REPO } from '../../../domain/repositories/agency.repository.interface';
import { BadRequestException } from '@nestjs/common';

describe('ActivateAgencyByOwnerUseCase', () => {
  let useCase: ActivateAgencyByOwnerUseCase;

  const repoMock = {
    findByOwnerUserId: jest.fn(),
    activateAgency: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateAgencyByOwnerUseCase,
        { provide: AGENCY_REPO, useValue: repoMock },
      ],
    }).compile();

    useCase = module.get(ActivateAgencyByOwnerUseCase);
    jest.clearAllMocks();
  });

  it('throws if agency not found', async () => {
    repoMock.findByOwnerUserId.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 'al'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('activates agency when found', async () => {
    repoMock.findByOwnerUserId.mockResolvedValue({ id: 10 });

    await useCase.execute(1, 'al');

    expect(repoMock.activateAgency).toHaveBeenCalledWith(10, undefined);
  });
});