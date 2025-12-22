import { RejectAgencyRequestUseCase } from '../reject-agency-request.use-case';

describe('RejectAgencyRequestUseCase', () => {
  let useCase: RejectAgencyRequestUseCase;

  const updateUserFields = {
    execute: jest.fn(),
  } as any;

  const emailService = {
    sendAgentRejectedEmail: jest.fn(),
  } as any;

  beforeEach(() => {
    useCase = new RejectAgencyRequestUseCase(
      updateUserFields,
      emailService,
    );
  });

  it('should update user fields and send rejection email', async () => {
    const request = {
      userId: 1,
      user: {
        email: 'test@mail.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    } as any;

    await useCase.execute(request);

    expect(updateUserFields.execute).toHaveBeenCalledWith(1, {
      status: 'active',
      role: 'user',
    });

    expect(emailService.sendAgentRejectedEmail).toHaveBeenCalledWith(
      'test@mail.com',
      'John Doe',
    );
  });
});