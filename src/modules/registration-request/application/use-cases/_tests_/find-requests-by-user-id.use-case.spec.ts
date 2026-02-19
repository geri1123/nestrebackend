import { NotFoundException } from '@nestjs/common';
import { FindRequestByUserIdUseCase } from '../find-requests-by-user-id.use-case';
import type { IRegistrationRequestRepository } from '../../../domain/repositories/registration-request.repository.interface';

describe('FindRequestByUserIdUseCase', () => {
  let useCase: FindRequestByUserIdUseCase;
  let repo: jest.Mocked<IRegistrationRequestRepository>;

  beforeEach(() => {
    repo = {
      findActiveRequestByUserId: jest.fn(), 
    } as any;

    useCase = new FindRequestByUserIdUseCase(repo);
  });

  it('should return request when it exists', async () => {
    const request = { id: 1, userId: 10 };
    repo.findActiveRequestByUserId.mockResolvedValue(request as any);

    const result = await useCase.execute(10, 'en');

    expect(repo.findActiveRequestByUserId).toHaveBeenCalledWith(10);
    expect(result).toBe(request);
  });

  it('should return null when no request exists', async () => {
    repo.findActiveRequestByUserId.mockResolvedValue(null);

    const result = await useCase.execute(10, 'en');

    expect(repo.findActiveRequestByUserId).toHaveBeenCalledWith(10);
    expect(result).toBeNull(); // ← no throw, just null
  });
});