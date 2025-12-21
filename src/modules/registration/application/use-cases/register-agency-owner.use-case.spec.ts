import { Test, TestingModule } from '@nestjs/testing';
import { RegisterAgencyOwnerUseCase } from './register-agency-owner.use-case';
import { RegisterUserUseCase } from './register-user.use-case';
import { CreateAgencyUseCase } from '../../../agency/application/use-cases/create-agency.use-case';
import { ValidateAgencyBeforeRegisterUseCase } from '../../../agency/application/use-cases/validate-agency-before-register.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { RegisterAgencyOwnerDto } from '../../dto/register-agency-owner.dto';

describe('RegisterAgencyOwnerUseCase', () => {
  let useCase: RegisterAgencyOwnerUseCase;

  const registerUserMock = {
    execute: jest.fn(),
  };

  const createAgencyMock = {
    execute: jest.fn(),
  };

  const validateAgencyMock = {
    execute: jest.fn(),
  };

  const prismaMock = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterAgencyOwnerUseCase,
        { provide: RegisterUserUseCase, useValue: registerUserMock },
        { provide: CreateAgencyUseCase, useValue: createAgencyMock },
        { provide: ValidateAgencyBeforeRegisterUseCase, useValue: validateAgencyMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    useCase = module.get(RegisterAgencyOwnerUseCase);
    prismaMock.$transaction.mockImplementation(cb => cb({}));
    jest.clearAllMocks();
  });

  it('registers agency owner successfully', async () => {
    validateAgencyMock.execute.mockResolvedValue(true);
    registerUserMock.execute.mockResolvedValue({ userId: 1 });
    createAgencyMock.execute.mockResolvedValue(10);

    const dto: RegisterAgencyOwnerDto = {
      username: 'owner',
      email: 'owner@test.com',
      password: '12345678',
      repeatPassword: '12345678',
      terms_accepted: true,
      first_name: 'Owner',
      last_name: 'Test',
      agency_name: 'Dream Homes',
      license_number: 'LIC-001',
      address: 'Tirana',
    };

    const result = await useCase.execute(dto, 'al');

    expect(registerUserMock.execute).toHaveBeenCalledWith(
      expect.any(Object),
      'al',
      'agency_owner',
      expect.anything(),
    );
    expect(createAgencyMock.execute).toHaveBeenCalled();
    expect(result.userId).toBe(1);
    expect(result.agencyId).toBe(10);
  });
});