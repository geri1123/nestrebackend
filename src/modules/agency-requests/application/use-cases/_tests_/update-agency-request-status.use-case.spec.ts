import { ForbiddenException } from '@nestjs/common';
import { UpdateAgencyRequestStatusUseCase } from '../update-agency-request-status.use-case';

describe('UpdateAgencyRequestStatusUseCase', () => {
  let useCase: UpdateAgencyRequestStatusUseCase;

  const findRequestById = { execute: jest.fn() } as any;
  const approveRequest = { execute: jest.fn() } as any;
  const rejectRequest = { execute: jest.fn() } as any;
  const updateRequestStatus = { execute: jest.fn() } as any;

  beforeEach(() => {
    useCase = new UpdateAgencyRequestStatusUseCase(
      findRequestById,
      approveRequest,
      rejectRequest,
      updateRequestStatus,
    );
  });

  const baseRequest = {
    id: 1,
    userId: 10,
    agencyId: 5,
    user: {
      email: 'test@mail.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  it('should throw ForbiddenException if request belongs to another agency', async () => {
    findRequestById.execute.mockResolvedValue({
      ...baseRequest,
      agencyId: 999,
    });

    await expect(
      useCase.execute(
        1,
        5,
        100,
        { action: 'approved' } as any,
        'en',
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(approveRequest.execute).not.toHaveBeenCalled();
    expect(rejectRequest.execute).not.toHaveBeenCalled();
  });

  it('should approve request and update status', async () => {
    findRequestById.execute.mockResolvedValue(baseRequest);

    const result = await useCase.execute(
      1,
      5,
      100,
      {
        action: 'approved',
        roleInAgency: 'agent',
        commissionRate: 10,
        permissions: {},
      } as any,
      'en',
    );

    expect(approveRequest.execute).toHaveBeenCalledWith(
      {
        request: baseRequest,
        agencyId: 5,
        approvedBy: 100,
        roleInAgency: 'agent',
        commissionRate: 10,
        permissions: {},
      },
      'en',
    );

    expect(updateRequestStatus.execute).toHaveBeenCalledWith({
      requestId: 1,
      status: 'approved',
      reviewedBy: 100,
      reviewNotes: undefined,
    });

    expect(result.success).toBe(true);
  });

  it('should reject request and update status', async () => {
    findRequestById.execute.mockResolvedValue(baseRequest);

    const result = await useCase.execute(
      1,
      5,
      100,
      { action: 'rejected' } as any,
      'en',
    );

    expect(rejectRequest.execute).toHaveBeenCalledWith(baseRequest);

    expect(updateRequestStatus.execute).toHaveBeenCalledWith({
      requestId: 1,
      status: 'rejected',
      reviewedBy: 100,
      reviewNotes: undefined,
    });

    expect(result.success).toBe(true);
  });

  it('should throw error if approving without roleInAgency', async () => {
    findRequestById.execute.mockResolvedValue(baseRequest);

    await expect(
      useCase.execute(
        1,
        5,
        100,
        { action: 'approved' } as any,
        'en',
      ),
    ).rejects.toThrow('roleInAgency is required when approving');
  });
});