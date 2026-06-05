import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegisterUserUseCase } from '../register-user.use-case';
import { USER_REPO } from '../../../../users/domain/repositories/user.repository.interface';
import { CacheService } from '../../../../../infrastructure/redis/cache.service';
import { EmailQueueService } from '../../../../../infrastructure/queue/services/email-queue.service';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  const userRepoMock = {
    usernameExists: jest.fn(),
    emailExists: jest.fn(),
    create: jest.fn(),
  };

  const cacheServiceMock = {
    set: jest.fn(),
  };

  const emailQueueMock = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: USER_REPO,
          useValue: userRepoMock,
        },
        {
          provide: CacheService,
          useValue: cacheServiceMock,
        },
        {
          provide: EmailQueueService,
          useValue: emailQueueMock,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);

    jest.clearAllMocks();
  });

  it('throws if username exists', async () => {
    userRepoMock.usernameExists.mockResolvedValue(true);
    userRepoMock.emailExists.mockResolvedValue(false);

    await expect(
      useCase.execute(
        {
          username: 'john',
          email: 'john@test.com',
          password: '12345678',
          firstName: 'John',
          lastName: 'Doe',
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
          firstName: 'John',
          lastName: 'Doe',
        },
        'al',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registers user successfully and queues verification email', async () => {
    userRepoMock.usernameExists.mockResolvedValue(false);
    userRepoMock.emailExists.mockResolvedValue(false);
    userRepoMock.create.mockResolvedValue(1);

    const result = await useCase.execute(
      {
        username: 'john',
        email: 'john@test.com',
        password: '12345678',
        firstName: 'John',
        lastName: 'Doe',
      },
      'al',
    );

    expect(userRepoMock.create).toHaveBeenCalled();

    expect(cacheServiceMock.set).toHaveBeenCalled();

    expect(emailQueueMock.sendVerificationEmail).toHaveBeenCalledWith(
      'john@test.com',
      'John',
      expect.any(String),
      'al',
    );

    expect(result.userId).toBe(1);
    expect(result.email).toBe('john@test.com');
    expect(result.firstName).toBe('John');
    expect(result.role).toBe('user');
    expect(result.token).toBeDefined();
  });

  it('registers user without sending email when skipEmailSending is true', async () => {
    userRepoMock.usernameExists.mockResolvedValue(false);
    userRepoMock.emailExists.mockResolvedValue(false);
    userRepoMock.create.mockResolvedValue(1);

    const result = await useCase.execute(
      {
        username: 'john',
        email: 'john@test.com',
        password: '12345678',
        firstName: 'John',
        lastName: 'Doe',
      },
      'al',
      'user',
      undefined,
      true,
    );

    expect(userRepoMock.create).toHaveBeenCalled();

    expect(cacheServiceMock.set).not.toHaveBeenCalled();

    expect(
      emailQueueMock.sendVerificationEmail,
    ).not.toHaveBeenCalled();

    expect(result.userId).toBe(1);
    expect(result.token).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('caches token and queues verification email', async () => {
      await useCase.sendVerificationEmail(
        1,
        'test-token',
        'test@example.com',
        'John',
        'user',
        'al',
      );

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'email_verification:test-token',
        {
          userId: 1,
          role: 'user',
        },
        30 * 60 * 1000,
      );

      expect(emailQueueMock.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        'test-token',
        'al',
      );
    });
  });
});