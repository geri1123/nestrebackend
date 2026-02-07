import { ConfigService } from '@nestjs/config';

export const getBullConfig = (configService: ConfigService) => ({
  connection: {
    url: configService.get('REDIS_URL'),
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600,
      count: 100,
    },
    removeOnFail: {
      age: 86400,
      count: 50,
    },
  },
});