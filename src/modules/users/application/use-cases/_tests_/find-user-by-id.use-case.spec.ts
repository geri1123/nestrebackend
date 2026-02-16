import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindUserByIdUseCase } from '../find-user-by-id.use-case';
import { USER_REPO } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let userRepo: { findById: jest.Mock };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FindUserByIdUseCase,
        {
          provide: USER_REPO,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindUserByIdUseCase);
    userRepo = moduleRef.get(USER_REPO);
  });

  it('returns user when found', async () => {
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
      new Date().toISOString(),
      null,
      null,
    );

    userRepo.findById.mockResolvedValue(user);

    const result = await useCase.execute(1, 'en');

    expect(result).toBe(user);
    expect(userRepo.findById).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when user not found', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(999, 'al'),
    ).rejects.toThrow(NotFoundException);
  });
});