// import { Provider } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
// import { AppConfigService } from '../config/config.service';

// export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

// export const EmailProvider: Provider = {
//   provide: EMAIL_TRANSPORTER,
//   useFactory: async (configService: AppConfigService) => {
//     const transporter = nodemailer.createTransport({
//       service: configService.emailService,
//       auth: {
//         user: configService.emailUser,
//         pass: configService.emailPass,
//       },
//     });

//     await transporter.verify();
//     console.log(' Email transporter ready');

//     return transporter;
//   },
//   inject: [AppConfigService],
// };

// import { Provider, Logger } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
// import { AppConfigService } from '../config/config.service';

// export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

// export const EmailProvider: Provider = {
//   provide: EMAIL_TRANSPORTER,
//   useFactory: async (configService: AppConfigService) => {
//     const logger = new Logger('EmailProvider');

//     const transporter = nodemailer.createTransport({
//       host: configService.emailHost,      // p.sh. smtp.brevo.com
//       port: configService.emailPort,      // 587 (STARTTLS) ose 465 (SSL)
//       secure: configService.emailPort === 465,
//       auth: {
//         user: configService.emailUser,
//         pass: configService.emailPass,
//       },
//       pool: true,                 // ripërdor lidhjet për shumë emaile
//       maxConnections: 5,
//       maxMessages: 100,
//     });

//     try {
//       await transporter.verify();
//       logger.log('Email transporter ready');
//     } catch (err) {
//       // mos e blloko startup-in nëse SMTP s'përgjigjet për momentin
//       logger.error('Email transporter verification failed', err);
//     }

//     return transporter;
//   },
//   inject: [AppConfigService],
// };

import { Provider, Logger } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';

export const EMAIL_TRANSPORTER = 'EMAIL_TRANSPORTER';

export const EmailProvider: Provider = {
  provide: EMAIL_TRANSPORTER,
  useFactory: (configService: AppConfigService) => {
    const logger = new Logger('EmailProvider');
    logger.log('Brevo HTTP email provider ready');
    return { apiKey: configService.brevoApiKey };
  },
  inject: [AppConfigService],
};
