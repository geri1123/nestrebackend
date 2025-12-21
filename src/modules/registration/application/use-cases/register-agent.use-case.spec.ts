import { Test, TestingModule } from '@nestjs/testing';
import { RegisterAgentUseCase } from './register-agent.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { RegisterUserUseCase } from './register-user.use-case';
import { ValidateAgentRegistrationDataUseCase } from './validate-agent-registration-data.use-case';
import { CreateAgentRequestUseCase } from '../../../registration-request/application/use-cases/create-agent-request.use-case';
import { RegisterAgentDto } from '../../dto/register-agent.dto';

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
    prismaMock.$transaction.mockImplementation(cb => cb({}));
    jest.clearAllMocks();
  });

  it('registers agent successfully', async () => {
    validateAgentMock.execute.mockResolvedValue({ id: 100 });
    registerUserMock.execute.mockResolvedValue({ userId: 5 });

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

    expect(validateAgentMock.execute).toHaveBeenCalled();
    expect(registerUserMock.execute).toHaveBeenCalledWith(
      expect.any(Object),
      'al',
      'agent',
      expect.anything(),
    );
    expect(createRequestMock.execute).toHaveBeenCalled();
    expect(result.userId).toBe(5);
  });
});