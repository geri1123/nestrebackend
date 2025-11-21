import { Provider } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '../config/config.service';

export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

export const EmailProvider: Provider = {
  provide: EMAIL_TRANSPORTER,
  useFactory: async (configService: AppConfigService) => {
    const transporter = nodemailer.createTransport({
      service: configService.emailService,
      auth: {
        user: configService.emailUser,
        pass: configService.emailPass,
      },
    });

    await transporter.verify();
    console.log(' Email transporter ready');

    return transporter;
  },
  inject: [AppConfigService],
};
