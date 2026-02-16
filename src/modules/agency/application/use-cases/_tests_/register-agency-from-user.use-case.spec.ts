import { Test, TestingModule } from '@nestjs/testing';
import { RegisterAgencyFromUserUseCase } from '../register-agency-from-user.use-case';
import { CreateAgencyUseCase } from '../create-agency.use-case';
import { USER_REPO } from '../../../../users/domain/repositories/user.repository.interface';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('RegisterAgencyFromUserUseCase', () => {
  let useCase: RegisterAgencyFromUserUseCase;

  const createAgencyMock = {
    execute: jest.fn(),
  };

  const userRepoMock = {
    updateFields: jest.fn(),
  };

  const prismaMock = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterAgencyFromUserUseCase,
        { provide: CreateAgencyUseCase, useValue: createAgencyMock },
        { provide: USER_REPO, useValue: userRepoMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    useCase = module.get(RegisterAgencyFromUserUseCase);
    prismaMock.$transaction.mockImplementation(cb => cb({}));
    jest.clearAllMocks();
  });

  it('creates agency and promotes user to agency_owner', async () => {
    createAgencyMock.execute.mockResolvedValue(15);

    const result = await useCase.execute(
      { agency_name: 'Dream', license_number: 'LIC-1', address: 'Tirana' },
      5,
      'al',
    );

    expect(createAgencyMock.execute).toHaveBeenCalled();
    expect(userRepoMock.updateFields).toHaveBeenCalledWith(
      5,
      { role: UserRole.agency_owner },
      expect.anything(),
    );
    expect(result.agencyId).toBe(15);
  });
});