// email.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { AppConfigService } from '../../config/config.service';
import { EMAIL_TRANSPORTER } from '../email.provider';

describe('EmailService', () => {
  let service: EmailService;
  let mockTransporter: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    };

    mockConfigService = {
      emailUser: 'test@example.com',
      port: 'http://localhost:3000',
      clientBaseUrl: 'http://localhost:4200',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: EMAIL_TRANSPORTER, useValue: mockTransporter },
        { provide: AppConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendVerificationEmail', () => {
    it('should throw error if token is empty', async () => {
      await expect(
        service.sendVerificationEmail('test@example.com', 'John', ''),
      ).rejects.toThrow('Verification token cannot be empty');
    });

    it('should send email with correct verification link (Albanian)', async () => {
      await service.sendVerificationEmail('test@example.com', 'John', 'token123', 'al');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Verify Your Account',
          html: expect.stringContaining('http://localhost:3000/verify-email?token=token123'),
        }),
      );
    });

    it('should include language segment for non-Albanian', async () => {
      await service.sendVerificationEmail('test@example.com', 'John', 'token123', 'en');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('http://localhost:3000/en/verify-email?token=token123'),
        }),
      );
    });

    it('should return true on successful send', async () => {
      const result = await service.sendVerificationEmail('test@example.com', 'John', 'token123');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));
      const result = await service.sendVerificationEmail('test@example.com', 'John', 'token123');
      expect(result).toBe(false);
    });
  });

  describe('sendPasswordRecoveryEmail', () => {
    it('should generate correct reset link with language', async () => {
      const token = 'reset-token';
      await service.sendPasswordRecoveryEmail('test@example.com', 'John', token, 'en');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('http://localhost:4200/en/recover-password?token=reset-token'),
        }),
      );
    });

    it('should use default expiration if not provided', async () => {
      const beforeCall = Date.now();
      await service.sendPasswordRecoveryEmail('test@example.com', 'John', 'token123');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toMatch(/exp=\d{13}/);
    });
  });

  // Test other email methods similarly
  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const result = await service.sendWelcomeEmail('test@example.com', 'John');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Welcome to Real Estate Platform',
        }),
      );
      expect(result).toBe(true);
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { EmailService } from '../email.service';
// import { EMAIL_TRANSPORTER, EmailProvider } from '../email.provider';
// import { AppConfigService } from '../../config/config.service';
// import type { Transporter } from 'nodemailer';

// // --- Mock templates ---
// jest.mock('../tamplates', () => ({
//   verificationEmailTemplate: jest.fn((name, link) => `Verification: ${name}, ${link}`),
//   welcomeEmailTemplate: jest.fn((name) => `Welcome: ${name}`),
//   pendingApprovalEmailTemplate: jest.fn((name) => `Pending: ${name}`),
//   changePasswordTemplate: jest.fn((name) => `ChangePassword: ${name}`),
//   AgentWellcomeEmailTemplate: jest.fn((name) => `AgentWelcome: ${name}`),
//   AgentRejectedEmailTemplate: jest.fn((name) => `AgentRejected: ${name}`),
//   passwordRecoveryTemplate: jest.fn((name, link) => `Recovery: ${name}, ${link}`),
// }));

// describe('EmailService', () => {
//   let service: EmailService;
//   let transporterMock: jest.Mocked<Transporter>;
//   let configServiceMock: Partial<AppConfigService>;

//   beforeAll(() => {
//     // Silence Nest logger during tests
//     jest.spyOn(console, 'error').mockImplementation(() => {});
//     jest.spyOn(console, 'log').mockImplementation(() => {});
//   });

//   beforeEach(async () => {
//     transporterMock = {
//       sendMail: jest.fn().mockResolvedValue({}),
//     } as any;

//     configServiceMock = {
//       emailUser: 'test@example.com',
//       clientBaseUrl: 'http://localhost:3000',
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         EmailService,
//         { provide: EMAIL_TRANSPORTER, useValue: transporterMock },
//         { provide: AppConfigService, useValue: configServiceMock },
//       ],
//     }).compile();

//     service = module.get<EmailService>(EmailService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('should send verification email', async () => {
//     const result = await service.sendVerificationEmail('user@test.com', 'John', 'token123');
//     expect(result).toBe(true);
//     expect(transporterMock.sendMail).toHaveBeenCalledWith(
//       expect.objectContaining({
//         to: 'user@test.com',
//         subject: 'Verify Your Account',
//         html: expect.stringContaining('Verification: John'),
//       }),
//     );
//   });

//   it('should throw error if verification token is empty', async () => {
//     await expect(
//       service.sendVerificationEmail('user@test.com', 'John', ''),
//     ).rejects.toThrow('Verification token cannot be empty');
//   });

//   it('should send welcome email', async () => {
//     const result = await service.sendWelcomeEmail('user@test.com', 'John');
//     expect(result).toBe(true);
//     expect(transporterMock.sendMail).toHaveBeenCalledWith(
//       expect.objectContaining({
//         to: 'user@test.com',
//         subject: 'Welcome to Real Estate Platform',
//         html: expect.stringContaining('Welcome: John'),
//       }),
//     );
//   });

//   it('should send pending approval email', async () => {
//     const result = await service.sendPendingApprovalEmail('user@test.com', 'John');
//     expect(result).toBe(true);
//     expect(transporterMock.sendMail).toHaveBeenCalled();
//   });

//   it('should send change password email', async () => {
//     const result = await service.sendChangePasswordEmail('user@test.com', 'John');
//     expect(result).toBe(true);
//   });

//   it('should send agent welcome email', async () => {
//     const result = await service.sendAgentWelcomeEmail('user@test.com', 'John');
//     expect(result).toBe(true);
//   });

//   it('should send agent rejection email', async () => {
//     const result = await service.sendRejectionEmail('user@test.com', 'John');
//     expect(result).toBe(true);
//   });

//   it('should send password recovery email', async () => {
//     const result = await service.sendPasswordRecoveryEmail('user@test.com', 'John', 'token123');
//     expect(result).toBe(true);
//     expect(transporterMock.sendMail).toHaveBeenCalled();
//   });

//   it('should handle sendMail errors gracefully', async () => {
//     transporterMock.sendMail.mockRejectedValueOnce(new Error('SMTP error'));
//     const result = await service.sendWelcomeEmail('user@test.com', 'John');
//     expect(result).toBe(false);
//   });
// });
