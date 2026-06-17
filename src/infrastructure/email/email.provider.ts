

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
