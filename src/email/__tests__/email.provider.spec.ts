import { EmailProvider } from '../email.provider';
import { AppConfigService } from '../../config/config.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailProvider', () => {
  it('should create transporter', async () => {
    const sendMock = jest.fn();
    const verifyMock = jest.fn().mockResolvedValue(true);

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMock,
      verify: verifyMock,
    });

    const configService = {
      emailService: 'gmail',
      emailUser: 'test@example.com',
      emailPass: 'pass123',
    } as AppConfigService;

    const transporter = await (EmailProvider as any).useFactory(configService);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'test@example.com', pass: 'pass123' },
    });
    expect(transporter.verify).toBeDefined();
  });
});
