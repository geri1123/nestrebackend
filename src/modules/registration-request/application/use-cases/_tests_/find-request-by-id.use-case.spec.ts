import { NotFoundException } from '@nestjs/common';
import { FindRequestByIdUseCase } from '../find-req-by-id.use-case';
import type { IRegistrationRequestRepository } from '../../../domain/repositories/registration-request.repository.interface';

describe('FindRequestByIdUseCase', () => {
  let useCase: FindRequestByIdUseCase;
  let repo: jest.Mocked<IRegistrationRequestRepository>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
    } as any;

    useCase = new FindRequestByIdUseCase(repo);
  });

  it('should return request when it exists', async () => {
    const request = { id: 1, userId: 10 };

    repo.findById.mockResolvedValue(request as any);

    const result = await useCase.execute(1, 'en');

    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(request);
  });

  it('should throw NotFoundException when request does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(999, 'en'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.findById).toHaveBeenCalledWith(999);
  });
});