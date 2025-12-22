import { BadRequestException } from '@nestjs/common';
import { SetUnderReviewUseCase } from '../set-under-review.use-case';
import type { IRegistrationRequestRepository } from '../../../domain/repositories/registration-request.repository.interface';

describe('SetUnderReviewUseCase', () => {
  let useCase: SetUnderReviewUseCase;
  let repo: jest.Mocked<IRegistrationRequestRepository>;

  beforeEach(() => {
    repo = {
      setLatestUnderReview: jest.fn(),
    } as any;

    useCase = new SetUnderReviewUseCase(repo);
  });

  it('should succeed when request is updated', async () => {
    repo.setLatestUnderReview.mockResolvedValue(true);

    await expect(
      useCase.execute(10, 'en'),
    ).resolves.not.toThrow();

    expect(repo.setLatestUnderReview).toHaveBeenCalledWith(10, undefined);
  });

  it('should throw BadRequestException when update fails', async () => {
    repo.setLatestUnderReview.mockResolvedValue(false);

    await expect(
      useCase.execute(10, 'en'),
    ).rejects.toThrow(BadRequestException);
  });
});