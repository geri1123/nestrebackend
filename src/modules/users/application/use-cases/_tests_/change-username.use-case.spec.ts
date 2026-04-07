import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ChangeUsernameUseCase } from '../change-username.use-case';
import { FindUserByIdUseCase } from '../find-user-by-id.use-case';
import { UserEventPublisher } from '../../events/user-event.publisher';

describe('ChangeUsernameUseCase', () => {
  let useCase: ChangeUsernameUseCase;

  const userRepo = {
    usernameExists: jest.fn(),
    updateUsername: jest.fn(),
  } as any;

  const usernameHistoryRepo = {
    getLastUsernameChange: jest.fn(),
    saveUsernameChange: jest.fn(),
  } as any;

  const findUserById = {
    execute: jest.fn(),
  } as any;

  const userEventPublisher = {
    userUpdated: jest.fn(),
  } as any;

  const baseUser = {
    id: 1,
    username: 'oldname',
    canUpdateUsername: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ChangeUsernameUseCase(
      userRepo,
      usernameHistoryRepo,
      findUserById,
      userEventPublisher, // inject the mock
    );
  });

  it('should throw if new username is the same as current', async () => {
    findUserById.execute.mockResolvedValue(baseUser);

    await expect(
      useCase.execute(1, 'oldname', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if username already exists', async () => {
    findUserById.execute.mockResolvedValue(baseUser);
    userRepo.usernameExists.mockResolvedValue(true);

    await expect(
      useCase.execute(1, 'takenname', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if cooldown has not passed', async () => {
    findUserById.execute.mockResolvedValue({
      ...baseUser,
      canUpdateUsername: jest.fn(() => false),
    });

    userRepo.usernameExists.mockResolvedValue(false);
    usernameHistoryRepo.getLastUsernameChange.mockResolvedValue({
      nextUsernameUpdate: new Date(Date.now() + 1000),
    });

    await expect(
      useCase.execute(1, 'newname', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should save history, update username, and emit event on success', async () => {
    findUserById.execute.mockResolvedValue({
      ...baseUser,
      canUpdateUsername: jest.fn(() => true),
    });

    userRepo.usernameExists.mockResolvedValue(false);
    usernameHistoryRepo.getLastUsernameChange.mockResolvedValue(null);

    const result = await useCase.execute(1, 'newname', 'en');

    expect(usernameHistoryRepo.saveUsernameChange).toHaveBeenCalledWith(
      1,
      'oldname',
      'newname',
      expect.any(Date),
    );

    expect(userRepo.updateUsername).toHaveBeenCalledWith(1, 'newname');

    expect(userEventPublisher.userUpdated).toHaveBeenCalledWith(1);

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });
});