import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { EMAIL_TRANSPORTER, EmailProvider } from '../email.provider';
import { AppConfigService } from '../../config/config.service';
import type { Transporter } from 'nodemailer';

// --- Mock templates ---
jest.mock('../tamplates', () => ({
  verificationEmailTemplate: jest.fn((name, link) => `Verification: ${name}, ${link}`),
  welcomeEmailTemplate: jest.fn((name) => `Welcome: ${name}`),
  pendingApprovalEmailTemplate: jest.fn((name) => `Pending: ${name}`),
  changePasswordTemplate: jest.fn((name) => `ChangePassword: ${name}`),
  AgentWellcomeEmailTemplate: jest.fn((name) => `AgentWelcome: ${name}`),
  AgentRejectedEmailTemplate: jest.fn((name) => `AgentRejected: ${name}`),
  passwordRecoveryTemplate: jest.fn((name, link) => `Recovery: ${name}, ${link}`),
}));

describe('EmailService', () => {
  let service: EmailService;
  let transporterMock: jest.Mocked<Transporter>;
  let configServiceMock: Partial<AppConfigService>;

  beforeAll(() => {
    // Silence Nest logger during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(async () => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue({}),
    } as any;

    configServiceMock = {
      emailUser: 'test@example.com',
      clientBaseUrl: 'http://localhost:3000',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: EMAIL_TRANSPORTER, useValue: transporterMock },
        { provide: AppConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send verification email', async () => {
    const result = await service.sendVerificationEmail('user@test.com', 'John', 'token123');
    expect(result).toBe(true);
    expect(transporterMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Verify Your Account',
        html: expect.stringContaining('Verification: John'),
      }),
    );
  });

  it('should throw error if verification token is empty', async () => {
    await expect(
      service.sendVerificationEmail('user@test.com', 'John', ''),
    ).rejects.toThrow('Verification token cannot be empty');
  });

  it('should send welcome email', async () => {
    const result = await service.sendWelcomeEmail('user@test.com', 'John');
    expect(result).toBe(true);
    expect(transporterMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Welcome to Real Estate Platform',
        html: expect.stringContaining('Welcome: John'),
      }),
    );
  });

  it('should send pending approval email', async () => {
    const result = await service.sendPendingApprovalEmail('user@test.com', 'John');
    expect(result).toBe(true);
    expect(transporterMock.sendMail).toHaveBeenCalled();
  });

  it('should send change password email', async () => {
    const result = await service.sendChangePasswordEmail('user@test.com', 'John');
    expect(result).toBe(true);
  });

  it('should send agent welcome email', async () => {
    const result = await service.sendAgentWelcomeEmail('user@test.com', 'John');
    expect(result).toBe(true);
  });

  it('should send agent rejection email', async () => {
    const result = await service.sendRejectionEmail('user@test.com', 'John');
    expect(result).toBe(true);
  });

  it('should send password recovery email', async () => {
    const result = await service.sendPasswordRecoveryEmail('user@test.com', 'John', 'token123');
    expect(result).toBe(true);
    expect(transporterMock.sendMail).toHaveBeenCalled();
  });

  it('should handle sendMail errors gracefully', async () => {
    transporterMock.sendMail.mockRejectedValueOnce(new Error('SMTP error'));
    const result = await service.sendWelcomeEmail('user@test.com', 'John');
    expect(result).toBe(false);
  });
});
