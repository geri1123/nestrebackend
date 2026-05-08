import { EMAIL_EVENTS, EmailAgentRejectedEvent } from '../../../../../infrastructure/events/email/email.events';
import { RejectAgencyRequestUseCase } from '../reject-agency-request.use-case';


describe('RejectAgencyRequestUseCase', () => {
  let useCase: RejectAgencyRequestUseCase;

  const updateUserFields = {
    execute: jest.fn(),
  } as any;

  const eventEmitter = {
    emit: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RejectAgencyRequestUseCase(updateUserFields, eventEmitter);
  });

  it('should update user fields and emit rejection email event', async () => {
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

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.AGENT_REJECTED,
      new EmailAgentRejectedEvent('test@mail.com', 'John Doe'),
    );
  });

  it('should handle missing firstName and lastName gracefully', async () => {
    const request = {
      userId: 2,
      user: {
        email: 'noname@mail.com',
        firstName: null,
        lastName: null,
      },
    } as any;

    await useCase.execute(request);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.AGENT_REJECTED,
      new EmailAgentRejectedEvent('noname@mail.com', ''),
    );
  });

  it('should handle missing user gracefully', async () => {
    const request = {
      userId: 3,
      user: undefined,
    } as any;

    await useCase.execute(request);

    expect(updateUserFields.execute).toHaveBeenCalledWith(3, {
      status: 'active',
      role: 'user',
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EMAIL_EVENTS.AGENT_REJECTED,
      new EmailAgentRejectedEvent('', ''),
    );
  });
});