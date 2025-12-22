import { BadRequestException } from '@nestjs/common';
import { GetAgencyWithOwnerByIdUseCase } from '../get-agency-with-owner-byid.use-case'; 
import type { IAgencyDomainRepository } from '../../../domain/repositories/agency.repository.interface';

describe('GetAgencyWithOwnerByIdUseCase', () => {
  let useCase: GetAgencyWithOwnerByIdUseCase;
  let repo: jest.Mocked<IAgencyDomainRepository>;

  beforeEach(() => {
    repo = {
      getAgencyWithOwnerById: jest.fn(),
    } as any;

    useCase = new GetAgencyWithOwnerByIdUseCase(repo);
  });

  it('should return agency with owner when agency exists', async () => {
    const mockAgency = {
      id: 1,
      agency_name: 'Test Agency',
      owner_user_id: 42,
    };

    repo.getAgencyWithOwnerById.mockResolvedValue(mockAgency);

    const result = await useCase.execute(1, 'en');

    expect(repo.getAgencyWithOwnerById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockAgency);
  });

  it('should throw BadRequestException when agency does not exist', async () => {
    repo.getAgencyWithOwnerById.mockResolvedValue(null);

    await expect(
      useCase.execute(999, 'en'),
    ).rejects.toThrow(BadRequestException);

    expect(repo.getAgencyWithOwnerById).toHaveBeenCalledWith(999);
  });
});