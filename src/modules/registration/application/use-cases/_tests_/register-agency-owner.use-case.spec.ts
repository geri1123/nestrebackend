import { Test, TestingModule } from '@nestjs/testing';
import { RegisterAgencyOwnerUseCase } from '../register-agency-owner.use-case';
import { RegisterUserUseCase } from '../register-user.use-case';
import { CreateAgencyUseCase } from '../../../../agency/application/use-cases/create-agency.use-case';
import { ValidateAgencyBeforeRegisterUseCase } from '../../../../agency/application/use-cases/validate-agency-before-register.use-case';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { RegisterAgencyOwnerDto } from '../../../dto/register-agency-owner.dto';
import { AgencyStatus } from '@prisma/client';

describe('RegisterAgencyOwnerUseCase', () => {
  let useCase: RegisterAgencyOwnerUseCase;

  const registerUserMock = {
    execute: jest.fn(),
    sendVerificationEmail: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('registers agency owner successfully', async () => {
    validateAgencyMock.execute.mockResolvedValue(undefined);
    
    const mockUserData = {
      userId: 1,
      token: 'test-token',
      email: 'owner@test.com',
      firstName: 'Owner',
      role: 'agency_owner',
    };

    registerUserMock.execute.mockResolvedValue(mockUserData);
    createAgencyMock.execute.mockResolvedValue(10);
    registerUserMock.sendVerificationEmail.mockResolvedValue(undefined);

    // Mock transaction to execute callback and return result
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return await callback({});
    });

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

    // Verify validation was called
    expect(validateAgencyMock.execute).toHaveBeenCalledWith(
      {
        agency_name: 'Dream Homes',
        license_number: 'LIC-001',
        address: 'Tirana',
      },
      'al',
    );

    // Verify user registration was called with skipEmailSending = true
    expect(registerUserMock.execute).toHaveBeenCalledWith(
      {
        username: 'owner',
        email: 'owner@test.com',
        password: '12345678',
        first_name: 'Owner',
        last_name: 'Test',
      },
      'al',
      'agency_owner',
      expect.anything(),
      true, // skipEmailSending
    );

    // Verify agency creation
    expect(createAgencyMock.execute).toHaveBeenCalledWith(
      {
        agency_name: 'Dream Homes',
        license_number: 'LIC-001',
        address: 'Tirana',
      },
      1,
      AgencyStatus.inactive,
      'al',
      expect.anything(),
    );

    // Verify email was sent AFTER transaction
    expect(registerUserMock.sendVerificationEmail).toHaveBeenCalledWith(
      1,
      'test-token',
      'owner@test.com',
      'Owner',
      'agency_owner',
      'al',
    );

    // Verify result
    expect(result.userId).toBe(1);
    expect(result.agencyId).toBe(10);
    expect(result.message).toBeDefined();
  });

  it('does not send email if transaction fails', async () => {
    validateAgencyMock.execute.mockResolvedValue(undefined);
    registerUserMock.execute.mockResolvedValue({
      userId: 1,
      token: 'test-token',
      email: 'owner@test.com',
      firstName: 'Owner',
      role: 'agency_owner',
    });

    // Mock transaction to throw error
    prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'));

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

    await expect(useCase.execute(dto, 'al')).rejects.toThrow('Transaction failed');

    // Verify email was NOT sent
    expect(registerUserMock.sendVerificationEmail).not.toHaveBeenCalled();
  });
});