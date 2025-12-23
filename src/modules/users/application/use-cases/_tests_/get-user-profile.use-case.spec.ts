import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase } from '../get-user-profile.use-case';
import { USER_REPO } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepo: { findById: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: USER_REPO,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(GetUserProfileUseCase);
    userRepo = moduleRef.get(USER_REPO);
  });

  it('should return user when user exists', async () => {
    const user = new User(
      1,
      'john',
      'john@test.com',
      null,
      null,
      null,
      null,
      null,
      null,
      'user',
      'active',
      true,
      new Date(),
      null,
      null,
    );

    userRepo.findById.mockResolvedValue(user);

    const result = await useCase.execute(1, 'en');

    expect(result).toBe(user);
    expect(userRepo.findById).toHaveBeenCalledTimes(1);
    expect(userRepo.findById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 'al')).rejects.toThrow(
      NotFoundException,
    );
  });
});