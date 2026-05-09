import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestPasswordResetUseCase } from '../../password/request-password-reset.use-case';
import { USER_REPO } from '../../../../domain/repositories/user.repository.interface';
import { CacheService } from '../../../../../../infrastructure/redis/cache.service';
import { User } from '../../../../domain/entities/user.entity';
import {
  EMAIL_EVENTS,
  EmailPasswordResetRequestedEvent,
} from '../../../../../../infrastructure/events/email/email.events';

jest.mock('../../../../../../common/utils/hash', () => ({
  generateToken: () => 'fixed-token',
}));

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let userRepo: { findByEmail: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let cacheService: { set: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RequestPasswordResetUseCase,
        {
          provide: USER_REPO,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: CacheService,
          useValue: { set: jest.fn() },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RequestPasswordResetUseCase);
    userRepo = moduleRef.get(USER_REPO);
    eventEmitter = moduleRef.get(EventEmitter2);
    cacheService = moduleRef.get(CacheService);
  });

  it('emits password reset event when user exists and is active', async () => {
    const user = new User(
      1, 'john', 'john@test.com', 'John', null, null, null, null, null,
      'user', 'active', true, new Date(), null, null, false, null,
    );
    userRepo.findByEmail.mockResolvedValue(user);

    await useCase.execute('john@test.com', 'en');

    expect(cacheService.set).toHaveBeenCalledWith(
      'password_reset:fixed-token',
      { userId: 1, email: 'john@test.com' },
      10 * 60 * 1000,
    );

    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.PASSWORD_RESET_REQUESTED,
      expect.any(EmailPasswordResetRequestedEvent),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.PASSWORD_RESET_REQUESTED,
      expect.objectContaining({
        email: 'john@test.com',
        name: 'John',
        token: 'fixed-token',
        lang: 'en',
        expiresAt: expect.any(Date),
      }),
    );
  });

  it('throws NotFoundException if user does not exist', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('missing@test.com', 'al'),
    ).rejects.toThrow(NotFoundException);

    expect(eventEmitter.emit).not.toHaveBeenCalled();
    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it('throws NotFoundException if user is inactive', async () => {
    const inactiveUser = new User(
      2, 'mark', 'mark@test.com', 'Mark', null, null, null, null, null,
      'user', 'inactive', true, new Date(), null, null, false, null,
    );
    userRepo.findByEmail.mockResolvedValue(inactiveUser);

    await expect(
      useCase.execute('mark@test.com', 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(eventEmitter.emit).not.toHaveBeenCalled();
    expect(cacheService.set).not.toHaveBeenCalled();
  });
});