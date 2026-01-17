import { Test, TestingModule } from '@nestjs/testing';
import { RegisterAgentUseCase } from '../register-agent.use-case';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { RegisterUserUseCase } from '../register-user.use-case';
import { ValidateAgentRegistrationDataUseCase } from '../validate-agent-registration-data.use-case';
import { CreateAgentRequestUseCase } from '../../../../registration-request/application/use-cases/create-agent-request.use-case';
import { RegisterAgentDto } from '../../../dto/register-agent.dto';

describe('RegisterAgentUseCase', () => {
  let useCase: RegisterAgentUseCase;

  const prismaMock = {
    $transaction: jest.fn(),
  };

  const validateAgentMock = {
    execute: jest.fn(),
  };

  const registerUserMock = {
    execute: jest.fn(),
    sendVerificationEmail: jest.fn(),
  };

  const createRequestMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterAgentUseCase,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ValidateAgentRegistrationDataUseCase, useValue: validateAgentMock },
        { provide: RegisterUserUseCase, useValue: registerUserMock },
        { provide: CreateAgentRequestUseCase, useValue: createRequestMock },
      ],
    }).compile();

    useCase = module.get(RegisterAgentUseCase);
    jest.clearAllMocks();
  });

  it('registers agent successfully', async () => {
    const mockAgency = { id: 100, agency_name: 'Test Agency' };
    const mockUserData = {
      userId: 5,
      token: 'test-token',
      email: 'agent@test.com',
      firstName: 'Agent',
      role: 'agent',
    };

    validateAgentMock.execute.mockResolvedValue(mockAgency);
    registerUserMock.execute.mockResolvedValue(mockUserData);
    createRequestMock.execute.mockResolvedValue(undefined);
    registerUserMock.sendVerificationEmail.mockResolvedValue(undefined);

    // Mock transaction to execute callback and return result
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return await callback({});
    });

    const dto: RegisterAgentDto = {
      username: 'agent',
      email: 'agent@test.com',
      password: '12345678',
      repeatPassword: '12345678',
      terms_accepted: true,
      first_name: 'Agent',
      last_name: 'Test',
      public_code: 'PUB-001',
      requested_role: 'agent',
    };

    const result = await useCase.execute(dto, 'al');

    // Verify validation
    expect(validateAgentMock.execute).toHaveBeenCalledWith(dto, 'al');

    // Verify user registration with skipEmailSending = true
    expect(registerUserMock.execute).toHaveBeenCalledWith(
      {
        username: 'agent',
        email: 'agent@test.com',
        password: '12345678',
        first_name: 'Agent',
        last_name: 'Test',
      },
      'al',
      'agent',
      expect.anything(),
      true, // skipEmailSending
    );

    // Verify request creation
    expect(createRequestMock.execute).toHaveBeenCalledWith(
      5,
      dto,
      mockAgency,
      'al',
      expect.anything(),
    );

    // Verify email was sent AFTER transaction
    expect(registerUserMock.sendVerificationEmail).toHaveBeenCalledWith(
      5,
      'test-token',
      'agent@test.com',
      'Agent',
      'agent',
      'al',
    );

    // Verify result
    expect(result.userId).toBe(5);
    expect(result.message).toBeDefined();
  });

  it('does not send email if transaction fails', async () => {
    const mockAgency = { id: 100, agency_name: 'Test Agency' };
    
    validateAgentMock.execute.mockResolvedValue(mockAgency);
    registerUserMock.execute.mockResolvedValue({
      userId: 5,
      token: 'test-token',
      email: 'agent@test.com',
      firstName: 'Agent',
      role: 'agent',
    });

    // Mock transaction to throw error
    prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'));

    const dto: RegisterAgentDto = {
      username: 'agent',
      email: 'agent@test.com',
      password: '12345678',
      repeatPassword: '12345678',
      terms_accepted: true,
      first_name: 'Agent',
      last_name: 'Test',
      public_code: 'PUB-001',
      requested_role: 'agent',
    };

    await expect(useCase.execute(dto, 'al')).rejects.toThrow('Transaction failed');

    // Verify email was NOT sent
    expect(registerUserMock.sendVerificationEmail).not.toHaveBeenCalled();
  });
});