import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { USER_REPO } from '../../../users/domain/repositories/user.repository.interface';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { CacheService } from '../../../../infrastructure/cache/cache.service';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  const userRepoMock = {
    usernameExists: jest.fn(),
    emailExists: jest.fn(),
    create: jest.fn(),
  };

  const emailServiceMock = {
    sendVerificationEmail: jest.fn(),
  };

  const cacheServiceMock = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPO, useValue: userRepoMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
    jest.clearAllMocks();
  });

  it('throws if username exists', async () => {
    userRepoMock.usernameExists.mockResolvedValue(true);

    await expect(
      useCase.execute(
        {
          username: 'john',
          email: 'john@test.com',
          password: '12345678',
          first_name: 'John',
          last_name: 'Doe',
        },
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if email exists', async () => {
    userRepoMock.usernameExists.mockResolvedValue(false);
    userRepoMock.emailExists.mockResolvedValue(true);

    await expect(
      useCase.execute(
        {
          username: 'john',
          email: 'john@test.com',
          password: '12345678',
          first_name: 'John',
          last_name: 'Doe',
        },
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registers user successfully', async () => {
    userRepoMock.usernameExists.mockResolvedValue(false);
    userRepoMock.emailExists.mockResolvedValue(false);
    userRepoMock.create.mockResolvedValue(1);

    const result = await useCase.execute(
      {
        username: 'john',
        email: 'john@test.com',
        password: '12345678',
        first_name: 'John',
        last_name: 'Doe',
      },
      'al',
    );

    expect(userRepoMock.create).toHaveBeenCalled();
    expect(cacheServiceMock.set).toHaveBeenCalled();
    expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalled();
    expect(result.userId).toBe(1);
  });
});