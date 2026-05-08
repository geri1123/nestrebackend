import { SupportedLang } from '../../../locales';
import {
  AgencyMessagePayload,
  ContactMessagePayload,
  UserMessagePayload,
} from '../../queue/types/email-payloads.type';

export const EMAIL_EVENTS = {
  VERIFICATION_REQUESTED: 'email.verification.requested',
  PASSWORD_RESET_REQUESTED: 'email.password-reset.requested',
  WELCOME: 'email.welcome',
  PENDING_APPROVAL: 'email.pending-approval',
  AGENT_WELCOME: 'email.agent.welcome',
  AGENT_REJECTED: 'email.agent.rejected',
  CONTACT_MESSAGE: 'email.contact-message',
  AGENCY_MESSAGE: 'email.agency-message',
  USER_MESSAGE: 'email.user-message',
} as const;

export class EmailVerificationRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly token: string,
    public readonly lang: SupportedLang,
  ) {}
}

export class EmailPasswordResetRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly token: string,
    public readonly lang: SupportedLang,
    public readonly expiresAt: Date,
  ) {}
}

export class EmailWelcomeEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class EmailPendingApprovalEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class EmailAgentWelcomeEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class EmailAgentRejectedEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class EmailContactMessageEvent {
  constructor(public readonly payload: ContactMessagePayload) {}
}

export class EmailAgencyMessageEvent {
  constructor(public readonly payload: AgencyMessagePayload) {}
}

export class EmailUserMessageEvent {
  constructor(public readonly payload: UserMessagePayload) {}
}