import { NotFoundException } from '@nestjs/common';
import { FindRequestsByUserIdUseCase } from '../find-requests-by-user-id.use-case';
import type { IRegistrationRequestRepository } from '../../../domain/repositories/registration-request.repository.interface';

describe('FindRequestsByUserIdUseCase', () => {
  let useCase: FindRequestsByUserIdUseCase;
  let repo: jest.Mocked<IRegistrationRequestRepository>;

  beforeEach(() => {
    repo = {
      findByUserId: jest.fn(),
    } as any;

    useCase = new FindRequestsByUserIdUseCase(repo);
  });

  it('should return requests when they exist', async () => {
    const requests = [{ id: 1, userId: 10 }];

    repo.findByUserId.mockResolvedValue(requests as any);

    const result = await useCase.execute(10, 'en');

    expect(repo.findByUserId).toHaveBeenCalledWith(10);
    expect(result).toBe(requests);
  });

  it('should throw NotFoundException when no requests exist', async () => {
    repo.findByUserId.mockResolvedValue([]);

    await expect(
      useCase.execute(10, 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.findByUserId).toHaveBeenCalledWith(10);
  });
});