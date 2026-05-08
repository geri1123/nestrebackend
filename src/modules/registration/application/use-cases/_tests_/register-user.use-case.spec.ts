import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterUserUseCase } from '../register-user.use-case';
import { USER_REPO } from '../../../../users/domain/repositories/user.repository.interface';
import { CacheService } from '../../../../../infrastructure/cache/cache.service';
import {
  EMAIL_EVENTS,
  EmailVerificationRequestedEvent,
} from '../../../../../infrastructure/events/email/email.events';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  const userRepoMock = {
    usernameExists: jest.fn(),
    emailExists: jest.fn(),
    create: jest.fn(),
  };

  const eventEmitterMock = {
    emit: jest.fn(),
  };

  const cacheServiceMock = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPO, useValue: userRepoMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
        { provide: CacheService, useValue: cacheServiceMock },
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
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

  it('registers user successfully and emits verification event', async () => {
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
    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.VERIFICATION_REQUESTED,
      expect.any(EmailVerificationRequestedEvent),
    );
    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.VERIFICATION_REQUESTED,
      expect.objectContaining({
        email: 'john@test.com',
        name: 'John',
        lang: 'al',
      }),
    );
    expect(result.userId).toBe(1);
    expect(result.email).toBe('john@test.com');
    expect(result.firstName).toBe('John');
    expect(result.role).toBe('user');
  });

  it('registers user without emitting event when skipEmailSending is true', async () => {
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
    expect(eventEmitterMock.emit).not.toHaveBeenCalled();
    expect(result.userId).toBe(1);
    expect(result.token).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('caches token and emits verification event', async () => {
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
        { userId: 1, role: 'user' },
        30 * 60 * 1000,
      );

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        EMAIL_EVENTS.VERIFICATION_REQUESTED,
        expect.objectContaining({
          email: 'test@example.com',
          name: 'John',
          token: 'test-token',
          lang: 'al',
        }),
      );
    });
  });
});