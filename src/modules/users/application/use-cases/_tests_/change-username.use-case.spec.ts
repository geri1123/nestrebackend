import { BadRequestException } from '@nestjs/common';
import { ChangeUsernameUseCase } from '../change-username.use-case';

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

  const getUserProfile = {
    execute: jest.fn(),
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
      getUserProfile,
    );
  });

  it('should throw if new username is the same as current', async () => {
    getUserProfile.execute.mockResolvedValue(baseUser);

    await expect(
      useCase.execute(1, 'oldname', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if username already exists', async () => {
    getUserProfile.execute.mockResolvedValue(baseUser);
    userRepo.usernameExists.mockResolvedValue(true);

    await expect(
      useCase.execute(1, 'takenname', 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if cooldown has not passed', async () => {
    getUserProfile.execute.mockResolvedValue({
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

  it('should save history and update username on success', async () => {
    getUserProfile.execute.mockResolvedValue({
      ...baseUser,
      canUpdateUsername: jest.fn(() => true),
    });

    userRepo.usernameExists.mockResolvedValue(false);
    usernameHistoryRepo.getLastUsernameChange.mockResolvedValue(null);

    const result = await useCase.execute(1, 'newname', 'en');

    expect(usernameHistoryRepo.saveUsernameChange).toHaveBeenCalled();
    expect(userRepo.updateUsername).toHaveBeenCalledWith(1, 'newname');
    expect(result.success).toBe(true);
  });
});